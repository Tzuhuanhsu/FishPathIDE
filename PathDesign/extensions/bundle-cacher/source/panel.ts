'use strict';

import { AssetInfo } from '@cocos/creator-types/editor/packages/asset-db/@types/public';
import { ICustomPanelThis, ITaskOptions } from '../@types';
import { PACKAGE_NAME } from './global';
import fs from 'fs';
import { join } from 'path';
import { createApp, App } from 'vue';
let panel: ICustomPanelThis;

export const style = fs.readFileSync(join(__dirname, '../static/style.css'), 'utf8');
export const template = fs.readFileSync(join(__dirname, '../static/template.html'), 'utf8');

export const $ = {
	root: '#build-plugin',
	compress: '#compress',
	forceClear: '#force-clear',
};

const panelDataMap = new WeakMap<any, App>();
const bundleSettings = {};
const cacheSettings = {};

export async function update(options: ITaskOptions, key: string) {
	if (key === 'bundleConfigs') {
		await UpdateBundleConfigs(options);

		const app = panelDataMap.get(panel);
		if (app) {
			app._instance.update();
		}
	}
}

async function UpdateBundleConfigs(options: ITaskOptions) {
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
		await vueCheckBundles(bundleSettings);
	}

	for (let bundle in bundleSettings) {
		if (!cacheSettings[bundle]) {
			cacheSettings[bundle] = { needZip: true, forceClear: false };
		}
	}
}

export function ready(options: ITaskOptions) {
	panel = this as ICustomPanelThis;
	panel.options = options;
	UpdateBundleConfigs(options).then(vueInit);	
}

export function close() {
	vueClose();
}

function vueInit() {
	if (panel.$.root) {
		const app = createApp({
			data() {
				return {
					bundles: bundleSettings,
					settings: cacheSettings,
				}
			},
			methods: {
				changeZip(bundle: string, event: any) {
					this.settings[bundle].needZip = event.target.value;
					this.dispatchSettings();
				},
				changeClear(bundle: string, event: any) {
					this.settings[bundle].forceClear = event.target.value;
					this.dispatchSettings();
				},
				dispatchSettings() {
					panel.dispatch('update', `packages.${PACKAGE_NAME}.settings`, cacheSettings);
				}
			},
			async beforeMount() {
				const pkgOptions = panel.options.packages[PACKAGE_NAME];
				if (!pkgOptions) {
					this.dispatchSettings();
				}
				else {
					for (const bundle in pkgOptions.settings) {
						this.settings[bundle] = pkgOptions.settings[bundle];
					}
				}

				this.dispatchSettings();
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

interface BundleInfos {
	[name: string]: string;
}

async function vueCheckBundles(bundles: BundleInfos) {
	bundles['main'] = 'internal';
	bundles['internal'] = 'internal';
	const assets: AssetInfo[] = await Editor.Message.request('asset-db', 'query-assets', { pattern: 'db://**' });
	for (const asset of assets) {
		if (!asset.isDirectory) {
			continue;
		}
		const meta = await Editor.Message.request('asset-db', 'query-asset-meta', asset.uuid);
		if (!meta.userData.isBundle) {
			continue;
		}

		const bundleName = meta.userData.bundleName ? meta.userData.bundleName : asset.name;
		bundles[bundleName] = asset.url;
	}
}