import * as cc from "cc";
import { FishPathIDSetting } from "./FishPathSetting";
import { FishPathRunner } from "./FishPathRunner";
import { TimelineMgr } from "../../TimelineMgr/TimelineMgr";
import { EnumFishPathID, IEntityData, IGroupData, IGroupScript, IMainScript, ISubScript, ISubScriptMap, MAX_LIVE_FISH } from "../FishDefine";

const { ccclass, property } = cc._decorator;


/**
 * 魚群路徑管理器
 */
@ccclass( 'FishPathMgr' )
export class FishPathMgr extends cc.Component
{
    @property( { type: cc.JsonAsset, tooltip: "MainScript", displayName: "MainScript", visible: true } )
    private mainScript: cc.JsonAsset = null;

    @property( { type: cc.JsonAsset, tooltip: "Sub Script", displayName: "Sub Script", visible: true } )
    private subScript: cc.JsonAsset = null;

    @property( { type: cc.JsonAsset, tooltip: "Group Script", displayName: "Group Script", visible: true } )
    private groupScript: cc.JsonAsset = null;

    @property( { type: FishPathIDSetting, tooltip: "Fish Path ID Setting", displayName: "Fish Path ID Setting" } )
    pathIDSetting: FishPathIDSetting = null;




    //魚群腳本運行管理
    private fishPathRunners: FishPathRunner[] = [];
    //所有的Main腳本
    private _mainScripts: IMainScript[] = [];
    //所有的的子腳本
    private _subScripts: ISubScriptMap = {};
    //所有的Group腳本
    private _groupScripts: IGroupScript[] = [];
    //最後一個主腳本ID
    private _lastMainScriptId: number = 0;
    //目前的主腳本
    private _currentScript: IMainScript = null;
    // 還未出場魚群資料
    private _pendingFish: IEntityData[] = [];
    //要出場的魚群資料
    private _pendingSpawnFish: IEntityData[] = [];
    //出場的魚群資料
    private _liveFish: IEntityData[] = [];
    //魚的流水號
    private _fishLastSerial: number = 0;



    // 清理計數器
    private _cleanupCounter: number = 0;
    private readonly CLEANUP_INTERVAL = 300; // 每300幀清理一次
    //初始化
    public Init(): void
    {
        this.clearAllArrays();
        this.loadGroupScript();
        this.loadSubScript();
        this.loadMainScript();
    }

    /**
     * 清空所有陣列，防止記憶體洩漏
     */
    private clearAllArrays(): void
    {
        this._pendingFish.length = 0;
        this._pendingSpawnFish.length = 0;
        this._liveFish.length = 0;
        this.fishPathRunners.length = 0;
        this._fishLastSerial = 0;
        this._cleanupCounter = 0;
    }

    /**
     * 載入Group腳本
     * @returns 
     */
    private loadGroupScript(): void
    {
        if ( !this.groupScript )
        {
            console.error( "this.groupScript is not set." );
            return;
        }
        try
        {
            this._groupScripts = this.groupScript.json as IGroupScript[];
            //Sort the scripts by ShowTime
            Object.keys( this._groupScripts ).forEach( groupKey =>
            {
                const groups: IGroupData[] = this._groupScripts[ groupKey ];
                groups.sort( ( a, b ) => a.ShowTime - b.ShowTime );

            } );
        }
        catch ( error )
        {
            console.error( "loadScript error:", error );
        }
    }

    /**
     * 載入子腳本
     * @returns 
     */
    private loadSubScript(): void
    {
        if ( !this.subScript )
        {
            console.error( "this.subScript is not set." );
            return;
        }
        try
        {
            this._subScripts = this.subScript.json as ISubScriptMap;
        }
        catch ( error )
        {
            console.error( "loadSubScript error:", error );
        }
    }

    /**
     * 載入主腳本
     * @returns 
     */
    private loadMainScript(): void
    {
        if ( !this.mainScript )
        {
            console.error( "this.mainScript is not set." );
            return;
        }
        try
        {
            this._mainScripts = this.mainScript.json as IMainScript[];
        }
        catch ( error )
        {
            console.error( "loadMainScript error:", error );
        }
    }

    /**
     * 設定目前腳本
     * @returns 
     */
    public SetScript(): void
    {
        this._currentScript = this._mainScripts.find( script => script.MainScriptID === TimelineMgr.Instance.ScriptId );
        if ( !this._currentScript )
        {
            console.warn( `Main script with ID ${this._lastMainScriptId} not found.` );
            return;
        }
        this._lastMainScriptId = TimelineMgr.Instance.ScriptId;
        this.parserFishData();

    }

