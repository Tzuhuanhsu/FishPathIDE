"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryAndOutput = exports.methods = exports.unload = exports.load = void 0;
const path_1 = require("path");
module.paths.push((0, path_1.join)(Editor.App.path, 'node_modules'));
const cc_1 = require("cc");
const fs_1 = __importDefault(require("fs"));
function load() { }
exports.load = load;
;
function unload() { }
exports.unload = unload;
;
exports.methods = {
    async Query() {
        const config = JSON.parse(fs_1.default.readFileSync((0, path_1.join)(__dirname, '../static/config.json'), 'utf-8'));
        console.log('QueryConfig:', config);
        let infos = await QueryAssets(config.searchExt);
        return await ProcessAssets(infos, config);
    }
};
async function QueryAndOutput() {
    const warningAssets = await exports.methods.Query();
    const json = JSON.stringify(warningAssets);
    fs_1.default.writeFileSync((0, path_1.join)(__dirname, '../../../fbxUsageWarnings.json'), json);
    let xml = '';
    for (let depUuid in warningAssets) {
        const depInfo = warningAssets[depUuid].info;
        for (let assetUuid in warningAssets[depUuid].relativeAssets) {
            const detail = warningAssets[depUuid].relativeAssets[assetUuid];
            xml += `<${depInfo.importer} File=\"${depInfo.url}\" Line=\"${detail.info.url}\" Size=\"${detail.refs}\" Priority=\"normal\" />\r\n`;
        }
    }
    fs_1.default.writeFileSync((0, path_1.join)(__dirname, '../../../fbxUsageWarnings.xml'), xml);
}
exports.QueryAndOutput = QueryAndOutput;
async function getDependencies(assetUuid) {
    return new Promise((resolve, reject) => {
        cc_1.assetManager.loadAny(assetUuid, (err, asset) => {
            if (err) {
                console.error(err);
                reject(err);
            }
            else {
                const deps = cc_1.assetManager.dependUtil.getDeps(assetUuid);
                cc_1.assetManager.releaseAsset(asset);
                resolve(deps);
            }
        });
    });
}
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
async function ProcessAssets(assets, config) {
    var _a;
    let warningAssets = {};
    if (assets) {
        for (let asset of assets) {
            //console.log('Asset Info:', asset);
            const deps = await getDependencies(asset.uuid);
            for (let depUuid of deps) {
                const index = depUuid.indexOf('@');
                if (index == -1) {
                    continue;
                }
                // dependAsset is subasset
                const depMainUuid = depUuid.substring(0, index);
                let depMainAssetInfo = await Editor.Message.request('asset-db', 'query-asset-info', depMainUuid);
                if ((depMainAssetInfo === null || depMainAssetInfo === void 0 ? void 0 : depMainAssetInfo.importer) === config.mainAssetImporter) {
                    let depAssetInfo = await Editor.Message.request('asset-db', 'query-asset-info', depUuid);
                    if (depAssetInfo == undefined) {
                        continue;
                    }
                    // pick up sub asset not match fbxSubAsset
                    if (!((_a = depAssetInfo === null || depAssetInfo === void 0 ? void 0 : depAssetInfo.instantiation) === null || _a === void 0 ? void 0 : _a.match(`^(${config.subAssetFilter})$`))) {
                        console.warn('Detect invalid sub asset:', depAssetInfo);
                        if (!(depUuid in warningAssets)) {
                            warningAssets[depUuid] = { info: depAssetInfo, relativeAssets: {}, isExpand: false, refs: 0, replacedUuid: undefined };
                        }
                        warningAssets[depUuid].refs++;
                        if (!(asset.uuid in warningAssets[depUuid].relativeAssets)) {
                            warningAssets[depUuid].relativeAssets[asset.uuid] = { info: asset, refs: 0 };
                        }
                        warningAssets[depUuid].relativeAssets[asset.uuid].refs++;
                    }
                }
            }
        }
    }
    return warningAssets;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NlbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zb3VyY2Uvc2NlbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsK0JBQTRCO0FBQzVCLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUEsV0FBSSxFQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7QUFDekQsMkJBQWtDO0FBR2xDLDRDQUFvQjtBQUVwQixTQUFnQixJQUFJLEtBQUssQ0FBQztBQUExQixvQkFBMEI7QUFBQSxDQUFDO0FBQzNCLFNBQWdCLE1BQU0sS0FBSyxDQUFDO0FBQTVCLHdCQUE0QjtBQUFBLENBQUM7QUFDaEIsUUFBQSxPQUFPLEdBQUc7SUFDdEIsS0FBSyxDQUFDLEtBQUs7UUFDVixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQUUsQ0FBQyxZQUFZLENBQUMsSUFBQSxXQUFJLEVBQUMsU0FBUyxFQUFFLHVCQUF1QixDQUFDLEVBQUUsT0FBTyxDQUFDLENBQWdCLENBQUM7UUFDN0csT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDcEMsSUFBSSxLQUFLLEdBQUcsTUFBTSxXQUFXLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2hELE9BQU8sTUFBTSxhQUFhLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzNDLENBQUM7Q0FDRCxDQUFDO0FBRUssS0FBSyxVQUFVLGNBQWM7SUFDbkMsTUFBTSxhQUFhLEdBQUcsTUFBTSxlQUFPLENBQUMsS0FBSyxFQUFtQixDQUFDO0lBQzdELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDM0MsWUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFBLFdBQUksRUFBQyxTQUFTLEVBQUUsZ0NBQWdDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUUxRSxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7SUFDYixLQUFLLElBQUksT0FBTyxJQUFJLGFBQWEsRUFBRSxDQUFDO1FBQ25DLE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDNUMsS0FBSyxJQUFJLFNBQVMsSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDN0QsTUFBTSxNQUFNLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNoRSxHQUFHLElBQUksSUFBSSxPQUFPLENBQUMsUUFBUSxXQUFXLE9BQU8sQ0FBQyxHQUFHLGFBQWEsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLGFBQWEsTUFBTSxDQUFDLElBQUksK0JBQStCLENBQUM7UUFDdEksQ0FBQztJQUNGLENBQUM7SUFDRCxZQUFFLENBQUMsYUFBYSxDQUFDLElBQUEsV0FBSSxFQUFDLFNBQVMsRUFBRSwrQkFBK0IsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3pFLENBQUM7QUFkRCx3Q0FjQztBQUVELEtBQUssVUFBVSxlQUFlLENBQUMsU0FBaUI7SUFDL0MsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUN0QyxpQkFBWSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDOUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDVCxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNuQixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDYixDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsTUFBTSxJQUFJLEdBQUcsaUJBQVksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUN4RCxpQkFBWSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDakMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2YsQ0FBQztRQUNGLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDO0FBRUQsS0FBSyxVQUFVLFdBQVcsQ0FBQyxHQUFXO0lBQ3JDLElBQUksVUFBVSxHQUFHLFNBQVMsQ0FBQztJQUMzQixNQUFNLEtBQUssR0FBRyxvQkFBb0IsR0FBRyxFQUFFLENBQUM7SUFDeEMsTUFBTSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsY0FBYyxFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7UUFDM0YsVUFBVSxHQUFHLEtBQUssQ0FBQztJQUNwQixDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUU7UUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLGNBQWMsR0FBRyxHQUFHLENBQUMsQ0FBQztJQUNyQyxDQUFDLENBQUMsQ0FBQztJQUVILE9BQU8sVUFBVSxDQUFDO0FBQ25CLENBQUM7QUFFRCxLQUFLLFVBQVUsYUFBYSxDQUFDLE1BQStCLEVBQUUsTUFBbUI7O0lBQ2hGLElBQUksYUFBYSxHQUFrQixFQUFFLENBQUM7SUFDdEMsSUFBSSxNQUFNLEVBQUUsQ0FBQztRQUNaLEtBQUssSUFBSSxLQUFLLElBQUksTUFBTSxFQUFFLENBQUM7WUFDMUIsb0NBQW9DO1lBQ3BDLE1BQU0sSUFBSSxHQUFHLE1BQU0sZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMvQyxLQUFLLElBQUksT0FBTyxJQUFJLElBQUksRUFBRSxDQUFDO2dCQUMxQixNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNuQyxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO29CQUNqQixTQUFTO2dCQUNWLENBQUM7Z0JBRUQsMEJBQTBCO2dCQUMxQixNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDaEQsSUFBSSxnQkFBZ0IsR0FBRyxNQUFNLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxrQkFBa0IsRUFBRSxXQUFXLENBQUMsQ0FBQztnQkFDakcsSUFBSSxDQUFBLGdCQUFnQixhQUFoQixnQkFBZ0IsdUJBQWhCLGdCQUFnQixDQUFFLFFBQVEsTUFBSyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztvQkFDN0QsSUFBSSxZQUFZLEdBQUcsTUFBTSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsa0JBQWtCLEVBQUUsT0FBTyxDQUFDLENBQUM7b0JBRXpGLElBQUcsWUFBWSxJQUFJLFNBQVMsRUFBQyxDQUFDO3dCQUM3QixTQUFTO29CQUNWLENBQUM7b0JBRUQsMENBQTBDO29CQUMxQyxJQUFJLENBQUMsQ0FBQSxNQUFBLFlBQVksYUFBWixZQUFZLHVCQUFaLFlBQVksQ0FBRSxhQUFhLDBDQUFFLEtBQUssQ0FBQyxLQUFLLE1BQU0sQ0FBQyxjQUFjLElBQUksQ0FBQyxDQUFBLEVBQUUsQ0FBQzt3QkFDekUsT0FBTyxDQUFDLElBQUksQ0FBQywyQkFBMkIsRUFBRSxZQUFZLENBQUMsQ0FBQzt3QkFFeEQsSUFBRyxDQUFDLENBQUMsT0FBTyxJQUFJLGFBQWEsQ0FBQyxFQUFDLENBQUM7NEJBQy9CLGFBQWEsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBQyxDQUFDO3dCQUN0SCxDQUFDO3dCQUVELGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQzt3QkFDOUIsSUFBRyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsY0FBYyxDQUFDLEVBQUMsQ0FBQzs0QkFDMUQsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUMsQ0FBQzt3QkFDNUUsQ0FBQzt3QkFDRCxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDMUQsQ0FBQztnQkFDRixDQUFDO1lBQ0YsQ0FBQztRQUNGLENBQUM7SUFDRixDQUFDO0lBRUQsT0FBTyxhQUFhLENBQUM7QUFDdEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcclxubW9kdWxlLnBhdGhzLnB1c2goam9pbihFZGl0b3IuQXBwLnBhdGgsICdub2RlX21vZHVsZXMnKSk7XHJcbmltcG9ydCB7IGFzc2V0TWFuYWdlciB9IGZyb20gJ2NjJztcclxuaW1wb3J0IHsgQXNzZXRJbmZvIH0gZnJvbSAnQGNvY29zL2NyZWF0b3ItdHlwZXMvZWRpdG9yL3BhY2thZ2VzL2Fzc2V0LWRiL0B0eXBlcy9wdWJsaWMnO1xyXG5pbXBvcnQgeyBRdWVyeUNvbmZpZywgV2FybmluZ0Fzc2V0cyB9IGZyb20gJy4vdHlwZXMnO1xyXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGxvYWQoKSB7IH07XHJcbmV4cG9ydCBmdW5jdGlvbiB1bmxvYWQoKSB7IH07XHJcbmV4cG9ydCBjb25zdCBtZXRob2RzID0ge1xyXG5cdGFzeW5jIFF1ZXJ5KCk6IFByb21pc2U8V2FybmluZ0Fzc2V0cz57XHJcblx0XHRjb25zdCBjb25maWcgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhqb2luKF9fZGlybmFtZSwgJy4uL3N0YXRpYy9jb25maWcuanNvbicpLCAndXRmLTgnKSkgYXMgUXVlcnlDb25maWc7XHJcblx0XHRjb25zb2xlLmxvZygnUXVlcnlDb25maWc6JywgY29uZmlnKTtcclxuXHRcdGxldCBpbmZvcyA9IGF3YWl0IFF1ZXJ5QXNzZXRzKGNvbmZpZy5zZWFyY2hFeHQpO1xyXG5cdFx0cmV0dXJuIGF3YWl0IFByb2Nlc3NBc3NldHMoaW5mb3MsIGNvbmZpZyk7XHJcblx0fVxyXG59O1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFF1ZXJ5QW5kT3V0cHV0KCl7XHJcblx0Y29uc3Qgd2FybmluZ0Fzc2V0cyA9IGF3YWl0IG1ldGhvZHMuUXVlcnkoKSBhcyBXYXJuaW5nQXNzZXRzO1xyXG5cdGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeSh3YXJuaW5nQXNzZXRzKTtcclxuXHRmcy53cml0ZUZpbGVTeW5jKGpvaW4oX19kaXJuYW1lLCAnLi4vLi4vLi4vZmJ4VXNhZ2VXYXJuaW5ncy5qc29uJyksIGpzb24pO1xyXG5cclxuXHRsZXQgeG1sID0gJyc7XHJcblx0Zm9yIChsZXQgZGVwVXVpZCBpbiB3YXJuaW5nQXNzZXRzKSB7XHJcblx0XHRjb25zdCBkZXBJbmZvID0gd2FybmluZ0Fzc2V0c1tkZXBVdWlkXS5pbmZvO1xyXG5cdFx0Zm9yIChsZXQgYXNzZXRVdWlkIGluIHdhcm5pbmdBc3NldHNbZGVwVXVpZF0ucmVsYXRpdmVBc3NldHMpIHtcclxuXHRcdFx0Y29uc3QgZGV0YWlsID0gd2FybmluZ0Fzc2V0c1tkZXBVdWlkXS5yZWxhdGl2ZUFzc2V0c1thc3NldFV1aWRdO1xyXG5cdFx0XHR4bWwgKz0gYDwke2RlcEluZm8uaW1wb3J0ZXJ9IEZpbGU9XFxcIiR7ZGVwSW5mby51cmx9XFxcIiBMaW5lPVxcXCIke2RldGFpbC5pbmZvLnVybH1cXFwiIFNpemU9XFxcIiR7ZGV0YWlsLnJlZnN9XFxcIiBQcmlvcml0eT1cXFwibm9ybWFsXFxcIiAvPlxcclxcbmA7XHJcblx0XHR9XHJcblx0fVxyXG5cdGZzLndyaXRlRmlsZVN5bmMoam9pbihfX2Rpcm5hbWUsICcuLi8uLi8uLi9mYnhVc2FnZVdhcm5pbmdzLnhtbCcpLCB4bWwpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBnZXREZXBlbmRlbmNpZXMoYXNzZXRVdWlkOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZ1tdPiB7XHJcblx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuXHRcdGFzc2V0TWFuYWdlci5sb2FkQW55KGFzc2V0VXVpZCwgKGVyciwgYXNzZXQpID0+IHtcclxuXHRcdFx0aWYgKGVycikge1xyXG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoZXJyKTtcclxuXHRcdFx0XHRyZWplY3QoZXJyKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRjb25zdCBkZXBzID0gYXNzZXRNYW5hZ2VyLmRlcGVuZFV0aWwuZ2V0RGVwcyhhc3NldFV1aWQpO1xyXG5cdFx0XHRcdGFzc2V0TWFuYWdlci5yZWxlYXNlQXNzZXQoYXNzZXQpO1xyXG5cdFx0XHRcdHJlc29sdmUoZGVwcyk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH0pO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBRdWVyeUFzc2V0cyhleHQ6IHN0cmluZyk6IFByb21pc2U8QXNzZXRJbmZvW10gfCB1bmRlZmluZWQ+IHtcdFxyXG5cdGxldCBhc3NldEluZm9zID0gdW5kZWZpbmVkO1xyXG5cdGNvbnN0IHF1ZXJ5ID0gYGRiOi8vYXNzZXRzLyoqLyouJHtleHR9YDtcdFxyXG5cdGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3F1ZXJ5LWFzc2V0cycsIHsgcGF0dGVybjogcXVlcnkgfSkudGhlbigoaW5mb3MpID0+IHtcclxuXHRcdGFzc2V0SW5mb3MgPSBpbmZvcztcdFx0XHJcblx0fSwgZXJyID0+IHtcclxuXHRcdGNvbnNvbGUuZXJyb3IoJ1F1ZXJ5QXNzZXRzOicgKyBlcnIpO1xyXG5cdH0pO1xyXG5cdFxyXG5cdHJldHVybiBhc3NldEluZm9zO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBQcm9jZXNzQXNzZXRzKGFzc2V0czogQXNzZXRJbmZvW10gfCB1bmRlZmluZWQsIGNvbmZpZzogUXVlcnlDb25maWcpOiBQcm9taXNlPFdhcm5pbmdBc3NldHM+ICB7XHJcblx0bGV0IHdhcm5pbmdBc3NldHM6IFdhcm5pbmdBc3NldHMgPSB7fTtcclxuXHRpZiAoYXNzZXRzKSB7XHJcblx0XHRmb3IgKGxldCBhc3NldCBvZiBhc3NldHMpIHtcclxuXHRcdFx0Ly9jb25zb2xlLmxvZygnQXNzZXQgSW5mbzonLCBhc3NldCk7XHJcblx0XHRcdGNvbnN0IGRlcHMgPSBhd2FpdCBnZXREZXBlbmRlbmNpZXMoYXNzZXQudXVpZCk7XHJcblx0XHRcdGZvciAobGV0IGRlcFV1aWQgb2YgZGVwcykge1xyXG5cdFx0XHRcdGNvbnN0IGluZGV4ID0gZGVwVXVpZC5pbmRleE9mKCdAJyk7XHJcblx0XHRcdFx0aWYgKGluZGV4ID09IC0xKSB7XHJcblx0XHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdC8vIGRlcGVuZEFzc2V0IGlzIHN1YmFzc2V0XHJcblx0XHRcdFx0Y29uc3QgZGVwTWFpblV1aWQgPSBkZXBVdWlkLnN1YnN0cmluZygwLCBpbmRleCk7XHJcblx0XHRcdFx0bGV0IGRlcE1haW5Bc3NldEluZm8gPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdxdWVyeS1hc3NldC1pbmZvJywgZGVwTWFpblV1aWQpO1x0XHRcdFx0XHJcblx0XHRcdFx0aWYgKGRlcE1haW5Bc3NldEluZm8/LmltcG9ydGVyID09PSBjb25maWcubWFpbkFzc2V0SW1wb3J0ZXIpIHtcclxuXHRcdFx0XHRcdGxldCBkZXBBc3NldEluZm8gPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdxdWVyeS1hc3NldC1pbmZvJywgZGVwVXVpZCk7XHJcblxyXG5cdFx0XHRcdFx0aWYoZGVwQXNzZXRJbmZvID09IHVuZGVmaW5lZCl7XHJcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdC8vIHBpY2sgdXAgc3ViIGFzc2V0IG5vdCBtYXRjaCBmYnhTdWJBc3NldFxyXG5cdFx0XHRcdFx0aWYgKCFkZXBBc3NldEluZm8/Lmluc3RhbnRpYXRpb24/Lm1hdGNoKGBeKCR7Y29uZmlnLnN1YkFzc2V0RmlsdGVyfSkkYCkpIHtcclxuXHRcdFx0XHRcdFx0Y29uc29sZS53YXJuKCdEZXRlY3QgaW52YWxpZCBzdWIgYXNzZXQ6JywgZGVwQXNzZXRJbmZvKTtcclxuXHJcblx0XHRcdFx0XHRcdGlmKCEoZGVwVXVpZCBpbiB3YXJuaW5nQXNzZXRzKSl7XHJcblx0XHRcdFx0XHRcdFx0d2FybmluZ0Fzc2V0c1tkZXBVdWlkXSA9IHtpbmZvOiBkZXBBc3NldEluZm8sIHJlbGF0aXZlQXNzZXRzOiB7fSwgaXNFeHBhbmQ6IGZhbHNlLCByZWZzOiAwLCByZXBsYWNlZFV1aWQ6IHVuZGVmaW5lZH07XHRcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0d2FybmluZ0Fzc2V0c1tkZXBVdWlkXS5yZWZzKys7XHJcblx0XHRcdFx0XHRcdGlmKCEoYXNzZXQudXVpZCBpbiB3YXJuaW5nQXNzZXRzW2RlcFV1aWRdLnJlbGF0aXZlQXNzZXRzKSl7XHJcblx0XHRcdFx0XHRcdFx0d2FybmluZ0Fzc2V0c1tkZXBVdWlkXS5yZWxhdGl2ZUFzc2V0c1thc3NldC51dWlkXSA9IHtpbmZvOiBhc3NldCwgcmVmczogMH07XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0d2FybmluZ0Fzc2V0c1tkZXBVdWlkXS5yZWxhdGl2ZUFzc2V0c1thc3NldC51dWlkXS5yZWZzKys7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gd2FybmluZ0Fzc2V0cztcclxufSJdfQ==