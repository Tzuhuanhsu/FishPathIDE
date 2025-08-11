import * as cc from "cc";
const { ccclass, property, executeInEditMode, type } = cc._decorator;


@ccclass( 'FishBezierGroup' )
@executeInEditMode( true )
export class FishBezierGroup extends cc.Component
{
    @property( { type: cc.Node, tooltip: "Bezier First Node", displayName: "First Node" } )
    private firstNode: cc.Node = null;

    @property( { type: cc.Node, tooltip: "Bezier Second Node", displayName: "Second Node" } )
    private secondNode: cc.Node = null;

    @property( { type: cc.Node, tooltip: "Bezier Third Node", displayName: "Third Node" } )
    private thirdNode: cc.Node = null;

    @property( { type: cc.Node, tooltip: "Bezier Fourth Node", displayName: "Fourth Node" } )
    private fourthNode: cc.Node = null;

    @property( { type: cc.CCFloat, tooltip: "Bezier Segment Count", displayName: "Segment Count" } )
    private segmentCount: number = 20;


    @property( { type: cc.CCFloat, tooltip: "Move Speed", displayName: "Move Speed" } )
    public moveSpeed: number = 100;

    protected update( dt: number ): void
    {
        this.Draw();
    }

    Draw()  
    {
        //計算出所有的貝塞爾曲線點
        if ( !this.firstNode || !this.secondNode || !this.thirdNode || !this.fourthNode ) return;
        const points: cc.Vec3[] = [];
        for ( let i = 0; i <= this.segmentCount; i++ )
        {
            const t = i / this.segmentCount;
            const point = this.calculateBezierPoint( t );
            points.push( point );
        }

        // 在這裡你可以使用計算出的點來繪製路徑或進行其他操作
        this.drawPath( points );
    }

    /**
     * 計算三次貝塞爾曲線上的點
     * @param t 參數 t (0到1之間)
     * @returns 貝塞爾曲線上的點
     */
    private calculateBezierPoint( t: number ): cc.Vec3
    {
        const p0 = this.firstNode.worldPosition;
        const p1 = this.secondNode.worldPosition;
        const p2 = this.thirdNode.worldPosition;
        const p3 = this.fourthNode.worldPosition;

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
     * 繪製路徑（可根據需求自定義）
     * @param points 貝塞爾曲線上的點陣列
     */
    private drawPath( points: cc.Vec3[] ): void
    {

        // 如果需要在編輯器中顯示路徑，可以添加 Graphics 組件
        const graphics = this.getComponent( cc.Graphics );
        if ( graphics )
        {
            this.drawBezierCurve( graphics, points );
        }
    }

    /**
     * 使用 Graphics 組件繪製貝塞爾曲線
     * @param graphics Graphics 組件
     * @param points 貝塞爾曲線上的點陣列
     */
    private drawBezierCurve( graphics: cc.Graphics, points: cc.Vec3[] ): void
    {
        graphics.clear();
        graphics.strokeColor = cc.Color.RED;
        graphics.lineWidth = 10;

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
     * 獲取指定參數 t 位置的點
     * @param t 參數 t (0到1之間)
     * @returns 貝塞爾曲線上的點
     */
    public getPointAtT( t: number ): cc.Vec3
    {
        return this.calculateBezierPoint( Math.max( 0, Math.min( 1, t ) ) );
    }

    /**
     * 獲取整條貝塞爾曲線的點陣列
     * @returns 貝塞爾曲線上的所有點
     */
    public getBezierPoints(): cc.Vec3[]
    {
        if ( !this.firstNode || !this.secondNode || !this.thirdNode || !this.fourthNode ) 
        {
            return [];
        }

        const points: cc.Vec3[] = [];
        for ( let i = 0; i <= this.segmentCount; i++ )
        {
            const t = i / this.segmentCount;
            const point = this.calculateBezierPoint( t );
            points.push( point );
        }
        return points;
    }


    /**
     * 在編輯器中預覽路徑
     */
    public previewPath(): void
    {
        this.Draw();
    }
}