import * as cc from "cc";
import { EnumFishPathID } from "../FishDefine";

const { ccclass, property } = cc._decorator;
@ccclass( "FishPathInfo" )
export class FishPathInfo
{
    @property( { type: cc.Enum( EnumFishPathID ), tooltip: "魚路徑 ID" } )
    pathId: EnumFishPathID = EnumFishPathID.Normal_1;

    @property( { type: cc.JsonAsset, tooltip: "魚路徑數據" } )
    pathData: cc.JsonAsset | null = null;

    get PathId(): EnumFishPathID
    {
        return this.pathId;
    }

    set PathId( id: EnumFishPathID )
    {
        this.pathId = id;
    }
}

@ccclass( "FishPathIDSetting" )
export class FishPathIDSetting extends cc.Component
{
    @property( { type: FishPathInfo, tooltip: "魚路徑 ID" } )
    PathInfo: FishPathInfo[] = [];
}

