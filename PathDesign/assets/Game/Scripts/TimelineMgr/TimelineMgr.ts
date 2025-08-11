
/**
 * 時間管理器
 */
export class TimelineMgr
{
    // 伺服器時間
    private serverTime: number = 0;
    // 客戶端時間
    private clientTime: number = 0;
    // 上次同步時間
    private lastSyncTime: number = 0;

    private static _instance: TimelineMgr = null;

    private _scriptId: number = -1;


    public static get Instance(): TimelineMgr
    {
        if ( !this._instance )
        {
            this._instance = new TimelineMgr();
        }
        return this._instance;
    }

    private constructor()
    {

    }

    public Update( deltaTime: number ): void
    {
        this.clientTime += deltaTime;
        if ( this.lastSyncTime > 0 )
        {
            this.serverTime += deltaTime;
        }
    }

    public get ClientTime(): number
    {
        return this.clientTime;
    }

    public set ClientTime( time: number )
    {
        this.clientTime = time;
    }
    /**
     * 設定腳本ID
     */
    public set ScriptId( id: number )
    {
        this._scriptId = id;
    }

    public get ScriptId(): number
    {
        return this._scriptId;
    }

}