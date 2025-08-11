"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onError = exports.onAfterBuild = exports.unload = exports.load = exports.throwError = void 0;
const global_1 = require("./global");
const fs = __importStar(require("fs"));
const zipbundle_1 = require("./zipbundle");
function log(...arg) {
    return console.log(`[${global_1.PACKAGE_NAME}] `, ...arg);
}
exports.throwError = true;
const load = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const source = Editor.Utils.Path.join(Editor.Project.path, `extensions/${global_1.PACKAGE_NAME}/build-templates`);
        const target = Editor.Utils.Path.join(Editor.Project.path, 'build-templates');
        Editor.Utils.File.copy(source, target);
        log(` Load cocos plugin example in builder.`);
    });
};
exports.load = load;
const unload = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const target = Editor.Utils.Path.join(Editor.Project.path, 'build-templates');
        yield Editor.Utils.File.trashItem(target).then(() => {
            console.log('unload asset-template: ' + target);
        }, (err) => {
            console.log(err);
        });
        log(`Unload cocos plugin example in builder.`);
    });
};
exports.unload = unload;
const onAfterBuild = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        log(result, 'result onAfterBuild');
        const buildPath = result.paths;
        const settings = options.packages[global_1.PACKAGE_NAME].settings;
        yield (0, zipbundle_1.zipBundles)(buildPath.assets, settings);
        if (options.md5Cache) {
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
    });
};
exports.onAfterBuild = onAfterBuild;
const onError = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        // Todo some thing
        console.warn(`${global_1.PACKAGE_NAME} run onError`);
    });
};
exports.onError = onError;
