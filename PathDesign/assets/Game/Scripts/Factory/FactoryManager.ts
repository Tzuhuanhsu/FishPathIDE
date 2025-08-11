import { _decorator, Component, Enum, instantiate, Node, NodePool, Prefab } from 'cc';
const { ccclass, property } = _decorator;

export enum FactoryType
{
    CannonBullet,
    Coin,
    ThreeDBullet,
    Fish_1,
    Fish_2,
    Fish_3,
    Fish_4,
    Fish_5,
    Fish_6,
    Fish_7,
    Fish_8,
    Fish_9,
    Fish_10,
    Fish_11,
    Fish_12,
    Fish_13,
    Fish_14,
    Fish_15,
    Fish_16,
    Fish_17,
    Fish_18,
    Fish_19,
    Fish_20,
    Fish_21,
    Fish_22,
    Fish_23,
    Fish_24,
    Fish_25,
    Fish_26,
    Fish_27,
    Fish_28,
    Fish_29,
    Fish_30
}

@ccclass( 'FactorySetting' )
class FactorySetting
{
    @property( { type: Enum( FactoryType ), tooltip: "類型", visible: true } )
    public FxType: FactoryType;
    @property( { type: Prefab, tooltip: "Prefab", visible: true } )
    public FxPrefab: Prefab;
    @property( { type: Node, tooltip: "Parent", visible: true } )
    public FxParent: Node;
}


@ccclass( 'FactoryManager' )
export class FactoryManager extends Component
{
    private _factoryMap: Map<FactoryType, NodePool> = new Map();

    @property( { type: FactorySetting, tooltip: "特效Setting", visible: true } )
    private _factorySettings: FactorySetting[] = [];

    private static _instance: FactoryManager = null;
    public static get Instance() { return this._instance; }

    protected onLoad(): void
    {
        FactoryManager._instance = this;
    }

    protected onDestroy(): void
    {
        FactoryManager._instance = null;
    }

    public GetFactoryFx( factoryType: FactoryType )
    {
        let node: Node;
        let nodePool: NodePool;
        let setting = this._factorySettings.find( setting => setting.FxType == factoryType );
        if ( setting == null || setting.FxPrefab == null )
        {
            console.log( "[FactoryPatternController Setting Error for " + factoryType );
            return;
        }

        if ( !this._factoryMap.has( factoryType ) )
        {
            nodePool = new NodePool();
            this._factoryMap.set( factoryType, nodePool );
        }
        else
        {
            nodePool = this._factoryMap.get( factoryType );
        }

        node = nodePool.get();
        if ( node == null )
        {
            node = instantiate( setting.FxPrefab );
        }

        setting.FxParent && node.setParent( setting.FxParent );
        return node;
    }

    public PutFactoryFx( factoryType: FactoryType, node: Node )
    {
        let nodePool: NodePool;
        if ( !this._factoryMap.has( factoryType ) )
        {
            nodePool = new NodePool();
            this._factoryMap.set( factoryType, nodePool );
        }
        else
        {
            nodePool = this._factoryMap.get( factoryType );
        }
        nodePool.put( node );
    }
}


