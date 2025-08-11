const fs = require( 'fs' );
const path = require( 'path' );
/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [ key: string ]: ( ...any: any ) => any } = {
    /**
     * @en A method that can be triggered by message
     * @zh 通过 message 触发的方法
     */
    exportJson
};

/**
 * 輸出 JSON 資料到 FishRoots 資料夾
 * @param args 
 */
export async function exportJson( args: { pathUUID: string, data: any } )
{
    try
    {
        console.log( '開始寫入 JSON 資料到 FishRoots 資料夾', args.data );
        const assetPath = await Editor.Message.request( 'asset-db', 'query-path', args.pathUUID );
        fs.writeFileSync( assetPath, JSON.stringify( args.data ) );
        Editor.Message.send( 'asset-db', 'refresh-asset', args.pathUUID );
        console.log( '寫入成功' );
    }
    catch ( err )
    {
        // 寫入失敗
        console.error( '寫入失敗:', err );
    }

}
/**
 * @en Method Triggered on Extension Startup
 * @zh 扩展启动时触发的方法
 */
export function load() { }

/**
 * @en Method triggered when uninstalling the extension
 * @zh 卸载扩展时触发的方法
 */
export function unload() { }
