import * as cc from "cc";
import { CustomEventNode } from "./CustomEventNode";
import { IPathInfo, PathInfo } from "./PathInfo";

const { ccclass, property, executeInEditMode, requireComponent } = cc._decorator;





@ccclass( 'FishBezierGroup' )
@executeInEditMode( true )
@requireComponent( cc.Graphics )
export class FishBezierGroup extends cc.Component
{

    @property( { type: cc.CCFloat, tooltip: "Bezier Segment Count", displayName: "Segment Count" } )
    private segmentCount: number = 20;

    @property( { type: cc.CCBoolean } )
    private refreshOnLoad: boolean = false;


    private graphics: cc.Graphics;
    private _pathInfo: PathInfo = new PathInfo();
    protected onLoad(): void
    {
        this.graphics = this.getComponent( cc.Graphics );
        if ( !this.graphics )
        {
            console.error( "FishBezierGroup requires a Graphics component." );
            return;
        }

        // 確保 PathInfo 的快取已初始化
        if ( !this._pathInfo )
        {
            this._pathInfo = new PathInfo();
        }
        this._pathInfo.invalidateCache();
    }


    protected update(): void
    {

        if ( !this.refreshOnLoad )
        {
            return;
        }

        this._pathInfo.SetWaypoints( {
            Waypoints: this.node.getComponentsInChildren( CustomEventNode ).map( wp => wp.CustomPointInfo ),
            SegmentCount: this.segmentCount
        } );

        if ( this._pathInfo.Waypoints.length < 2 )
        {
            console.warn( "Not enough waypoints to draw a path." );
            return;
        }
        this.Draw();
    }


    /**
     * 繪製路線
     * @returns 
     */
    Draw()  
    {
        if ( this._pathInfo.Waypoints.length < 2 ) return;
        this.drawPath( this._pathInfo.getSmoothBezierPoints() );
    }

    /**
     * 繪製路徑（可根據需求自定義）
     * @param points 貝塞爾曲線上的點陣列
     */
    private drawPath( points: cc.Vec3[] ): void
    {
        if ( !this.graphics ) return;
        this.drawBezierCurve( this.graphics, points );
    }

    /**
     * 使用 Graphics 組件繪製貝塞爾曲線
     * @param graphics Graphics 組件
     * @param points 貝塞爾曲線上的點陣列
     */
    private drawBezierCurve( graphics: cc.Graphics, points: cc.Vec3[] ): void
    {
        this.graphics.clear();
        if ( points.length < 2 ) return;

        // 將世界座標轉換為本地座標
        const localPoints = points.map( point =>
        {
            const localPoint = new cc.Vec3();
            this.node.inverseTransformPoint( localPoint, point );
            return localPoint;
        } );

        graphics.moveTo( localPoints[ 0 ].x, localPoints[ 0 ].y );
        for ( let i = 1; i < localPoints.length; i++ )
        {
            graphics.lineTo( localPoints[ i ].x, localPoints[ i ].y );
        }
        graphics.stroke();
    }




    /**
     * 取得路徑的基本資訊
     * 包括所有節點、段數、延遲時間和自訂事件
     */
    public GetBaseInfo(): IPathInfo
    {
        return this._pathInfo;
    }

    /**
     * 設定路徑基本資訊
     */
    public SetBaseInfo( info: IPathInfo ): void
    {
        for ( const wayPoint of this.node.children )
        {
            wayPoint.destroy();
        }

        this.node.removeAllChildren();
        const customEventNodes: CustomEventNode[] = []
        const newWayPoints = info.Waypoints.map( _ => new cc.Node() );
        for ( let i = 0; i < newWayPoints.length; i++ )
        {
            const wayInfo = info.Waypoints[ i ];
            const customEventNode = newWayPoints[ i ].addComponent( CustomEventNode );
            newWayPoints[ i ].parent = this.node;

            customEventNode.node.setWorldPosition(
                cc.v3( wayInfo.pos.x, wayInfo.pos.y, wayInfo.pos.z ) );
            customEventNode.beginScale = wayInfo.beginScale ?? 1;
            customEventNode.endScale = wayInfo.endScale ?? 1;
            customEventNode.delayTime = wayInfo.delayTime ?? 0;
            customEventNode.customEvent = wayInfo.customEvent ?? "";
            customEventNodes.push( customEventNode );

        }
        this._pathInfo.SetWaypoints( {
            Waypoints: customEventNodes.map( node => node.CustomPointInfo ),
            SegmentCount: info.SegmentCount
        } )
        this.segmentCount = info.SegmentCount ?? this.segmentCount;
        this.Draw();
    }
}