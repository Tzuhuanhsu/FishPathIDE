import { _decorator, Component, Node } from 'cc';
import { FactoryManager } from '../Factory/FactoryManager';
import { FishPathRunner } from './FishPath/FishPathRunner';
import { Fish } from './Fish';
import { FishPathMgr } from './FishPath/FishPathMgr';
import { FSMachine } from '../Common/FSMachine';
import { TimelineMgr } from '../TimelineMgr/TimelineMgr';
import { IEntityData } from './FishDefine';
const { ccclass, property } = _decorator;

enum FishMgrState
{
    Idle,
    Init,
    Sync,
    Running,
    Timeout,
}

//檢查腳本是否結束的間隔
const Check_SyncInterval = 10; // 每10幀檢查一次腳本是否結束
// 測試用的腳本ID
const testScriptID = 1;
/**
 * 魚群管理
 */
@ccclass( 'FishMgr' )
export class FishMgr extends Component
{

    @property( FishPathMgr )
    private fishPathMgr: FishPathMgr = null;

    private _state: FSMachine<FishMgrState> = new FSMachine<FishMgrState>( FishMgrState.Idle );
    private static _instance: FishMgr = null;

    private _liveFish: Fish[] = [];

    // 效能優化用的屬性
    private frameCounter: number = 0;
    // 這裡用來存放需要移除的 FishPathRunner
    private runnersToRemove: FishPathRunner[] = [];


    public static get Instance(): FishMgr
    {
        if ( !this._instance )
        {
            this._instance = new FishMgr();
        }
        return this._instance;
    }

    private static set Instance( instance: FishMgr )
    {
        this._instance = instance;
    }

    start()
    {
        FishMgr.Instance = this;
        this.initFSM();
        this._state.NextState = FishMgrState.Init;
    }

    private initFSM()
    {
        this._state.AddOnceEvent( FishMgrState.Init, this.onInit.bind( this ) );
        this._state.AddOnceEvent( FishMgrState.Sync, this.SyncFishPathData.bind( this ) );
        this._state.AddForeverEvent( FishMgrState.Running, this.onRunning.bind( this ) );
    }

    private onInit()
    {
        this.fishPathMgr.Init();
        TimelineMgr.Instance.ScriptId = testScriptID;
        this._state.NextState = FishMgrState.Sync;
    }

    /**
     * 同步目前的狀態
     */
    public SyncFishPathData()
    {
        this.fishPathMgr.SetScript();
        TimelineMgr.Instance.ClientTime = 0;
        this._state.NextState = FishMgrState.Running;
    }

    /**
     * 根據 IEntityData 新增魚
     */
    private AddFishFromEntityData( entityData: IEntityData ): void
    {
        if ( !entityData )
        {
            console.error( "Invalid entity data." );
            return;
        }

        const newFish = FactoryManager.Instance.GetFactoryFx( entityData.FactoryType );
        const fish = newFish.getComponent( Fish );
        if ( !fish )
        {
            console.error( "Fish component not found on fish prefab." );
            return;
        }

        fish.FishId = entityData.id;
        fish.FishType = entityData.FactoryType;

        const fishPathRunner = fish.FishPathRunner;
        if ( !fishPathRunner )
        {
            console.error( "FishPathRunner component not found on fish prefab." );
            return;
        }

        // 設定魚的路徑運行器
        fishPathRunner.FishId = fish.FishId;
        fishPathRunner.ScriptId = entityData.pathNo;
        fishPathRunner.pathData = this.fishPathMgr.GetPathInfo( entityData.pathNo );
        fishPathRunner.delayTime = 0;
        fishPathRunner.EntityData = entityData;
        fishPathRunner.Setup();

        // 將魚加入到管理器中
        this._liveFish.push( fish );
        this.fishPathMgr.AddFishRunner( fishPathRunner );
        this.fishPathMgr.InsertLiveFish( entityData );
    }

    /**
     * 處理待出場的魚群
     */
    private processPendingSpawnFish(): void
    {
        const pendingFish = this.fishPathMgr.PendingSpawnFish;
        if ( pendingFish.length === 0 ) return;

        // 處理所有待出場的魚
        for ( const entityData of pendingFish )
        {
            this.AddFishFromEntityData( entityData );
        }
    }

    /**
     * 更新魚群路徑運行器
     * @param dt 
     */
    private onRunning( dt: number )
    {
        // 優化：減少檢查頻率，每 10 幀檢查一次腳本是否結束
        if ( !this.frameCounter ) this.frameCounter = 0;
        this.frameCounter++;

        if ( this.frameCounter % Check_SyncInterval === 0 && this.fishPathMgr.CheckMainScriptIsEnd() )
        {
            this._state.NextState = FishMgrState.Sync;
            return;
        }

        const pendingFishCount = this.fishPathMgr.PendingSpawnFish.length;
        if ( pendingFishCount > 0 ) 
        {
            this.processPendingSpawnFish();
        }

        if ( !this.runnersToRemove ) this.runnersToRemove = [];
        this.runnersToRemove.length = 0;

        const runners = this.fishPathMgr.GetFishRunner();
        for ( let i = 0; i < runners.length; i++ )
        {
            const runner = runners[ i ];
            if ( runner.IsEnd )
            {
                // 如果魚已經結束，標記為需要移除
                this.runnersToRemove.push( runner );
            }
            else
            {
                // 只有未結束的魚才需要更新
                runner.onUpdate( dt );

                // 更新後再次檢查是否結束
                if ( runner.IsEnd )
                {
                    this.runnersToRemove.push( runner );
                }
            }
        }

        // 統一處理需要移除的 runners
        for ( let i = 0; i < this.runnersToRemove.length; i++ )
        {
            const runner = this.runnersToRemove[ i ];
            this.fishPathMgr.OnFishPathEnd( runner );
            this.RemoveFish( runner.FishId );
        }
    }


    /**
     * 取得當下的魚群資訊
     */
    public GetCurrentFishInfo()
    {
        console.log( "Current live fish count:", TimelineMgr.Instance.ClientTime );
    }

    /**
     * 移除指定的魚
     * @param fishId 
     */
    public RemoveFish( fishId: number )
    {
        const fishIndex = this._liveFish.findIndex( fish => fish.FishId === fishId );
        if ( fishIndex !== -1 )
        {
            const fish = this._liveFish[ fishIndex ];
            FactoryManager.Instance.PutFactoryFx( fish.FishType, fish.node );
            this._liveFish.splice( fishIndex, 1 );
        }
    }



    protected update( dt: number ): void
    {
        TimelineMgr.Instance.Update( dt );
        this._state.Tick( dt );
    }

}


