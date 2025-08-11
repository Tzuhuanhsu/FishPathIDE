import * as cc from "cc";
import { FishPathRunner } from "./FishPath/FishPathRunner";
import { FactoryType } from "../Factory/FactoryManager";

const { ccclass, property } = cc._decorator;

@ccclass( "Fish" )
export class Fish extends cc.Component
{

    @property( { type: FishPathRunner, tooltip: "魚的路徑運行器", displayName: "Fish Path Runner", visible: true } )
    private _fishPathRunner: FishPathRunner = null;
    private fishType: FactoryType = FactoryType.Fish_2;

    private _fishId: number = -1;

    set FishType( type: FactoryType )
    {
        this.fishType = type;
    }

    get FishType(): FactoryType
    {
        return this.fishType;
    }

    set FishId( id: number )
    {
        this._fishId = id;
    }
    get FishId(): number
    {
        return this._fishId;
    }

    get FishPathRunner(): FishPathRunner
    {
        return this._fishPathRunner;
    }

}