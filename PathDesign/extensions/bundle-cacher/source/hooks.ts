import { BuildHook, IBuildResult, ITaskOptions } from '../@types';
import { PACKAGE_NAME } from './global';
import * as fs from 'fs';
import { zipBundles } from './zipbundle';

function log(...arg: any[]) {
	return console.log(`[${PACKAGE_NAME}] `, ...arg);
}

export const throwError: BuildHook.throwError = true;

export const load: BuildHook.load = async function () {	
	const source = Editor.Utils.Path.join(Editor.Project.path, `extensions/${PACKAGE_NAME}/build-templates`);
	const target = Editor.Utils.Path.join(Editor.Project.path, 'build-templates');

	Editor.Utils.File.copy(source, target);	
	log(` Load cocos plugin example in builder.`);	
};

export const unload: BuildHook.unload = async function () {
	const target = Editor.Utils.Path.join(Editor.Project.path, 'build-templates');
	await Editor.Utils.File.trashItem(target).then(()=>{
		console.log('unload asset-template: ' + target);
	},
	(err)=>{
		console.log(err);
	});	
	log(`Unload cocos plugin example in builder.`);
};

export const onAfterBuild: BuildHook.onAfterBuild = async function (options: ITaskOptions, result: IBuildResult) {
	log(result, 'result onAfterBuild');
		
	const buildPath = result.paths;
	const settings = options.packages[PACKAGE_NAME].settings;
	await zipBundles(buildPath.assets, settings);

	if(options.md5Cache){
		// Rename sw.{md5}.js(3.8.4) to sw.js
		for (const key in buildPath.hashedMap) {
			let v = buildPath.hashedMap[key];

			if (key.endsWith('sw.js')) {			
				fs.renameSync(v, key);
				log(`Rename ${v} to ${key}`);
				break;
			}
		}
	}
};

export const onError: BuildHook.onError = async function (options, result) {
	// Todo some thing
	console.warn(`${PACKAGE_NAME} run onError`);
};
