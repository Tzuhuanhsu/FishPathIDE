import * as cc from "cc";

const { ccclass, property, executeInEditMode } = cc._decorator;

export interface FishPositionInfoData
{
    position: cc.Vec3;
    rotation: cc.Vec3;
    scale: cc.Vec3;
    speed: number;
    delayTime: number;
}

@ccclass( 'FishPositionInfo' )
@executeInEditMode( true )
export class FishPositionInfo extends cc.Component
{
    @property( { type: cc.CCFloat, tooltip: "速度" } )
    Speed: number = 100;

    @property( { type: cc.CCFloat, unit: "s" } )
    DelayTime: number = 0;


    get PositionInfo(): FishPositionInfoData
    {
        const rotation = new cc.Vec3();
        const position = this.node.worldPosition.clone();
        this.node.worldRotation.getEulerAngles( rotation );
        const scale = this.node.worldScale.clone();
        const speed = this.Speed;

        return {
            position: position,
            rotation: rotation,
            scale: scale,
            speed: speed,
            delayTime: this.DelayTime
        };
    }
}