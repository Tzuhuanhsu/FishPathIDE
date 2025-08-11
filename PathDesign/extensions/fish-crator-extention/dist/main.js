"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.load = exports.exportJson = exports.methods = void 0;
const fs = require('fs');
const path = require('path');
/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
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
async function exportJson(args) {
    try {
        console.log('開始寫入 JSON 資料到 FishRoots 資料夾', args.data);
        const assetPath = await Editor.Message.request('asset-db', 'query-path', args.pathUUID);
        fs.writeFileSync(assetPath, JSON.stringify(args.data));
        Editor.Message.send('asset-db', 'refresh-asset', args.pathUUID);
        console.log('寫入成功');
    }
    catch (err) {
        // 寫入失敗
        console.error('寫入失敗:', err);
    }
}
exports.exportJson = exportJson;
/**
 * @en Method Triggered on Extension Startup
 * @zh 扩展启动时触发的方法
 */
function load() { }
exports.load = load;
/**
 * @en Method triggered when uninstalling the extension
 * @zh 卸载扩展时触发的方法
 */
function unload() { }
exports.unload = unload;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBRSxJQUFJLENBQUUsQ0FBQztBQUMzQixNQUFNLElBQUksR0FBRyxPQUFPLENBQUUsTUFBTSxDQUFFLENBQUM7QUFDL0I7OztHQUdHO0FBQ1UsUUFBQSxPQUFPLEdBQWdEO0lBQ2hFOzs7T0FHRztJQUNILFVBQVU7Q0FDYixDQUFDO0FBRUY7OztHQUdHO0FBQ0ksS0FBSyxVQUFVLFVBQVUsQ0FBRSxJQUFxQztJQUVuRSxJQUNBO1FBQ0ksT0FBTyxDQUFDLEdBQUcsQ0FBRSw2QkFBNkIsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFFLENBQUM7UUFDeEQsTUFBTSxTQUFTLEdBQUcsTUFBTSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUUsQ0FBQztRQUMxRixFQUFFLENBQUMsYUFBYSxDQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFFLElBQUksQ0FBQyxJQUFJLENBQUUsQ0FBRSxDQUFDO1FBQzNELE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBRSxDQUFDO1FBQ2xFLE9BQU8sQ0FBQyxHQUFHLENBQUUsTUFBTSxDQUFFLENBQUM7S0FDekI7SUFDRCxPQUFRLEdBQUcsRUFDWDtRQUNJLE9BQU87UUFDUCxPQUFPLENBQUMsS0FBSyxDQUFFLE9BQU8sRUFBRSxHQUFHLENBQUUsQ0FBQztLQUNqQztBQUVMLENBQUM7QUFoQkQsZ0NBZ0JDO0FBQ0Q7OztHQUdHO0FBQ0gsU0FBZ0IsSUFBSSxLQUFLLENBQUM7QUFBMUIsb0JBQTBCO0FBRTFCOzs7R0FHRztBQUNILFNBQWdCLE1BQU0sS0FBSyxDQUFDO0FBQTVCLHdCQUE0QiIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGZzID0gcmVxdWlyZSggJ2ZzJyApO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoICdwYXRoJyApO1xuLyoqXG4gKiBAZW4gUmVnaXN0cmF0aW9uIG1ldGhvZCBmb3IgdGhlIG1haW4gcHJvY2VzcyBvZiBFeHRlbnNpb25cbiAqIEB6aCDkuLrmianlsZXnmoTkuLvov5vnqIvnmoTms6jlhozmlrnms5VcbiAqL1xuZXhwb3J0IGNvbnN0IG1ldGhvZHM6IHsgWyBrZXk6IHN0cmluZyBdOiAoIC4uLmFueTogYW55ICkgPT4gYW55IH0gPSB7XG4gICAgLyoqXG4gICAgICogQGVuIEEgbWV0aG9kIHRoYXQgY2FuIGJlIHRyaWdnZXJlZCBieSBtZXNzYWdlXG4gICAgICogQHpoIOmAmui/hyBtZXNzYWdlIOinpuWPkeeahOaWueazlVxuICAgICAqL1xuICAgIGV4cG9ydEpzb25cbn07XG5cbi8qKlxuICog6Ly45Ye6IEpTT04g6LOH5paZ5YiwIEZpc2hSb290cyDos4fmlpnlpL5cbiAqIEBwYXJhbSBhcmdzIFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhwb3J0SnNvbiggYXJnczogeyBwYXRoVVVJRDogc3RyaW5nLCBkYXRhOiBhbnkgfSApXG57XG4gICAgdHJ5XG4gICAge1xuICAgICAgICBjb25zb2xlLmxvZyggJ+mWi+Wni+Wvq+WFpSBKU09OIOizh+aWmeWIsCBGaXNoUm9vdHMg6LOH5paZ5aS+JywgYXJncy5kYXRhICk7XG4gICAgICAgIGNvbnN0IGFzc2V0UGF0aCA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoICdhc3NldC1kYicsICdxdWVyeS1wYXRoJywgYXJncy5wYXRoVVVJRCApO1xuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKCBhc3NldFBhdGgsIEpTT04uc3RyaW5naWZ5KCBhcmdzLmRhdGEgKSApO1xuICAgICAgICBFZGl0b3IuTWVzc2FnZS5zZW5kKCAnYXNzZXQtZGInLCAncmVmcmVzaC1hc3NldCcsIGFyZ3MucGF0aFVVSUQgKTtcbiAgICAgICAgY29uc29sZS5sb2coICflr6vlhaXmiJDlip8nICk7XG4gICAgfVxuICAgIGNhdGNoICggZXJyIClcbiAgICB7XG4gICAgICAgIC8vIOWvq+WFpeWkseaVl1xuICAgICAgICBjb25zb2xlLmVycm9yKCAn5a+r5YWl5aSx5pWXOicsIGVyciApO1xuICAgIH1cblxufVxuLyoqXG4gKiBAZW4gTWV0aG9kIFRyaWdnZXJlZCBvbiBFeHRlbnNpb24gU3RhcnR1cFxuICogQHpoIOaJqeWxleWQr+WKqOaXtuinpuWPkeeahOaWueazlVxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9hZCgpIHsgfVxuXG4vKipcbiAqIEBlbiBNZXRob2QgdHJpZ2dlcmVkIHdoZW4gdW5pbnN0YWxsaW5nIHRoZSBleHRlbnNpb25cbiAqIEB6aCDljbjovb3mianlsZXml7bop6blj5HnmoTmlrnms5VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVubG9hZCgpIHsgfVxuIl19