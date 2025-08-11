// 魚群路徑ID枚舉
export enum EnumFishPathID
{
    Normal_1 = 0,
    Normal_2 = 1,
    Normal_3 = 2,
    Normal_4 = 3,
    Normal_5 = 4,
    Normal_6 = 5,
    Normal_7,
    Normal_8,
    Normal_9,
    Normal_10,
}
/**
 * 主腳本
 */
export interface IMainScript
{
    // 腳本ID
    MainScriptID: number;
    //對應的子腳本
    Subscript: number[];
}

/**
 * 子腳本群
 */
export interface ISubScriptMap
{
    [ key: string ]: ISubScript;
}

/**
 * 子腳本
 */
export interface ISubScript
{
    // 腳本ID
    Script: string;
    // 腳本資料
    Time: number;
}

/**
 * 腳本基本資料群介面
 */
export interface IGroupScript
{
    // 腳本ID
    ScriptId: string;
    // 腳本資料
    Script: IGroupData[];
}

/**
 * 腳本基本資料介面
 */
export interface IGroupData
{
    //路徑ID
    PathID: EnumFishPathID;
    //Fish ID
    FishId: number;
    //魚的數量
    Quantity: number;
    //魚的出場間隔時間
    IntervalTime: number;
    //腳本的出場時間
    ShowTime: number;
    //額外資訊
    Extra: string;
}

export interface IEntityData
{
    // 在腳本中的流水號
    id: number
    // 所使用的實體編號
    FactoryType: number
    // 路徑編號
    pathNo: EnumFishPathID
    // 加入時間
    joinTime: number
}

// 記憶體管理：最大魚群數量限制
export const MAX_LIVE_FISH: number = 500;
// 記憶體管理：最大待處理魚數量限制
export const MAX_PENDING_FISH = 500;