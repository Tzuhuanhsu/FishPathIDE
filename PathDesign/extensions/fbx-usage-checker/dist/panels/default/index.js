"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const vue_1 = require("vue");
const package_json_1 = __importDefault(require("../../../package.json"));
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
    template: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/template/default/index.html'), 'utf-8'),
    style: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/style/default/index.css'), 'utf-8'),
    $: {
        app: '#app',
    },
    methods: {
    /*hello() {
        if (this.$.text) {
            this.$.text.innerHTML = 'hello';
            console.log('[cocos-panel-html.default]: hello');
        }
    },*/
    },
    update() {
        console.log('update');
    },
    ready() {
        //console.log('ready');
        if (this.$.app) {
            const app = (0, vue_1.createApp)({
                data() {
                    return {
                        warningAssets: {},
                        queryConfig: { searchExt: '{prefab,scene}', mainAssetImporter: 'fbx', subAssetFilter: '.animation|.skeleton|.mesh' },
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
async function QueryAssets(ext) {
    let assetInfos = undefined;
    const query = `db://assets/**/*.${ext}`;
    await Editor.Message.request('asset-db', 'query-assets', { pattern: query }).then((infos) => {
        assetInfos = infos;
    }, err => {
        console.error('QueryAssets:' + err);
    });
    return assetInfos;
}
async function ReplaceAsset(assetInfo, targetUuid, replacedUuid) {
    const content = fs_1.default.readFileSync(assetInfo.file, 'utf-8');
    const re = new RegExp(targetUuid, 'g');
    const replaced = content.replace(re, replacedUuid);
    fs_1.default.writeFileSync(assetInfo.file, replaced);
    await Editor.Message.request('asset-db', 'refresh-asset', assetInfo.uuid);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zb3VyY2UvcGFuZWxzL2RlZmF1bHQvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFDQSx1Q0FBd0M7QUFDeEMsK0JBQTRCO0FBQzVCLDZCQUFxQztBQUNyQyx5RUFBZ0Q7QUFDaEQsNENBQW9CO0FBRXBCLE1BQU0sWUFBWSxHQUFHLElBQUksT0FBTyxFQUFZLENBQUM7QUFFN0M7OztHQUdHO0FBQ0gseUZBQXlGO0FBQ3pGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7SUFDcEMsU0FBUyxFQUFFO1FBQ1YsSUFBSTtZQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDckIsQ0FBQztRQUNELElBQUksS0FBSyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUMvQjtJQUNELFFBQVEsRUFBRSxJQUFBLHVCQUFZLEVBQUMsSUFBQSxXQUFJLEVBQUMsU0FBUyxFQUFFLDZDQUE2QyxDQUFDLEVBQUUsT0FBTyxDQUFDO0lBQy9GLEtBQUssRUFBRSxJQUFBLHVCQUFZLEVBQUMsSUFBQSxXQUFJLEVBQUMsU0FBUyxFQUFFLHlDQUF5QyxDQUFDLEVBQUUsT0FBTyxDQUFDO0lBQ3hGLENBQUMsRUFBRTtRQUNGLEdBQUcsRUFBRSxNQUFNO0tBQ1g7SUFDRCxPQUFPLEVBQUU7SUFDUjs7Ozs7UUFLSTtLQUNKO0lBQ0QsTUFBTTtRQUNMLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDdkIsQ0FBQztJQUNELEtBQUs7UUFDSix1QkFBdUI7UUFDdkIsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ2hCLE1BQU0sR0FBRyxHQUFHLElBQUEsZUFBUyxFQUFDO2dCQUNyQixJQUFJO29CQUNILE9BQU87d0JBQ04sYUFBYSxF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dCB7IEFzc2V0SW5mbyB9IGZyb20gJ0Bjb2Nvcy9jcmVhdG9yLXR5cGVzL2VkaXRvci9wYWNrYWdlcy9hc3NldC1kYi9AdHlwZXMvcHVibGljJztcclxuaW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IGNyZWF0ZUFwcCwgQXBwIH0gZnJvbSAndnVlJztcclxuaW1wb3J0IHBhY2thZ2VKU09OIGZyb20gJy4uLy4uLy4uL3BhY2thZ2UuanNvbic7XHJcbmltcG9ydCBmcyBmcm9tICdmcyc7XHJcblxyXG5jb25zdCBwYW5lbERhdGFNYXAgPSBuZXcgV2Vha01hcDxhbnksIEFwcD4oKTtcclxuXHJcbi8qKlxyXG4gKiBAemgg5aaC5p6c5biM5pyb5YW85a65IDMuMyDkuYvliY3nmoTniYjmnKzlj6/ku6Xkvb/nlKjkuIvmlrnnmoTku6PnoIFcclxuICogQGVuIFlvdSBjYW4gYWRkIHRoZSBjb2RlIGJlbG93IGlmIHlvdSB3YW50IGNvbXBhdGliaWxpdHkgd2l0aCB2ZXJzaW9ucyBwcmlvciB0byAzLjNcclxuICovXHJcbi8vIEVkaXRvci5QYW5lbC5kZWZpbmUgPSBFZGl0b3IuUGFuZWwuZGVmaW5lIHx8IGZ1bmN0aW9uKG9wdGlvbnM6IGFueSkgeyByZXR1cm4gb3B0aW9ucyB9XHJcbm1vZHVsZS5leHBvcnRzID0gRWRpdG9yLlBhbmVsLmRlZmluZSh7XHJcblx0bGlzdGVuZXJzOiB7XHJcblx0XHRzaG93KCkge1xyXG5cdFx0XHRjb25zb2xlLmxvZygnc2hvdycpO1xyXG5cdFx0fSxcclxuXHRcdGhpZGUoKSB7IGNvbnNvbGUubG9nKCdoaWRlJyk7IH0sXHJcblx0fSxcclxuXHR0ZW1wbGF0ZTogcmVhZEZpbGVTeW5jKGpvaW4oX19kaXJuYW1lLCAnLi4vLi4vLi4vc3RhdGljL3RlbXBsYXRlL2RlZmF1bHQvaW5kZXguaHRtbCcpLCAndXRmLTgnKSxcclxuXHRzdHlsZTogcmVhZEZpbGVTeW5jKGpvaW4oX19kaXJuYW1lLCAnLi4vLi4vLi4vc3RhdGljL3N0eWxlL2RlZmF1bHQvaW5kZXguY3NzJyksICd1dGYtOCcpLFxyXG5cdCQ6IHtcclxuXHRcdGFwcDogJyNhcHAnLFx0XHRcclxuXHR9LFxyXG5cdG1ldGhvZHM6IHtcclxuXHRcdC8qaGVsbG8oKSB7XHJcblx0XHRcdGlmICh0aGlzLiQudGV4dCkge1xyXG5cdFx0XHRcdHRoaXMuJC50ZXh0LmlubmVySFRNTCA9ICdoZWxsbyc7XHJcblx0XHRcdFx0Y29uc29sZS5sb2coJ1tjb2Nvcy1wYW5lbC1odG1sLmRlZmF1bHRdOiBoZWxsbycpO1xyXG5cdFx0XHR9XHJcblx0XHR9LCovXHRcdFxyXG5cdH0sXHJcblx0dXBkYXRlKCkge1xyXG5cdFx0Y29uc29sZS5sb2coJ3VwZGF0ZScpO1xyXG5cdH0sXHJcblx0cmVhZHkoKSB7XHJcblx0XHQvL2NvbnNvbGUubG9nKCdyZWFkeScpO1xyXG5cdFx0aWYgKHRoaXMuJC5hcHApIHtcclxuXHRcdFx0Y29uc3QgYXBwID0gY3JlYXRlQXBwKHtcclxuXHRcdFx0XHRkYXRhKCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRcdFx0d2FybmluZ0Fzc2V0czoge30sXHJcblx0XHRcdFx0XHRcdHF1ZXJ5Q29uZmlnOiB7c2VhcmNoRXh0OiAne3ByZWZhYixzY2VuZX0nLCBtYWluQXNzZXRJbXBvcnRlcjogJ2ZieCcsIHN1YkFzc2V0RmlsdGVyOiAnLmFuaW1hdGlvbnwuc2tlbGV0b258Lm1lc2gnfSxcclxuXHRcdFx0XHRcdFx0aXNTY2FubmluZzogZmFsc2UsXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRtZXRob2RzOntcclxuXHRcdFx0XHRcdGFzeW5jIGNoZWNrQXNzZXRzKCl7XHJcblx0XHRcdFx0XHRcdHRoaXMuaXNTY2FubmluZyA9IHRydWU7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0Y29uc3QgcGFyYW1zID0ge25hbWU6IHBhY2thZ2VKU09OLm5hbWUsIG1ldGhvZDogJ1F1ZXJ5JywgYXJnczogW119O1xyXG5cdFx0XHRcdFx0XHR0aGlzLndhcm5pbmdBc3NldHMgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdleGVjdXRlLXNjZW5lLXNjcmlwdCcsIHBhcmFtcyk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdHRoaXMuaXNTY2FubmluZyA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdGNsZWFyKCl7XHJcblx0XHRcdFx0XHRcdHRoaXMud2FybmluZ0Fzc2V0cyA9IHt9O1x0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0fSxcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRhc3luYyByZXNvbHZlRGVwZW5kZW5jeShkZXBJbmZvOiBBc3NldEluZm8sIHJlcGxhY2VkVXVpZDogc3RyaW5nKXtcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0Y29uc3QgZGVwVXVpZCA9IGRlcEluZm8udXVpZDtcclxuXHRcdFx0XHRcdFx0Y29uc3QgZGVwQXNzZXRJbmZvID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAncXVlcnktYXNzZXQtaW5mbycsIHJlcGxhY2VkVXVpZCk7XHJcblx0XHRcdFx0XHRcdGlmKGRlcEFzc2V0SW5mbyA9PSB1bmRlZmluZWQpe1xyXG5cdFx0XHRcdFx0XHRcdEVkaXRvci5EaWFsb2cuZXJyb3IoJ0Fzc2V0IG5vdCBmb3VuZCcpO1xyXG5cdFx0XHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgRWRpdG9yLkRpYWxvZy53YXJuKGBSZXBsYWNlIGFzc2V0ICR7ZGVwSW5mby51cmx9IHdpdGggJHtkZXBBc3NldEluZm8udXJsfWAsIHtcdFx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRcdHRpdGxlOiAn6K6K5pu05L6d6LO06LOH5rqQJyxcclxuXHRcdFx0XHRcdFx0XHRidXR0b25zOiBbJ+eiuuiqjScsICflj5bmtognXSxcdFx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHR9KVxyXG5cclxuXHRcdFx0XHRcdFx0Ly9za2lwIGlmIGNhbmNlbFxyXG5cdFx0XHRcdFx0XHRpZihyZXN1bHQucmVzcG9uc2UgPT0gMSl7XHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRjb25zdCB0YXJnZXRBc3NldHMgPSB0aGlzLndhcm5pbmdBc3NldHNbZGVwVXVpZF0ucmVsYXRpdmVBc3NldHM7XHJcblx0XHRcdFx0XHRcdGZvcihsZXQgYXNzZXRVdWlkIGluIHRhcmdldEFzc2V0cyl7XHJcblx0XHRcdFx0XHRcdFx0YXdhaXQgUmVwbGFjZUFzc2V0KHRhcmdldEFzc2V0c1thc3NldFV1aWRdLmluZm8sIGRlcFV1aWQsIHJlcGxhY2VkVXVpZCk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuY2hlY2tBc3NldHMoKTtcclxuXHRcdFx0XHRcdH0sXHRcdFx0XHRcclxuXHRcdFx0XHR9LFx0XHJcblx0XHRcdFx0YmVmb3JlTW91bnQoKSB7XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0dGhpcy5jaGVja0Fzc2V0cygpO1x0XHRcdFxyXG5cdFx0XHRcdH1cdFxyXG5cdFx0XHR9KTtcclxuXHRcdFx0YXBwLmNvbmZpZy5jb21waWxlck9wdGlvbnMuaXNDdXN0b21FbGVtZW50ID0gKHRhZykgPT4gdGFnLnN0YXJ0c1dpdGgoJ3VpLScpO1xyXG5cdFx0XHRhcHAubW91bnQodGhpcy4kLmFwcCk7XHJcblx0XHRcdHBhbmVsRGF0YU1hcC5zZXQodGhpcywgYXBwKTtcdFx0XHJcblx0XHR9XHJcblx0fSxcclxuXHRiZWZvcmVDbG9zZSgpIHtcclxuXHJcblx0fSxcclxuXHRjbG9zZSgpIHtcclxuXHRcdGNvbnNvbGUubG9nKCdjbG9zZScpO1xyXG5cdFx0Y29uc3QgYXBwID0gcGFuZWxEYXRhTWFwLmdldCh0aGlzKTtcclxuXHRcdGlmIChhcHApIHtcclxuXHRcdFx0YXBwLnVubW91bnQoKTtcclxuXHRcdH1cclxuXHR9LFxyXG59KTtcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIFF1ZXJ5QXNzZXRzKGV4dDogc3RyaW5nKTogUHJvbWlzZTxBc3NldEluZm9bXSB8IHVuZGVmaW5lZD4ge1x0XHJcblx0bGV0IGFzc2V0SW5mb3MgPSB1bmRlZmluZWQ7XHJcblx0Y29uc3QgcXVlcnkgPSBgZGI6Ly9hc3NldHMvKiovKi4ke2V4dH1gO1x0XHJcblx0YXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAncXVlcnktYXNzZXRzJywgeyBwYXR0ZXJuOiBxdWVyeSB9KS50aGVuKChpbmZvcykgPT4ge1xyXG5cdFx0YXNzZXRJbmZvcyA9IGluZm9zO1x0XHRcclxuXHR9LCBlcnIgPT4ge1xyXG5cdFx0Y29uc29sZS5lcnJvcignUXVlcnlBc3NldHM6JyArIGVycik7XHJcblx0fSk7XHJcblx0XHJcblx0cmV0dXJuIGFzc2V0SW5mb3M7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIFJlcGxhY2VBc3NldChhc3NldEluZm86IEFzc2V0SW5mbywgdGFyZ2V0VXVpZDogc3RyaW5nLCByZXBsYWNlZFV1aWQ6IHN0cmluZyl7XHJcblx0Y29uc3QgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhhc3NldEluZm8uZmlsZSwgJ3V0Zi04JykgYXMgc3RyaW5nO1xyXG5cdGNvbnN0IHJlID0gbmV3IFJlZ0V4cCh0YXJnZXRVdWlkLCAnZycpO1xyXG5cdGNvbnN0IHJlcGxhY2VkID0gY29udGVudC5yZXBsYWNlKHJlLCByZXBsYWNlZFV1aWQpO1xyXG5cdGZzLndyaXRlRmlsZVN5bmMoYXNzZXRJbmZvLmZpbGUsIHJlcGxhY2VkKTtcclxuXHJcblx0YXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAncmVmcmVzaC1hc3NldCcsIGFzc2V0SW5mby51dWlkKTtcclxufSJdfQ==