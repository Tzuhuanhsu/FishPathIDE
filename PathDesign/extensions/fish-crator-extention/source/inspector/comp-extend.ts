'use strict';

import path from "path";

/**
 * 魚場路徑編輯擴充
 */

/**
 * 路徑資料結構
 */
interface FishPathData 
{
    /**
     * 位置_
     */
    Waypoints: {
        pos: {
            x: number;
            y: number;
            z: number;
        };
        beginScale?: number;
        endScale?: number;
        delayTime?: number;
        customEvent?: string;

    }[],


    /**
     * 段數
     */
    SegmentCount: number,


}


export const template = `
    <ui-prop type="dump" class="prop-pathData" name="pathData"></ui-prop>
    <ui-prop type="dump" class="prop-refresh" name="refresh"></ui-prop>
    <ui-button class="exportButton">點我輸出</ui-button>
`;

export const $ =
{
    pathData: '.prop-pathData',
    refresh: ".prop-refresh",
    exportButton: '.exportButton',
};
export const methods = {
    onClickExport
};
type Selector<$> = { $: Record<keyof $, any | null> };
type PanelThis = Selector<typeof $> &
{
    dump: any,
};

export function update( this: PanelThis, dump: any )
{
    this.dump = dump;
    this.$.pathData.render( dump.value.pathData );
    this.$.refresh.render( dump.value.refreshPath );
}

export function ready( this: PanelThis )
{
    this.$.exportButton.addEventListener( 'confirm', onClickExport.bind( this ) );
}

export async function onClickExport( this: PanelThis )
{
    if ( this.dump.value.pathInfo.value === null && this.dump.value.pathInfo.value.length === 0 )
    {
        console.warn( '沒有路徑資料可供輸出' );
        return;
    }

    if ( this.dump.value.pathData.value === null )
    {
        console.warn( '無法回填JSON' );
        return;
    }
    console.log( '開始輸出 JSON 資料到 FishRoots 資料夾', this.dump.value.pathInfo.value );
    Editor.Message.send( 'fish-creator-extension', 'export-json', {
        pathUUID: this.dump.value.pathData.value.uuid,
        data: this.dump.value.pathInfo.value as FishPathData,
    } );
}

