import { _decorator, Collider2D, Component, Contact2DType, IPhysics2DContact, misc, Node, Sprite, tween, UITransform, Vec3 } from 'cc';
import { FactoryManager, FactoryType } from '../Factory/FactoryManager';
const { ccclass, property } = _decorator;

@ccclass( 'Bullet' )
export class Bullet extends Component
{
    private readonly BULLET_SPEED: number = 1000;
    private readonly BULLET_RADIUS: number = 0;

    private _moveVec: Vec3;

    private _minX: number;
    private _maxX: number;
    private _minY: number;
    private _maxY: number;

    protected onLoad(): void
    {
        const collider = this.getComponent( Collider2D );
        collider.on( Contact2DType.BEGIN_CONTACT, this.onBeginContact, this );
    }

    start()
    {
        const canvas = this.node.scene.getChildByName( "Canvas" );
        const uiTransform = canvas.getComponent( UITransform );

        // 將螢幕四個角轉換為世界座標
        const bottomLeft = uiTransform.convertToWorldSpaceAR( new Vec3( -uiTransform.width / 2, -uiTransform.height / 2 ) );
        const topRight = uiTransform.convertToWorldSpaceAR( new Vec3( uiTransform.width / 2, uiTransform.height / 2 ) );

        this._minX = bottomLeft.x;
        this._maxX = topRight.x;
        this._minY = bottomLeft.y;
        this._maxY = topRight.y;
    }

    protected update( dt: number ): void
    {
        this.bulletMove( 0.05 );
        this.onCollision();
    }

    public InitBullet( startPosition: Vec3, targetPosition: Vec3 )
    {
        this.node.active = true;
        let start = this.node.parent.getComponent( UITransform ).convertToNodeSpaceAR( startPosition );
        this.node.setPosition( start );

        let target = this.node.parent.getComponent( UITransform ).convertToNodeSpaceAR( targetPosition );
        let distance = target.subtract( this.node.position );
        distance.z = 0;
        this._moveVec = distance.normalize();
    }

    // 碰撞 event
    private onBeginContact( selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact )
    {
        console.log( '子彈擊中:', otherCollider.node.name );
    }

    private bulletMove( dt: number )
    {
        if ( !this._moveVec )
        {
            return;
        }

        const worldPos = this.node.getWorldPosition();
        let nextWorldPos = worldPos.add( this._moveVec.clone().multiplyScalar( this.BULLET_SPEED * dt ) );

        // 反彈檢查
        if ( nextWorldPos.x < this._minX || nextWorldPos.x > this._maxX )
        {
            this._moveVec.x *= -1;
        }
        if ( nextWorldPos.y < this._minY || nextWorldPos.y > this._maxY )
        {
            this._moveVec.y *= -1;

        }

        // 更新角度
        let angle = Math.atan2( this._moveVec.y, this._moveVec.x );
        this.node.angle = misc.radiansToDegrees( angle );

        // 更新位置
        const newLocalPos = this.node.parent.getComponent( UITransform ).convertToNodeSpaceAR( nextWorldPos );
        this.node.setPosition( newLocalPos );
    }

    private onCollision()
    {
        if ( this._moveVec == null || this._moveVec.length() == 0 ) return;

        // let fishArray = GameController.Instance.MonsterArray;
        // fishArray.forEach( fish =>
        // {
        //     const distance = Vec3.distance( this.node.worldPosition, fish.node.worldPosition );
        //     const fishRadius = fish?.radius ?? 0;

        //     if ( distance <= this.BULLET_RADIUS + fishRadius )
        //     {
        //         this._moveVec = new Vec3( 0, 0, 0 );
        //         this._bulletSprite.node.active = false;
        //         this.fishingNetFx( () => FactoryManager.Instance.PutFactoryFx( FactoryType.CannonBullet, this.node ) );
        //         fish?.onBulletCollision();
        //     }
        // } );
    }

    // private fishingNetFx( callback: () => void )
    // {
    //     this._fishingNetSprite.node.active = true;
    //     this._fishingNetSprite.node.setScale( new Vec3( 0, 0, 0 ) );

    //     tween( this._fishingNetSprite.node )
    //         .to( 0.25, { scale: new Vec3( 1, 1, 1 ) }, { easing: "quadOut" } )
    //         .call( () =>
    //         {
    //             this._fishingNetSprite.node.active = false;
    //             callback && callback();
    //         } )
    //         .start();
    // }
}


