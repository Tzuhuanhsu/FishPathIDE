/// <reference path="@cocos/creator-types/editor/editor.d.ts"/>
/// <reference path="@cocos/creator-types/editor/message.d.ts"/>
/// <reference path="@cocos/creator-types/editor/utils.d.ts"/>

/// <reference path="@cocos/creator-types/editor/packages/builder/@types/public/global.d.ts"/>
export * from '@cocos/creator-types/editor/packages/builder/@types/public';

import { IPanelThis, IBuildTaskOption } from '@cocos/creator-types/editor/packages/builder/@types/public';
import { Link, Checkbox } from '@editor/creator-ui-kit/dist/renderer';

const PACKAGE_NAME = 'bundle-cacher';
export interface ITaskOptions extends IBuildTaskOption {
	packages: {
		[PACKAGE_NAME]: IExtOptions;
	};
}

export interface ICustomPanelThis extends IPanelThis {
	options: ITaskOption;
	errorMap: any;
	pkgName: string;
	$: {		
		root: '#build-plugin',
		compress: '#compress',
		forceClear: '#force-clear',
	},
}

export interface CacheSetting{
	needZip: boolean;
	forceClear: boolean;
}

export interface IExtOptions {	
	settings: {[bundle: string]: CacheSetting};
}