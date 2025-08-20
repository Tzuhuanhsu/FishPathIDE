import * as cc from "cc";
import { ICustomPointInfo } from "./CustomEventNode";
export interface IPathInfo 
{
    Waypoints: ICustomPointInfo[],
    SegmentCount: number,
}

//路徑資料
export class PathInfo implements IPathInfo
{
    // 快取相關屬性 - 運行時計算，避免序列化
    private _cachedBezierPoints: cc.Vec3[] = [];
    private _cachedArcLengths: number[] = [];
    private _totalLength: number = -1;
    private _isDirty: boolean = true;

    constructor(
        public Waypoints: ICustomPointInfo[] = [],
        public SegmentCount: number = 20,
    )
    {
        // 確保快取屬性不會被序列化
        this.resetCache();
    }

    /**
     * 重置快取 - 在構造函數和反序列化後調用
    */
    private resetCache(): void
    {
        this._cachedBezierPoints.length = 0;
        this._cachedArcLengths.length = 0;
        this._totalLength = -1;
        this._isDirty = true;
    }


    /**
     * 設置路徑點和段數
     * @param pathInfo 
    */
    SetWaypoints( pathInfo: IPathInfo )
    {
        //先將　value 當中的 pos 屬性轉換為 cc.Vec3
        this.Waypoints = pathInfo.Waypoints.map( wp =>
        {
            return {
                pos: new cc.Vec3( wp.pos.x, wp.pos.y, wp.pos.z ),
                beginScale: wp.beginScale ?? 1,
                endScale: wp.endScale ?? 1,
                delayTime: wp.delayTime ?? 0,
                customEvent: wp.customEvent ?? "",
            };
        } );

        this.SegmentCount = pathInfo.SegmentCount ?? this.SegmentCount;
        this.invalidateCache();
    }

    /**
    * 根據 Catmull - Rom 取得平滑 Bezier 所有段的取樣點 (使用快取)
    */
    public getSmoothBezierPoints(): cc.Vec3[]
    {
        // 如果快取有效且非空，直接返回
        if ( !this._isDirty && this._cachedBezierPoints && this._cachedBezierPoints.length > 0 )
        {
            return this._cachedBezierPoints;
        }

        // 重新計算並快取
        this._cachedBezierPoints = this.calculateSmoothBezierPoints();
        this._isDirty = false;

        return this._cachedBezierPoints;
    }

    /**
     * 實際計算 Bezier 點的方法
     */
    private calculateSmoothBezierPoints(): cc.Vec3[]
    {
        const result: cc.Vec3[] = [];

        if ( !this.Waypoints || this.Waypoints.length < 2 )
        {
            return result;
        }

        const pts = this.Waypoints.map( wp => wp.pos );

        if ( !this.SegmentCount || this.SegmentCount <= 0 )
        {
            return result;
        }

        for ( let i = 0; i < pts.length - 1; i++ )
        {
            const p0 = pts[ Math.max( 0, i - 1 ) ];
            const p1 = pts[ i ];
            const p2 = pts[ i + 1 ];
            const p3 = pts[ i + 2 < pts.length ? i + 2 : i + 1 ];

            // 計算 tangent（調整倍數讓曲線更均勻）
            const t1 = p2.clone().subtract( p0 ).multiplyScalar( 0.3 );
            const t2 = p3.clone().subtract( p1 ).multiplyScalar( 0.3 );

            // 轉為 Bezier 控制點（tangent 版）
            const b0 = p1.clone();
            const b1 = p1.clone().add( t1.clone().multiplyScalar( 1 / 3 ) );
            const b2 = p2.clone().subtract( t2.clone().multiplyScalar( 1 / 3 ) );
            const b3 = p2.clone();

            for ( let s = 0; s <= this.SegmentCount; s++ )
            {
                const t = s / this.SegmentCount;
                const p = this.calculateBezierPoint( t, b0, b1, b2, b3 );
                result.push( p );
            }
        }

        return result;
    }
    /**
     * 計算三次貝塞爾曲線上的點
     * @param t 參數 t (0到1之間)
     * @returns 貝塞爾曲線上的點
     */
    public calculateBezierPoint( t: number, fistPos: cc.Vec3, secPos: cc.Vec3, thirdPos: cc.Vec3, fourPos: cc.Vec3 ): cc.Vec3
    {
        const p0 = fistPos;
        const p1 = secPos;
        const p2 = thirdPos;
        const p3 = fourPos;

        // 三次貝塞爾曲線公式: B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
        const oneMinusT = 1 - t;
        const oneMinusTSquared = oneMinusT * oneMinusT;
        const oneMinusTCubed = oneMinusTSquared * oneMinusT;
        const tSquared = t * t;
        const tCubed = tSquared * t;

        const x = oneMinusTCubed * p0.x +
            3 * oneMinusTSquared * t * p1.x +
            3 * oneMinusT * tSquared * p2.x +
            tCubed * p3.x;

        const y = oneMinusTCubed * p0.y +
            3 * oneMinusTSquared * t * p1.y +
            3 * oneMinusT * tSquared * p2.y +
            tCubed * p3.y;

        const z = oneMinusTCubed * p0.z +
            3 * oneMinusTSquared * t * p1.z +
            3 * oneMinusT * tSquared * p2.z +
            tCubed * p3.z;

        return new cc.Vec3( x, y, z );
    }


