import { _decorator, Component, Node, Vec3 } from 'cc';
import { FactoryManager, FactoryType } from '../Factory/FactoryManager';
import { Bullet } from './Bullet';
const { ccclass, property } = _decorator;

@ccclass( 'BulletManager' )
export class BulletManager extends Component
{
    private static _instance: BulletManager = null;
    public static get Instance() { return this._instance; }

    protected onLoad(): void
    {
        BulletManager._instance = this;
    }

    protected onDestroy(): void
    {
        BulletManager._instance = null;
    }

    public SpawnBullet( startPosition: Vec3, targetPosition: Vec3 )
    {
        const node = FactoryManager.Instance.GetFactoryFx( FactoryType.CannonBullet );
        const bullet = node.getComponent( Bullet );
        bullet.InitBullet( startPosition, targetPosition );
    }
}


