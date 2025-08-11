import { _decorator, Component, Node, Vec3 } from 'cc';
import { BulletManager } from '../Bullet/BulletManager';
const { ccclass, property } = _decorator;

@ccclass( 'ShootManager' )
export class ShootManager extends Component
{
    private static _instance: ShootManager = null;
    public static get Instance() { return this._instance; }

    protected onLoad(): void
    {
        ShootManager._instance = this;
    }

    protected onDestroy(): void
    {
        ShootManager._instance = null;
    }

    public CannonShot( startPosition: Vec3, targetPosition: Vec3 ): void
    {
        // 判斷是否有金額

        // 傳送發射資料到伺服器

        // 生成子彈
        BulletManager.Instance.SpawnBullet( startPosition, targetPosition );

        // 顯示子彈
    }
}


