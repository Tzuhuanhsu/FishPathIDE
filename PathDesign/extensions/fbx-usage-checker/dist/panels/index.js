"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const vue_1 = require("vue");
const package_json_1 = __importDefault(require("../../package.json"));
const fs_1 = __importDefault(require("fs"));
const panelDataMap = new WeakMap();
/**
 * @zh 如果希望兼容 3.3 之前的版本可以使用下方的代码
 * @en You can add the code below if you want compatibility with versions prior to 3.3
 */
// Editor.Panel.define = Editor.Panel.define || function(options: any) { return options }
module.exports = Editor.Panel.define({
    listeners: {
        show() {
            console.log('show');
        },
        hide() { console.log('hide'); },
    },
    template: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../static/template/default/index.html'), 'utf-8'),
    style: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../static/style/default/index.css'), 'utf-8'),
    $: {
        app: '#app',
    },
    methods: {},
    ready() {
        if (this.$.app) {
            const app = (0, vue_1.createApp)({
                data() {
                    return {
                        warningAssets: {},
                        isScanning: false,
                    };
                },
                methods: {
                    async checkAssets() {
                        this.isScanning = true;
                        const params = { name: package_json_1.default.name, method: 'Query', args: [] };
                        this.warningAssets = await Editor.Message.request('scene', 'execute-scene-script', params);
                        this.isScanning = false;
                    },
                    clear() {
                        this.warningAssets = {};
                    },
                    async resolveDependency(depInfo, replacedUuid) {
                        const depUuid = depInfo.uuid;
                        const depAssetInfo = await Editor.Message.request('asset-db', 'query-asset-info', replacedUuid);
                        if (depAssetInfo == undefined) {
                            Editor.Dialog.error('Asset not found');
                            return;
                        }
                        const result = await Editor.Dialog.warn(`Replace asset ${depInfo.url} with ${depAssetInfo.url}`, {
                            title: '變更依賴資源',
                            buttons: ['確認', '取消'],
                        });
                        //skip if cancel
                        if (result.response == 1) {
                            return;
                        }
                        const targetAssets = this.warningAssets[depUuid].relativeAssets;
                        for (let assetUuid in targetAssets) {
                            await ReplaceAsset(targetAssets[assetUuid].info, depUuid, replacedUuid);
                        }
                        await this.checkAssets();
                    },
                },
                beforeMount() {
                    this.checkAssets();
                }
            });
            app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ui-');
            app.mount(this.$.app);
            panelDataMap.set(this, app);
        }
    },
    beforeClose() {
    },
    close() {
        console.log('close');
        const app = panelDataMap.get(this);
        if (app) {
            app.unmount();
        }
    },
});
async function ReplaceAsset(assetInfo, targetUuid, replacedUuid) {
    const content = fs_1.default.readFileSync(assetInfo.file, 'utf-8');
    const re = new RegExp(targetUuid, 'g');
    const replaced = content.replace(re, replacedUuid);
    fs_1.default.writeFileSync(assetInfo.file, replaced);
    await Editor.Message.request('asset-db', 'refresh-asset', assetInfo.uuid);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zb3VyY2UvcGFuZWxzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQ0EsdUNBQXdDO0FBQ3hDLCtCQUE0QjtBQUM1Qiw2QkFBcUM7QUFDckMsc0VBQTZDO0FBQzdDLDRDQUFvQjtBQUVwQixNQUFNLFlBQVksR0FBRyxJQUFJLE9BQU8sRUFBWSxDQUFDO0FBRTdDOzs7R0FHRztBQUNILHlGQUF5RjtBQUN6RixNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0lBQ3BDLFNBQVMsRUFBRTtRQUNWLElBQUk7WUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JCLENBQUM7UUFDRCxJQUFJLEtBQUssT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDL0I7SUFDRCxRQUFRLEVBQUUsSUFBQSx1QkFBWSxFQUFDLElBQUEsV0FBSSxFQUFDLFNBQVMsRUFBRSwwQ0FBMEMsQ0FBQyxFQUFFLE9BQU8sQ0FBQztJQUM1RixLQUFLLEVBQUUsSUFBQSx1QkFBWSxFQUFDLElBQUEsV0FBSSxFQUFDLFNBQVMsRUFBRSxzQ0FBc0MsQ0FBQyxFQUFFLE9BQU8sQ0FBQztJQUNyRixDQUFDLEVBQUU7UUFDRixHQUFHLEVBQUUsTUFBTTtLQUNYO0lBQ0QsT0FBTyxFQUFFLEVBQ1I7SUFDRCxLQUFLO1FBQ0osSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ2hCLE1BQU0sR0FBRyxHQUFHLElBQUEsZUFBUyxFQUFDO2dCQUNyQixJQUFJO29CQUNILE9BQU87d0JBQ04sYUFBYSxFQUFFLEVBQUU7d0JBQ2pCLFVBQVUsRUFBRSxLQUFLO3FCQUNqQixDQUFBO2dCQUNGLENBQUM7Z0JBQ0QsT0FBTyxFQUFDO29CQUNQLEtBQUssQ0FBQyxXQUFXO3dCQUNoQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQzt3QkFFdkIsTUFBTSxNQUFNLEdBQUcsRUFBQyxJQUFJLEVBQUUsc0JBQVcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFDLENBQUM7d0JBQ25FLElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxDQUFDLENBQUM7d0JBRTNGLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO29CQUN6QixDQUFDO29CQUNELEtBQUs7d0JBQ0osSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7b0JBQ3pCLENBQUM7b0JBQ0QsS0FBSyxDQUFDLGlCQUFpQixDQUFDLE9BQWtCLEVBQUUsWUFBb0I7d0JBQy9ELE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7d0JBQzdCLE1BQU0sWUFBWSxHQUFHLE1BQU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLGtCQUFrQixFQUFFLFlBQVksQ0FBQyxDQUFDO3dCQUNoRyxJQUFHLFlBQVksSUFBSSxTQUFTLEVBQUMsQ0FBQzs0QkFDN0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQzs0QkFDdkMsT0FBTzt3QkFDUixDQUFDO3dCQUVELE1BQU0sTUFBTSxHQUFHLE1BQU0sTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLE9BQU8sQ0FBQyxHQUFHLFNBQVMsWUFBWSxDQUFDLEdBQUcsRUFBRSxFQUFFOzRCQUNoRyxLQUFLLEVBQUUsUUFBUTs0QkFDZixPQUFPLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDO3lCQUNyQixDQUFDLENBQUE7d0JBRUYsZ0JBQWdCO3dCQUNoQixJQUFHLE1BQU0sQ0FBQyxRQUFRLElBQUksQ0FBQyxFQUFDLENBQUM7NEJBQ3hCLE9BQU87d0JBQ1IsQ0FBQzt3QkFFRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLGNBQWMsQ0FBQzt3QkFDaEUsS0FBSSxJQUFJLFNBQVMsSUFBSSxZQUFZLEVBQUMsQ0FBQzs0QkFDbEMsTUFBTSxZQUFZLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7d0JBQ3pFLENBQUM7d0JBRUQsTUFBTSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7b0JBQzFCLENBQUM7aUJBQ0Q7Z0JBQ0QsV0FBVztvQkFDVixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ3BCLENBQUM7YUFDRCxDQUFDLENBQUM7WUFDSCxHQUFHLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxlQUFlLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDNUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3RCLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzdCLENBQUM7SUFDRixDQUFDO0lBQ0QsV0FBVztJQUVYLENBQUM7SUFDRCxLQUFLO1FBQ0osT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNyQixNQUFNLEdBQUcsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25DLElBQUksR0FBRyxFQUFFLENBQUM7WUFDVCxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDZixDQUFDO0lBQ0YsQ0FBQztDQUNELENBQUMsQ0FBQztBQUVILEtBQUssVUFBVSxZQUFZLENBQUMsU0FBb0IsRUFBRSxVQUFrQixFQUFFLFlBQW9CO0lBQ3pGLE1BQU0sT0FBTyxHQUFHLFlBQUUsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxPQUFPLENBQVcsQ0FBQztJQUNuRSxNQUFNLEVBQUUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDdkMsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDbkQsWUFBRSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBRTNDLE1BQU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLGVBQWUsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0UsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFzc2V0SW5mbyB9IGZyb20gJ0Bjb2Nvcy9jcmVhdG9yLXR5cGVzL2VkaXRvci9wYWNrYWdlcy9hc3NldC1kYi9AdHlwZXMvcHVibGljJztcclxuaW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IGNyZWF0ZUFwcCwgQXBwIH0gZnJvbSAndnVlJztcclxuaW1wb3J0IHBhY2thZ2VKU09OIGZyb20gJy4uLy4uL3BhY2thZ2UuanNvbic7XHJcbmltcG9ydCBmcyBmcm9tICdmcyc7XHJcblxyXG5jb25zdCBwYW5lbERhdGFNYXAgPSBuZXcgV2Vha01hcDxhbnksIEFwcD4oKTtcclxuXHJcbi8qKlxyXG4gKiBAemgg5aaC5p6c5biM5pyb5YW85a65IDMuMyDkuYvliY3nmoTniYjmnKzlj6/ku6Xkvb/nlKjkuIvmlrnnmoTku6PnoIFcclxuICogQGVuIFlvdSBjYW4gYWRkIHRoZSBjb2RlIGJlbG93IGlmIHlvdSB3YW50IGNvbXBhdGliaWxpdHkgd2l0aCB2ZXJzaW9ucyBwcmlvciB0byAzLjNcclxuICovXHJcbi8vIEVkaXRvci5QYW5lbC5kZWZpbmUgPSBFZGl0b3IuUGFuZWwuZGVmaW5lIHx8IGZ1bmN0aW9uKG9wdGlvbnM6IGFueSkgeyByZXR1cm4gb3B0aW9ucyB9XHJcbm1vZHVsZS5leHBvcnRzID0gRWRpdG9yLlBhbmVsLmRlZmluZSh7XHJcblx0bGlzdGVuZXJzOiB7XHJcblx0XHRzaG93KCkge1xyXG5cdFx0XHRjb25zb2xlLmxvZygnc2hvdycpO1xyXG5cdFx0fSxcclxuXHRcdGhpZGUoKSB7IGNvbnNvbGUubG9nKCdoaWRlJyk7IH0sXHJcblx0fSxcclxuXHR0ZW1wbGF0ZTogcmVhZEZpbGVTeW5jKGpvaW4oX19kaXJuYW1lLCAnLi4vLi4vc3RhdGljL3RlbXBsYXRlL2RlZmF1bHQvaW5kZXguaHRtbCcpLCAndXRmLTgnKSxcclxuXHRzdHlsZTogcmVhZEZpbGVTeW5jKGpvaW4oX19kaXJuYW1lLCAnLi4vLi4vc3RhdGljL3N0eWxlL2RlZmF1bHQvaW5kZXguY3NzJyksICd1dGYtOCcpLFxyXG5cdCQ6IHtcclxuXHRcdGFwcDogJyNhcHAnLFx0XHRcclxuXHR9LFxyXG5cdG1ldGhvZHM6IHtcdFx0XHJcblx0fSxcclxuXHRyZWFkeSgpIHtcdFx0XHJcblx0XHRpZiAodGhpcy4kLmFwcCkge1xyXG5cdFx0XHRjb25zdCBhcHAgPSBjcmVhdGVBcHAoe1xyXG5cdFx0XHRcdGRhdGEoKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdFx0XHR3YXJuaW5nQXNzZXRzOiB7fSxcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0aXNTY2FubmluZzogZmFsc2UsXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRtZXRob2RzOntcclxuXHRcdFx0XHRcdGFzeW5jIGNoZWNrQXNzZXRzKCl7XHJcblx0XHRcdFx0XHRcdHRoaXMuaXNTY2FubmluZyA9IHRydWU7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0Y29uc3QgcGFyYW1zID0ge25hbWU6IHBhY2thZ2VKU09OLm5hbWUsIG1ldGhvZDogJ1F1ZXJ5JywgYXJnczogW119O1xyXG5cdFx0XHRcdFx0XHR0aGlzLndhcm5pbmdBc3NldHMgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdleGVjdXRlLXNjZW5lLXNjcmlwdCcsIHBhcmFtcyk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdHRoaXMuaXNTY2FubmluZyA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdGNsZWFyKCl7XHJcblx0XHRcdFx0XHRcdHRoaXMud2FybmluZ0Fzc2V0cyA9IHt9O1x0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0fSxcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRhc3luYyByZXNvbHZlRGVwZW5kZW5jeShkZXBJbmZvOiBBc3NldEluZm8sIHJlcGxhY2VkVXVpZDogc3RyaW5nKXtcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0Y29uc3QgZGVwVXVpZCA9IGRlcEluZm8udXVpZDtcclxuXHRcdFx0XHRcdFx0Y29uc3QgZGVwQXNzZXRJbmZvID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAncXVlcnktYXNzZXQtaW5mbycsIHJlcGxhY2VkVXVpZCk7XHJcblx0XHRcdFx0XHRcdGlmKGRlcEFzc2V0SW5mbyA9PSB1bmRlZmluZWQpe1xyXG5cdFx0XHRcdFx0XHRcdEVkaXRvci5EaWFsb2cuZXJyb3IoJ0Fzc2V0IG5vdCBmb3VuZCcpO1xyXG5cdFx0XHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgRWRpdG9yLkRpYWxvZy53YXJuKGBSZXBsYWNlIGFzc2V0ICR7ZGVwSW5mby51cmx9IHdpdGggJHtkZXBBc3NldEluZm8udXJsfWAsIHtcdFx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRcdHRpdGxlOiAn6K6K5pu05L6d6LO06LOH5rqQJyxcclxuXHRcdFx0XHRcdFx0XHRidXR0b25zOiBbJ+eiuuiqjScsICflj5bmtognXSxcdFx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHR9KVxyXG5cclxuXHRcdFx0XHRcdFx0Ly9za2lwIGlmIGNhbmNlbFxyXG5cdFx0XHRcdFx0XHRpZihyZXN1bHQucmVzcG9uc2UgPT0gMSl7XHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRjb25zdCB0YXJnZXRBc3NldHMgPSB0aGlzLndhcm5pbmdBc3NldHNbZGVwVXVpZF0ucmVsYXRpdmVBc3NldHM7XHJcblx0XHRcdFx0XHRcdGZvcihsZXQgYXNzZXRVdWlkIGluIHRhcmdldEFzc2V0cyl7XHJcblx0XHRcdFx0XHRcdFx0YXdhaXQgUmVwbGFjZUFzc2V0KHRhcmdldEFzc2V0c1thc3NldFV1aWRdLmluZm8sIGRlcFV1aWQsIHJlcGxhY2VkVXVpZCk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuY2hlY2tBc3NldHMoKTtcclxuXHRcdFx0XHRcdH0sXHRcdFx0XHRcclxuXHRcdFx0XHR9LFx0XHJcblx0XHRcdFx0YmVmb3JlTW91bnQoKSB7XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0dGhpcy5jaGVja0Fzc2V0cygpO1x0XHRcdFxyXG5cdFx0XHRcdH1cdFxyXG5cdFx0XHR9KTtcclxuXHRcdFx0YXBwLmNvbmZpZy5jb21waWxlck9wdGlvbnMuaXNDdXN0b21FbGVtZW50ID0gKHRhZykgPT4gdGFnLnN0YXJ0c1dpdGgoJ3VpLScpO1xyXG5cdFx0XHRhcHAubW91bnQodGhpcy4kLmFwcCk7XHJcblx0XHRcdHBhbmVsRGF0YU1hcC5zZXQodGhpcywgYXBwKTtcdFx0XHJcblx0XHR9XHJcblx0fSxcclxuXHRiZWZvcmVDbG9zZSgpIHtcclxuXHJcblx0fSxcclxuXHRjbG9zZSgpIHtcclxuXHRcdGNvbnNvbGUubG9nKCdjbG9zZScpO1xyXG5cdFx0Y29uc3QgYXBwID0gcGFuZWxEYXRhTWFwLmdldCh0aGlzKTtcclxuXHRcdGlmIChhcHApIHtcclxuXHRcdFx0YXBwLnVubW91bnQoKTtcclxuXHRcdH1cclxuXHR9LFxyXG59KTtcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIFJlcGxhY2VBc3NldChhc3NldEluZm86IEFzc2V0SW5mbywgdGFyZ2V0VXVpZDogc3RyaW5nLCByZXBsYWNlZFV1aWQ6IHN0cmluZyl7XHJcblx0Y29uc3QgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhhc3NldEluZm8uZmlsZSwgJ3V0Zi04JykgYXMgc3RyaW5nO1xyXG5cdGNvbnN0IHJlID0gbmV3IFJlZ0V4cCh0YXJnZXRVdWlkLCAnZycpO1xyXG5cdGNvbnN0IHJlcGxhY2VkID0gY29udGVudC5yZXBsYWNlKHJlLCByZXBsYWNlZFV1aWQpO1xyXG5cdGZzLndyaXRlRmlsZVN5bmMoYXNzZXRJbmZvLmZpbGUsIHJlcGxhY2VkKTtcclxuXHJcblx0YXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAncmVmcmVzaC1hc3NldCcsIGFzc2V0SW5mby51dWlkKTtcclxufSJdfQ==