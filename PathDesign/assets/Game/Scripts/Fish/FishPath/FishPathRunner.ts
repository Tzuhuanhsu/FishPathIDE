import * as cc from "cc";
import { EnumFishPathID, IEntityData } from "../FishDefine";
import { TimelineMgr } from "../../TimelineMgr/TimelineMgr";
import { PathInfo, IPathInfo } from "./PathInfo";


const { ccclass, property } = cc._decorator;
const MIN_DIRECTION_THRESHOLD = 0.01; // 最小方向閾值，用於避免不必要的計算
const MIN_ROTATION_THRESHOLD = 0.01; // 最小旋轉閾值，用於避免不必要的旋轉計算
@ccclass( 'FishPathRunner' )
export class FishPathRunner extends cc.Component
{

    @property( { type: cc.CCFloat, unit: "s", tooltip: "延遲時間" } )
    delayTime: number = 0;

    //腳本資料
    pathData: cc.JsonAsset = null;

    private _scriptId: EnumFishPathID = EnumFishPathID.Normal_1;
    //魚的流水號ID
    private _fishId: number = -1;
    //魚位置數據
    private _fishPathInfo: PathInfo = new PathInfo();
    //當前方向
    private _direction: cc.Vec3 = cc.Vec3.ZERO;
    // 是否有延遲
    private _delay: boolean = false;
    // 是否結束
    private _isEnd: boolean = false;

    private _tmpDirection = new cc.Vec3();
    private _entityData: IEntityData = null;

    // 旋轉相關
    private _currentAngle = 0;        // 當前角度
    private _targetAngle = 0;         // 目標角度
    private _rotationLerpSpeed = 10;   // 插值速度 (數值越大轉得越快)
    private _spawnTime = 0;
    private _elapsedTime = 0; //經過的時間



    //魚的流水號ID
    set FishId( id: number )
    {
        this._fishId = id;
    }

    get FishId(): number
    {
        return this._fishId;
    }

    //腳本ID
    set ScriptId( id: EnumFishPathID )
    {
        this._scriptId = id;
    }
    get ScriptId(): EnumFishPathID
    {
        return this._scriptId;
    }

    /**
     * 設定腳本
     */
    Setup(): boolean
    {
        // 重置狀態
        this._isEnd = false;
        this._delay = false;
        this._spawnTime = TimelineMgr.Instance.ClientTime;
        this._elapsedTime = 0;
        try
        {
            // 驗證路徑資料
            if ( !this.pathData )
            {
                throw `[FishPathRunner] Path data is not set for fish ${this._fishId}`;
            }
            const pathInfo = this.pathData.json as unknown as IPathInfo
            if ( !pathInfo )
            {
                throw `[FishPathRunner] No fish position data available for fish ${this._fishId}`;
            }

            this._fishPathInfo.SetWaypoints( pathInfo );
            this.node.setPosition( this._fishPathInfo.getPointAtT( 0 ) );
            this.node.active = true;
            return true;
        }
        catch ( error )
        {
            console.error( `[FishPathRunner] Failed to parse path data:`, error );
            return false;
        }
    }


    /**
     * 更新角度
     * @param dt 
     * @returns 
     */
    private updateRotation( dt: number )
    {
        if ( this._delay || this._direction.lengthSqr() === 0 )
        {
            return;
        }

        // 計算目標角度
        const targetAngleRad = Math.atan2( this._direction.y, this._direction.x );
        const targetAngle = cc.math.toDegree( targetAngleRad );
        if ( Math.abs( this._targetAngle - targetAngle ) < MIN_ROTATION_THRESHOLD )
        {
            return; // 如果目標角度沒有變化，則不需要更新
        }

        this._targetAngle = targetAngle;
        // 每幀都執行平滑旋轉插值（不需要重新計算目標角度）
        let angleDiff = this._targetAngle - this._currentAngle;

        // 確保角度差在 -180 到 180 度之間
        while ( angleDiff > 180 ) angleDiff -= 360;
        while ( angleDiff < -180 ) angleDiff += 360;

        // 使用平滑插值進行旋轉
        const lerpFactor = 1 - Math.exp( -this._rotationLerpSpeed * dt );
        this._currentAngle += angleDiff * lerpFactor;

        // 確保角度在 0-360 範圍內
        this._currentAngle = ( this._currentAngle + 360 ) % 360;

        this.node.setWorldRotationFromEuler( 0, 0, this._currentAngle );
    }



    /**
     * 更新腳本路徑
     * @param dt 
     * @returns 
     */
    updatePosition( dt: number ): void
    {
        if ( !this._fishPathInfo || this._delay || this._isEnd )
        {
            return;
        }

        // 計算當前應該到達的目標位置（純時間驅動）
        const t = Math.max( 0, Math.min( 1, this._elapsedTime / this.EntityData.Time ) );
        const targetPos = this._fishPathInfo.getPointAtArcLength( t );

        // 如果已經到達路徑終點 (t >= 1)，標記為結束
        if ( t >= 1 )
        {
            this.node.setPosition( targetPos );
            this._isEnd = true;
            return;
        }

        // 直接設定到時間對應的位置
        this.node.setPosition( targetPos );

        // 計算方向用於旋轉（直接使用路徑位置計算，避免縮放影響）
        const prevT = Math.max( 0, Math.min( 1, ( this._elapsedTime - dt ) / this.EntityData.Time ) );
        const prevPos = this._fishPathInfo.getPointAtArcLength( prevT );

        this._tmpDirection.set( targetPos ).subtract( prevPos );
        if ( this._tmpDirection.lengthSqr() > MIN_DIRECTION_THRESHOLD )
        {
            this._direction = this._tmpDirection.normalize();
        }
    }

    // 在 FishPathRunner 中新增方法
    public accelerateToEnd( speedMultiplier: number = 2 ): void
    {
        if ( this._isEnd || !this.EntityData ) return;

        // 計算當前進度
        const currentProgress = this._elapsedTime / this.EntityData.Time;

        // 計算剩餘路徑需要的時間（壓縮後）
        const remainingTime = ( 1 - currentProgress ) * this.EntityData.Time;
        const newRemainingTime = remainingTime / speedMultiplier;

        // 調整總時間，讓剩餘路徑在更短時間內完成
        this.EntityData.Time = this._elapsedTime + newRemainingTime;
    }


    get IsEnd(): boolean
    {
        return this._isEnd;
    }

    set EntityData( data: IEntityData )
    {
        this._entityData = data;
    }

    get EntityData(): IEntityData
    {
        return this._entityData;
    }

    onUpdate( dt: number ): void
    {
        if ( this._isEnd )
        {
            return;
        }

        this._elapsedTime = TimelineMgr.Instance.ClientTime - this._spawnTime;
        this.updatePosition( dt );
        this.updateRotation( dt );
    }
}