    /**
     * 解析目前腳本的魚群資料
     */
    private parserFishData()
    {
        const subScripts = this._currentScript.Subscript;
        this._pendingFish.length = 0; //清空之前的魚群資料
        for ( let i = 0; i < subScripts.length; i++ )
        {
            //解析所有的子腳本
            const Subscript: ISubScript = this._subScripts[ subScripts[ i ] ];
            if ( !Subscript )
            {
                console.warn( `Sub script with ID ${subScripts[ i ]} not found.` );
                continue;
            }
            //腳本的基本時間(每個 Subscript 都有自己基準時間)
            const scriptBaseTime = Subscript.Time;
            const groupScript: IGroupData[] = this._groupScripts[ Subscript.Script ];
            for ( let i = 0; i < groupScript.length; i++ )
            {
                const group = groupScript[ i ];
                const baseEntityData = {
                    FactoryType: group.FishId,
                    pathNo: group.PathID,
                    ShowTime: group.ShowTime,
                    scriptBaseTime,
                    IntervalTime: group.IntervalTime
                };

                const quantity = group.Quantity;
                for ( let x = 0; x < quantity; x++ )
                {
                    const entityData: IEntityData = {
                        id: this._fishLastSerial++,
                        FactoryType: baseEntityData.FactoryType,
                        pathNo: baseEntityData.pathNo,
                        joinTime: baseEntityData.ShowTime + baseEntityData.scriptBaseTime + ( x * baseEntityData.IntervalTime ),
                        Time: group.Time
                    };
                    this._pendingFish.push( entityData );
                }
            }
        }
        this._pendingFish.sort( ( a, b ) => a.joinTime - b.joinTime );
    }

    /**
     * 檢查是否有需要出場的魚群
     * @returns 
     */
    public CheckAndSpawnFish()
    {
        return this._pendingFish?.filter( fish => fish.joinTime <= TimelineMgr.Instance.ClientTime ).length > 0;
    }

    /**
     * 添加待出場的魚群
     */
    private addSpawnFish()
    {
        const currentTime = TimelineMgr.Instance.ClientTime;

        // 檢查是否超過最大待出場魚群數量
        if ( this._pendingSpawnFish.length >= MAX_LIVE_FISH )
        {
            console.warn( `[FishPathMgr] Pending spawn fish limit reached: ${MAX_LIVE_FISH}` );
            return;
        }

        // 找出所有應該出場的魚
        for ( let i = this._pendingFish.length - 1; i >= 0; i-- )
        {
            const fish = this._pendingFish[ i ];
            if ( fish.joinTime <= currentTime )
            {
                this._pendingSpawnFish.push( this._pendingFish.splice( i, 1 )[ 0 ] );
            }
        }
    }

    /**
     * 獲取待出場的魚群資料
     */
    public get PendingSpawnFish(): IEntityData[]
    {
        return this._pendingSpawnFish;
    }

    /**
     * 加入出場的魚群資料
     * @param fishData 
     */
    public InsertLiveFish( fishData: IEntityData ): void
    {

        //刪除待出場的魚群資料
        const index = this._pendingSpawnFish.findIndex( fish => fish.id === fishData.id );
        if ( index !== -1 )
        {
            this._liveFish.push( this._pendingSpawnFish.splice( index, 1 )[ 0 ] );
        }
    }

    /**
   * 獲取待出場的魚群資料
   */
    private set PendingSpawnFish( fishData: IEntityData[] )
    {
        this._pendingSpawnFish = fishData;
    }

    /**
     * 添加魚群路徑運行器
     * @param fishRunner 
     */
    public AddFishRunner( fishRunner: FishPathRunner ): void
    {
        this.fishPathRunners.push( fishRunner );
    }

    /**
     * 取得魚群路徑運行器
     * @returns 
     */
    public GetFishRunner(): FishPathRunner[]
    {
        return this.fishPathRunners;
    }

    /**
     * 檢查當前腳本是否已經結束
     * @returns 
     */
    public CheckMainScriptIsEnd(): boolean
    {

        return this.GetFishRunner().length === 0 && this._pendingSpawnFish.length === 0 && this._pendingFish.length === 0;
    }



    protected update( dt: number ): void
    {
        if ( this.CheckAndSpawnFish() )
        {
            this.addSpawnFish();
        }
    }



    // 當魚群路徑結束時，從陣列中移除
    public OnFishPathEnd( runner: FishPathRunner ): void
    {
        const index = this.fishPathRunners.indexOf( runner );
        if ( index !== -1 )
        {
            this.fishPathRunners.splice( index, 1 );
            runner.node.active = false;
        }
    }

    /**
   * 根據路徑 ID 獲取對應的路徑數據
   * @param id 
   * @returns 
   */
    public GetPathInfo( id: EnumFishPathID ): cc.JsonAsset
    {
        const info = this.pathIDSetting.PathInfo.find( ( item ) => item.PathId === id );
        if ( info )
        {
            return info.pathData;
        }
        console.warn( `Path data for ID ${id} not found.` );
        return null;
    }

}