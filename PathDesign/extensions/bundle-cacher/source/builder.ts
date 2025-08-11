import { BuildPlugin } from '../@types';
import { PACKAGE_NAME } from './global';

export const load: BuildPlugin.load = function () {
    console.debug(`${PACKAGE_NAME} load`);
};
export const unload: BuildPlugin.load = function () {
    console.debug(`${PACKAGE_NAME} unload`);
};

export const configs: BuildPlugin.Configs = {
    'web-mobile': {
        hooks: './hooks',
        panel: './panel',
    },
};