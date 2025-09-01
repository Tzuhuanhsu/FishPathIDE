import * as cc from "cc";
const { ccclass, property } = cc._decorator;

export interface ICustomPointInfo
{

    pos: cc.Vec3;
    beginScale?: number;
    endScale?: number;
    delayTime?: number;
    customEvent?: string;
}

@ccclass( 'CustomEventNode' )
export class CustomEventNode extends cc.Component
{
    @property( { type: cc.CCInteger, tooltip: "Begin Scale", displayName: "Begin Scale" } )
    beginScale: number = 1;

    @property( { type: cc.CCInteger, tooltip: "End Scale", displayName: "End Scale" } )
    endScale: number = 1;

    @property( { type: cc.CCFloat, tooltip: "延遲時間", displayName: "DelayTime", unit: "/s" } )
    delayTime: number = 0;

    @property( { tooltip: "自定義事件", displayName: "Custom Event" } )
    customEvent: string = "";

    get CustomPointInfo(): ICustomPointInfo
    {
        return {
            pos: this.node.worldPosition.clone(),
            beginScale: this.beginScale,
            endScale: this.endScale,
            delayTime: this.delayTime,
            customEvent: this.customEvent
        };
    }
}
