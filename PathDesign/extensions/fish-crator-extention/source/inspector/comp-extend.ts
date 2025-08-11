'use strict';
/**
 * 魚場路徑編輯擴充
 */

/**
 * 路徑資料結構
 */
type FishPathData =
    {
        /**
         * 位置
         */
        position: { x: number, y: number, z: number },
        /**
         * 旋轉
         */
        rotation: { x: number, y: number, z: number },
        /**
         * 縮放
         */
        scale: { x: number, y: number, z: number },
        /**
         * 延遲時間
         */
        delayTime: number,
        /**
         * 速度
         */
        speed: number,
    }


export const template = `
    <ui-prop type="dump" class="prop-pathData" name="pathData"></ui-prop>
    <ui-prop type="dump" class="prop-pathRoot" name="Path Root"></ui-prop>
    <ui-prop type="dump" class="prop-FormationRoot" name="Formation Root"></ui-prop>
    <ui-prop type="dump" class="prop-positions" name="Positions"></ui-prop>
    <ui-prop type="dump" class="prop-color" name="Color"></ui-prop>
    <ui-prop type="dump" class="prop-refresh" name="refresh"></ui-prop>
    <ui-button class="exportButton">點我輸出</ui-button>
`;

export const $ =
{
    pathData: '.prop-pathData',
    pathRoot: '.prop-pathRoot',
    formationRoot: '.prop-FormationRoot',
    positions: '.prop-positions',
    color: '.prop-color',
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
    this.$.pathRoot.render( dump.value.pathRoot );
    this.$.positions.render( dump.value.positions );
    this.$.color.render( dump.value.color );
    this.$.formationRoot.render( dump.value.formationRoot );
    this.$.refresh.render( dump.value.refreshPath );

}

export function ready( this: PanelThis )
{
    this.$.exportButton.addEventListener( 'confirm', onClickExport.bind( this ) );
}

export async function onClickExport( this: PanelThis )
{
    const pathInfos: FishPathData[] = [];
    console.log( `=====輸出路徑資料======`, this.dump.value );
    //組合路徑資料
    for ( let index in this.dump.value.fishPositions.value )
    {
        const data: FishPathData = {
            position: {
                x: this.dump.value.fishPositions.value[ index ].value.x,
                y: this.dump.value.fishPositions.value[ index ].value.y,
                z: this.dump.value.fishPositions.value[ index ].value.z
            },
            rotation: {
                x: this.dump.value.fishRotations.value[ index ].value.x,
                y: this.dump.value.fishRotations.value[ index ].value.y,
                z: this.dump.value.fishRotations.value[ index ].value.z
            },
            scale: {
                x: this.dump.value.fishScales.value[ index ].value.x,
                y: this.dump.value.fishScales.value[ index ].value.y,
                z: this.dump.value.fishScales.value[ index ].value.z
            },
            speed: this.dump.value.fishSpeeds.value[ index ].value,
            delayTime: this.dump.value.fishDelays.value[ index ].value
        }

        pathInfos.push( data );
    }
    console.log( `=====輸出路徑資料======`, pathInfos );
    const pathUUID = this.dump.value.pathData.value.uuid;
    Editor.Message.send( 'fish-creator-extension', 'export-json', {
        pathUUID: pathUUID,
        data: pathInfos,
    } );

}

