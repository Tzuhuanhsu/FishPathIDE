import { _decorator, assetManager, Component, JsonAsset, Node, Prefab, Vec3 } from "cc";
import { FishBezierGroup } from "./FishBezierGroup";
import { IPathInfo, PathInfo } from "./PathInfo";


const { ccclass, property, executeInEditMode, type } = _decorator;





@ccclass( 'FishPathCreator' )
@executeInEditMode( true )
export class FishPathCreator extends Component
{

    @property( { type: JsonAsset, tooltip: "路徑資料", displayName: "路徑資料" } )
    pathData: JsonAsset;

    @property( { tooltip: "是否刷新路徑" } )
    refreshPath: boolean = false;

    @type( PathInfo )
    pathInfo: IPathInfo =
        {
            Waypoints: [],
            SegmentCount: 0
        }

    private pathGroup: FishBezierGroup;
    protected start(): void
    {
        this.pathGroup = this.getComponent( FishBezierGroup );

        if ( !this.pathGroup )
        {
            console.error( "FishPathCreator requires a FishBezierGroup component on the pathRoot." );
        }
    }



    protected update(): void
    {

        if ( this.refreshPath )
        {
            console.log( "Refreshing path data..." );
            this.refreshPath = false;
            this.RefreshPathData();
        }
        this.pathInfo = this.pathGroup.GetBaseInfo();
    }

    /**
     * 刷新路徑數據
     * 從 pathData 中讀取數據，並更新 pathRoot 的子節點
     *  
     */
    RefreshPathData()
    {
        if ( !this.pathData ) return;
        assetManager.loadAny( { uuid: this.pathData.uuid }, ( err, fishPositionData: JsonAsset ) =>
        {
            if ( err )
            {
                console.error( "Failed to load path data:", err );
                return;
            }

            const pathInfos: IPathInfo = fishPositionData.json as IPathInfo;
            if ( !pathInfos )
            {
                console.warn( "No path data found." );
                return;
            }

            this.pathGroup.SetBaseInfo( pathInfos );
        } );
    }
}