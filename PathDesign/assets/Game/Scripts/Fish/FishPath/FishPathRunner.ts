import * as cc from "cc";
import { FishPositionInfoData } from "./FishPositionInfo";
import { EnumFishPathID, IEntityData } from "../FishDefine";
import { TimelineMgr } from "../../TimelineMgr/TimelineMgr";

const { ccclass, property } = cc._decorator;
//超時速度
const timeoutSpeed = 100;
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
    private _fishPositionInfo: FishPositionInfoData[] = [];
    //腳本索引
    private _currentIndex: number = 0;
    //當前方向
    private _direction: cc.Vec3 = cc.Vec3.ZERO;
    // 是否有延遲
    private _delay: boolean = false;
    // 是否結束
    private _isEnd: boolean = false;
    //是否超時
    private _isTimeout: boolean = false;
    private _baseSpeed = 0;           // path 段落原始速度
    private _speedScale = 1.5;          // 臨時倍率 (buff, slow)
    private _speedAdd = 0;            // 額外加成 (單位距離/秒)

    // 暫存用 Vec3，避免記憶體分配
    private _tmpPos = new cc.Vec3();
    private _tmpMove = new cc.Vec3();
    private _tmpToTarget = new cc.Vec3();
    private _tmpAfter = new cc.Vec3();
    private _tmpDirection = new cc.Vec3();
    private _entityData: IEntityData = null;

    // 旋轉相關
    private _currentAngle = 0;        // 當前角度
    private _targetAngle = 0;         // 目標角度
    private _rotationLerpSpeed = 10;   // 插值速度 (數值越大轉得越快)

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
        this._currentIndex = 0;
        this._delay = false;
        this._isTimeout = false;
        this._speedAdd = 0;

        // 驗證路徑資料
        if ( !this.pathData )
        {
            console.error( `[FishPathRunner] Path data is not set for fish ${this._fishId}` );
            return false;
        }

        try
        {
            this._fishPositionInfo = this.pathData.json as FishPositionInfoData[];
        }
        catch ( error )
        {
            console.error( `[FishPathRunner] Failed to parse path data:`, error );
            return false;
        }

        if ( !this._fishPositionInfo || this._fishPositionInfo.length === 0 )
        {
            console.error( `[FishPathRunner] No fish position data available for fish ${this._fishId}` );
            return false;
        }

        // 驗證路徑資料完整性
        for ( let i = 0; i < this._fishPositionInfo.length; i++ )
        {
            const point = this._fishPositionInfo[ i ];
            if ( !point.position || point.speed === undefined || point.speed <= 0 )
            {
                console.error( `[FishPathRunner] Invalid path data at index ${i} for fish ${this._fishId}` );
                return false;
            }
        }

        // 設定初始位置
        this.applyFishTransform( 0 );
        this.node.active = true;

        // 初始化當前角度
        this._currentAngle = 0;

        // 設定初始目標
        this.setNextTarget();

        // 補正時間差
        this.fixedPosition();

        return true;
    }

    //應用魚位置數據到節點
    private applyFishTransform( index: number )
    {
        const target = this._fishPositionInfo[ index ];
        this.node.setWorldPosition( cc.v3( target.position ) );
    }

    //設定下一個目標
    private setNextTarget()
    {
        if ( this._currentIndex >= this._fishPositionInfo.length - 1 )
        {
            this._isEnd = true;
            return;
        }

        this._currentIndex++;
        const target = this._fishPositionInfo[ this._currentIndex ];

        // 計算方向
        this._tmpToTarget.set( target.position );
        cc.Vec3.subtract( this._tmpDirection, this._tmpToTarget, this.node.worldPosition );
        this._direction = this._tmpDirection.normalize();
        this._baseSpeed = target.speed;

        // 處理延遲
        if ( target.delayTime > 0 )
        {
            this._delay = true;
            this.scheduleOnce( () => { this._delay = false; }, target.delayTime );
        }
        else
        {
            this._delay = false;
        }
    }

    //切換下一個腳本
    NextScript()
    {
        this.setNextTarget();
    }
    /**
     * 補上時間差的位置
     * @param currentTime 當前時間，由外部傳入避免直接依賴 TimelineMgr
     */
    public fixedPosition( currentTime?: number )
    {
        if ( !this._entityData )
        {
            return;
        }

        const timeToUse = currentTime !== undefined ? currentTime : TimelineMgr.Instance.ClientTime;
        const timeDiff = timeToUse - this._entityData.joinTime;
        if ( timeDiff <= 0 )
        {
            return;
        }

        // 模擬路徑移動
        let currentIndex = 0;
        let remainingTime = timeDiff;
        this._tmpPos.set( this._fishPositionInfo[ 0 ].position );

        while ( remainingTime > 0 && currentIndex < this._fishPositionInfo.length - 1 )
        {
            const nextIndex = currentIndex + 1;
            const currentPoint = this._fishPositionInfo[ currentIndex ];
            const nextPoint = this._fishPositionInfo[ nextIndex ];

            // 計算段距離和時間
            this._tmpToTarget.set( currentPoint.position );
            this._tmpAfter.set( nextPoint.position );
            const segmentDistance = cc.Vec3.distance( this._tmpToTarget, this._tmpAfter );
            const segmentTime = segmentDistance / nextPoint.speed + ( nextPoint.delayTime || 0 );

            if ( remainingTime >= segmentTime )
            {
                this._tmpPos.set( nextPoint.position );
                remainingTime -= segmentTime;
                currentIndex = nextIndex;
            }
            else
            {
                // 在段中間
                const actualMoveTime = Math.max( 0, remainingTime - ( nextPoint.delayTime || 0 ) );
                if ( actualMoveTime > 0 )
                {
                    const moveDistance = nextPoint.speed * actualMoveTime;
                    cc.Vec3.subtract( this._tmpDirection, this._tmpAfter, this._tmpToTarget );
                    this._tmpDirection.normalize().multiplyScalar( moveDistance );
                    this._tmpPos.set( this._tmpToTarget ).add( this._tmpDirection );
                }
                else
                {
                    this._tmpPos.set( this._tmpToTarget );
                }
                break;
            }
        }

        // 設定位置和狀態
        this.node.setWorldPosition( this._tmpPos );
        this._currentIndex = currentIndex;

        if ( currentIndex < this._fishPositionInfo.length - 1 )
        {
            this.setNextTarget();
        }
        else
        {
            this._isEnd = true;
        }
    }

    //更新旋轉
    private updateRotation( dt: number )
    {
        if ( this._delay || this._direction.lengthSqr() === 0 )
        {
            return;
        }

        // 計算目標角度
        const targetAngleRad = Math.atan2( this._direction.y, this._direction.x );
        this._targetAngle = cc.math.toDegree( targetAngleRad );

        // 計算角度差異，處理角度跨越問題
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

    //更新路徑
    updatePosition( dt: number )
    {
        if ( this._fishPositionInfo.length === 0 || this._delay || this._isEnd )
        {
            return;
        }

        const curSpeed = this.getCurrentSpeed();
        this._tmpMove.set( this._direction ).multiplyScalar( curSpeed * dt );
        this._tmpPos.set( this.node.worldPosition ).add( this._tmpMove );

        // 檢查是否到達目標
        const targetPos = this._fishPositionInfo[ this._currentIndex ].position;
        this._tmpToTarget.set( targetPos );
        cc.Vec3.subtract( this._tmpToTarget, this._tmpToTarget, this.node.worldPosition );
        this._tmpAfter.set( this._tmpToTarget ).subtract( this._tmpMove );

        if ( this._tmpToTarget.dot( this._tmpAfter ) <= 0 )
        {
            // 到達目標點
            this.node.setWorldPosition( cc.v3( targetPos ) );
            this.NextScript();
        }
        else
        {
            this.node.setWorldPosition( this._tmpPos );
        }
    }

    get Index(): number
    {
        return this._currentIndex;
    }

    get IsEnd(): boolean
    {
        return this._isEnd;
    }


    get FishPositionInfo(): FishPositionInfoData[]
    {
        return this._fishPositionInfo;
    }

    set EntityData( data: IEntityData )
    {
        this._entityData = data;
    }

    get EntityData(): IEntityData
    {
        return this._entityData;
    }

    private set FishPositionInfo( info: FishPositionInfoData[] )
    {
        this._fishPositionInfo = info;
    }

    onUpdate( dt: number ): void
    {
        this.updatePosition( dt );
        this.updateRotation( dt );
    }

    /**
     * 是否超時
     */
    get IsTimeout(): boolean
    {
        return this._isTimeout;
    }
    set IsTimeout( value: boolean )
    {
        this._isTimeout = value;
        if ( this._isTimeout )
        {
            this.changeSpeed();
        }
    }

    private changeSpeed()
    {
        this._speedAdd = timeoutSpeed;
    }

    // 目前實際速度：
    private getCurrentSpeed(): number
    {
        const base = this._baseSpeed;
        return base * this._speedScale + this._speedAdd;
    }
}