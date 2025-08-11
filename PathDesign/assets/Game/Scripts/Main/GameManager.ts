import { _decorator, Camera, Component, EventMouse, Node, Vec3 } from 'cc';
import { ShootManager } from '../Shoot/ShootManager';
import { PhotonClient } from '../../../Photon/Scripts/PhotonClient';
const { ccclass, property } = _decorator;

@ccclass( 'GameManager' )
export class GameManager extends Component
{
    private static _instance: GameManager = null;
    public static get Instance() { return this._instance; }

    @property( { type: Node, tooltip: "Canvas Node", visible: true } )
    public canvas: Node;
    @property( { type: Camera, tooltip: "Canvas Camera", visible: true } )
    private canvasCamera: Camera = null;
    @property( { type: Node, tooltip: "Main Camera", visible: true } )
    private playerCannonNode: Node = null;

    private _click: boolean;
    private mouseWorldPos: Vec3;
    public get MouseWorldPos(): Vec3 { return this.mouseWorldPos; }

    protected onLoad(): void
    {
        GameManager._instance = this;

        this.registerMouseEvent();
    }

    protected start(): void
    {
        let loginPath: string = "ws://localhost:9090";
        // const clientPeer = new PhotonClient( loginPath );                                                                                                       //登錄路徑
    }

    protected onDestroy(): void
    {
        GameManager._instance = null;
    }

    private registerMouseEvent(): void
    {
        this.canvas.on( Node.EventType.MOUSE_MOVE, this.onMouseMove.bind( this ), this );
        this.canvas.on( Node.EventType.MOUSE_DOWN, this.onMouseDown.bind( this ), this );
        this.canvas.on( Node.EventType.MOUSE_UP, this.onMouseUp.bind( this ), this );
    }

    // Mouse Event
    private onMouseMove( event: EventMouse ): void
    {
        // 獲取滑鼠的世界座標
        const uiPos = event.getUILocation();
        if ( this.canvasCamera )
        {
            this.mouseWorldPos = this.canvasCamera.screenToWorld( new Vec3( uiPos.x, uiPos.y ) );
            console.log( `本地座標：x=${this.mouseWorldPos.x}, y=${this.mouseWorldPos.y}` );
        }
    }

    private onMouseDown( event: EventMouse ): void
    {
        // 判斷是否點擊
        if ( !this._click )
        {
            this._click = true;
        }
    }

    private onMouseUp( event: EventMouse ): void
    {
        // 判斷是否點擊
        if ( this._click )
        {
            this._click = false;
        }

        const playerCannon: Node = this.playerCannonNode;
        ShootManager.Instance.CannonShot( playerCannon.worldPosition, this.MouseWorldPos );
    }
}