    /**
     * 獲取指定參數 t 位置的點（使用弧長插值）
     * @param t 參數 t (0到1之間)
     * @returns 貝塞爾曲線上的點
     */
    public getPointAtT( t: number ): cc.Vec3
    {
        return this.getPointAtArcLength( t );
    }

    /**
     * 獲取指定弧長比例位置的點（等速運動）- 使用快取優化
     * @param t 弧長比例 (0到1之間)
     * @returns 貝塞爾曲線上的點
     */
    public getPointAtArcLength( t: number ): cc.Vec3
    {
        if ( !this.Waypoints || this.Waypoints.length < 2 )
        {
            return cc.Vec3.ZERO;
        }

        const points = this.getSmoothBezierPoints(); // 使用快取的點

        if ( !points || points.length === 0 )
        {
            return cc.Vec3.ZERO;
        }

        if ( t <= 0 )
        {
            return points[ 0 ] || cc.Vec3.ZERO;
        }
        if ( t >= 1 )
        {
            return points[ points.length - 1 ] || cc.Vec3.ZERO;
        }

        // 使用快取的弧長數據
        const { segmentLengths, totalLength } = this.getCachedArcLengthData( points );

        // 目標弧長
        const targetLength = t * totalLength;

        // 找到目標弧長所在的線段
        let currentLength = 0;
        for ( let i = 0; i < segmentLengths.length; i++ )
        {
            const nextLength = currentLength + segmentLengths[ i ];

            if ( targetLength <= nextLength )
            {
                // 在這個線段中
                const segmentProgress = segmentLengths[ i ] > 0 ?
                    ( targetLength - currentLength ) / segmentLengths[ i ] : 0;

                const result = new cc.Vec3();
                cc.Vec3.lerp( result, points[ i ], points[ i + 1 ], segmentProgress );
                return result;
            }

            currentLength = nextLength;
        }

        // 如果沒找到，返回終點
        return points[ points.length - 1 ];
    }

    /**
     * 獲取快取的弧長數據
     */
    private getCachedArcLengthData( points: cc.Vec3[] ): { segmentLengths: number[], totalLength: number }
    {
        // 確保快取已初始化
        if ( !this._cachedArcLengths )
        {
            this._cachedArcLengths = null;
        }
        if ( this._totalLength === undefined )
        {
            this._totalLength = -1;
        }

        // 如果快取無效，重新計算
        if ( !this._cachedArcLengths || this._totalLength < 0 )
        {
            const segmentLengths: number[] = [];
            let totalLength = 0;

            for ( let i = 1; i < points.length; i++ )
            {
                const segmentLength = cc.Vec3.distance( points[ i - 1 ], points[ i ] );
                segmentLengths.push( segmentLength );
                totalLength += segmentLength;
            }

            this._cachedArcLengths = segmentLengths;
            this._totalLength = totalLength;
        }

        return {
            segmentLengths: this._cachedArcLengths,
            totalLength: this._totalLength
        };
    }

    /**
     * 使快取失效 - 當路徑參數改變時調用
     */
    public invalidateCache(): void
    {
        this._isDirty = true;
        this._cachedBezierPoints.length = 0;
        this._cachedArcLengths.length = 0;
        this._totalLength = -1;
    }

    /**
   * 取得路徑總長度 - 使用快取
   * @returns 路徑長度（float）
   */
    public getTotalLength(): number
    {
        if ( !this.Waypoints || this.Waypoints.length < 2 ) return 0;

        // 確保快取已初始化
        if ( this._totalLength === undefined )
        {
            this._totalLength = -1;
        }

        // 使用快取的總長度
        if ( this._totalLength < 0 )
        {
            const points = this.getSmoothBezierPoints();
            this.getCachedArcLengthData( points ); // 這會設置 _totalLength
        }

        return this._totalLength;
    }
    /**
     * 取得路徑的平均速度
     * @param totalTime 總時間
     * 如果路徑長度為0，則返回0
     * 如果總時間為0，則返回無限大
     * @param totalTime 
     * @returns 
     */
    public GetAverageSpeed( totalTime: number ): number
    {
        if ( !this.Waypoints || this.Waypoints.length < 2 ) return 0;
        const totalLength = this.getTotalLength();
        if ( totalLength === 0 ) return 0;
        return totalLength / totalTime;
    }
}
