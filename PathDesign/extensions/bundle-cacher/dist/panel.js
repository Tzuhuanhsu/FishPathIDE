'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.close = exports.ready = exports.update = exports.$ = exports.template = exports.style = void 0;
const global_1 = require("./global");
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const vue_1 = require("vue");
let panel;
exports.style = fs_1.default.readFileSync((0, path_1.join)(__dirname, '../static/style.css'), 'utf8');
exports.template = fs_1.default.readFileSync((0, path_1.join)(__dirname, '../static/template.html'), 'utf8');
exports.$ = {
    root: '#build-plugin',
    compress: '#compress',
    forceClear: '#force-clear',
};
const panelDataMap = new WeakMap();
const bundleSettings = {};
const cacheSettings = {};
function update(options, key) {
    return __awaiter(this, void 0, void 0, function* () {
        if (key === 'bundleConfigs') {
            yield UpdateBundleConfigs(options);
            const app = panelDataMap.get(panel);
            if (app) {
                app._instance.update();
            }
        }
    });
}
exports.update = update;
function UpdateBundleConfigs(options) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let key in bundleSettings) {
            delete bundleSettings[key];
        }
        const configs = options.bundleConfigs;
        if (configs.length > 0) {
            for (let i = 0; i < configs.length; i++) {
                const url = configs[i].root !== "" ? configs[i].root : "internal";
                bundleSettings[options.bundleConfigs[i].name] = url;
            }
        }
        else {
            yield vueCheckBundles(bundleSettings);
        }
        for (let bundle in bundleSettings) {
            if (!cacheSettings[bundle]) {
                cacheSettings[bundle] = { needZip: true, forceClear: false };
            }
        }
    });
}
function ready(options) {
    panel = this;
    panel.options = options;
    UpdateBundleConfigs(options).then(vueInit);
}
exports.ready = ready;
function close() {
    vueClose();
}
exports.close = close;
function vueInit() {
    if (panel.$.root) {
        const app = (0, vue_1.createApp)({
            data() {
                return {
                    bundles: bundleSettings,
                    settings: cacheSettings,
                };
            },
            methods: {
                changeZip(bundle, event) {
                    this.settings[bundle].needZip = event.target.value;
                    this.dispatchSettings();
                },
                changeClear(bundle, event) {
                    this.settings[bundle].forceClear = event.target.value;
                    this.dispatchSettings();
                },
                dispatchSettings() {
                    panel.dispatch('update', `packages.${global_1.PACKAGE_NAME}.settings`, cacheSettings);
                }
            },
            beforeMount() {
                return __awaiter(this, void 0, void 0, function* () {
                    const pkgOptions = panel.options.packages[global_1.PACKAGE_NAME];
                    if (!pkgOptions) {
                        this.dispatchSettings();
                    }
                    else {
                        for (const bundle in pkgOptions.settings) {
                            this.settings[bundle] = pkgOptions.settings[bundle];
                        }
                    }
                    this.dispatchSettings();
                });
            },
            onBeforeUpdate() {
                console.log('onBeforeUpdate');
            }
        });
        app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ui-');
        app.mount(panel.$.root);
        panelDataMap.set(panel, app);
    }
}
function vueClose() {
    const app = panelDataMap.get(panel);
    if (app) {
        app.unmount();
    }
}
function vueCheckBundles(bundles) {
    return __awaiter(this, void 0, void 0, function* () {
        bundles['main'] = 'internal';
        bundles['internal'] = 'internal';
        const assets = yield Editor.Message.request('asset-db', 'query-assets', { pattern: 'db://**' });
        for (const asset of assets) {
            if (!asset.isDirectory) {
                continue;
            }
            const meta = yield Editor.Message.request('asset-db', 'query-asset-meta', asset.uuid);
            if (!meta.userData.isBundle) {
                continue;
            }
            const bundleName = meta.userData.bundleName ? meta.userData.bundleName : asset.name;
            bundles[bundleName] = asset.url;
        }
    });
}
