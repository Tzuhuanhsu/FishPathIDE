import { _decorator, assetManager, CCBoolean, CCFloat, Component, JsonAsset, Label, Line, Node, Vec3 } from "cc";
import { FishPositionInfo, FishPositionInfoData } from "./FishPositionInfo";
import { FishBezierGroup } from "./FishBezierGroup";


const { ccclass, property, executeInEditMode, type } = _decorator;



@ccclass( 'FishPathCreator' )
@executeInEditMode( true )
export class FishPathCreator extends Line 
{

    @property( { type: Node, tooltip: "Formation Root Node", displayName: "Formation Root" } )
    formationRoot: Node;

    @property( { type: Node, tooltip: "Path Root Node", displayName: "Path Root" } )
    pathRoot: Node;

    @property( { type: JsonAsset, tooltip: "Path Data", displayName: "Path Data" } )
    pathData: JsonAsset;

    @type( [ Vec3 ] )
    fishPositions: Vec3[] = [];

    @type( [ Vec3 ] )
    fishRotations: Vec3[] = [];

    @type( [ Vec3 ] )
    fishScales: Vec3[] = [];

    @type( [ CCFloat ] )
    fishSpeeds: number[] = [];

    @type( [ CCFloat ] )
    fishDelays: number[] = [];

    @property( { tooltip: "是否刷新路徑" } )
    refreshPath: boolean = false;

    start()
    {
        this.width.constant = 10;
        this.worldSpace = true;
        // this.updatePath();

    }

    updatePath()
    {
        const points = this.pathRoot.getComponentsInChildren( FishBezierGroup )
        let positions: Vec3[] = [];
        let rotations: Vec3[] = [];
        let scales: Vec3[] = [];
        let speeds: number[] = [];
        let delays: number[] = [];
        this.fishPositions.length = 0;
        this.fishRotations.length = 0;
        this.fishScales.length = 0;
        this.fishSpeeds.length = 0;
        this.fishDelays.length = 0;
        for ( let i = 0; i < points.length; i++ )
        {

            if ( !points[ i ] )
            {
                continue;
            }
            const group = points[ i ] as FishBezierGroup;
            const bezierPoints = group.getBezierPoints();
            positions = positions.concat( bezierPoints );
            rotations = rotations.concat( Array( bezierPoints.length ).fill( new Vec3( 0, 0, 0 ) ) );
            scales = scales.concat( Array( bezierPoints.length ).fill( new Vec3( 1, 1, 1 ) ) );
            speeds = speeds.concat( Array( bezierPoints.length ).fill( group.moveSpeed ) );
            delays = delays.concat( Array( bezierPoints.length ).fill( 0 ) );
        }
        this.positions = positions;
        this.fishPositions = positions;
        this.fishRotations = rotations;
        this.fishScales = scales;
        this.fishSpeeds = speeds;
        this.fishDelays = delays;
    }

    protected update( dt: number ): void
    {
        this.updatePath();
        if ( this.refreshPath )
        {
            this.refreshPath = false;
            this.RefreshPathData();
        }
    }

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

            const data: FishPositionInfoData[] = fishPositionData.json as FishPositionInfoData[];
            this.pathRoot.children.forEach( n =>
            {
                n.destroy();
            } );
            this.pathRoot.removeAllChildren();
            ;
            data.forEach( ( d, index ) =>
            {
                if ( index === 0 )
                {
                    this.formationRoot.setWorldPosition( new Vec3( d.position ) );
                }

                const node = new Node( `FishPositionInfo_${index}` );
                const info = node.addComponent( FishPositionInfo );
                node.parent = this.pathRoot;
                const position = new Vec3( d.position.x, d.position.y, d.position.z );
                const rotation = new Vec3( d.rotation.x, d.rotation.y, d.rotation.z );
                const scale = new Vec3( d.scale.x, d.scale.y, d.scale.z );
                const speed = d.speed;
                node.setWorldPosition( position );
                node.setRotationFromEuler( rotation );
                node.setWorldScale( scale );
                info.Speed = speed;

                info.DelayTime = d.delayTime;

            } );
        } );
    }
}