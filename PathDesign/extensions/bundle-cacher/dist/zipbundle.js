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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.zipBundles = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const jszip_min_1 = __importDefault(require("../lib/jszip.min"));
const md5_min_1 = __importDefault(require("../lib/md5.min"));
const ALREADY_COMPRESSED = [
    '.zip', '.gz', '.png', '.jpg', '.jpeg', '.pdf', '.doc', '.docx', '.ppt', '.pptx',
    '.xls', '.xlsx', '.heic', '.heif', '.7z', '.bz2', '.rar', '.gif', '.webp', '.webm',
    '.mp4', '.mov', '.mp3', '.aifc'
];
// 遞歸讀取資料夾內容並加入到JSZip
function addFolderToZip(zip, folderPath, zipFolderPath = '') {
    const items = fs.readdirSync(folderPath);
    for (const item of items) {
        const fullPath = path.join(folderPath, item);
        const zipPath = path.join(zipFolderPath, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            // 如果是子資料夾，遞歸處理            
            addFolderToZip(zip, fullPath, zipPath);
        }
        else {
            // 如果是文件，加入到 ZIP
            const fileData = fs.readFileSync(fullPath);
            const ext = path.parse(fullPath).ext.toLowerCase();
            const isCompressed = ALREADY_COMPRESSED.indexOf(ext) != -1;
            const options = {
                createFolders: false,
                compression: isCompressed ? 'STORE' : 'DEFLATE',
                compressionOptions: isCompressed ? undefined : { level: 6 },
                date: new Date(0)
            };
            zip.file(zipPath, fileData, options); // 加入文件到ZIP			
        }
    }
}
// 壓縮資料夾
function compressFolderToZip(folderPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const zip = new jszip_min_1.default();
        const baseDir = path.basename(path.resolve(folderPath));
        addFolderToZip(zip, folderPath, baseDir);
        const zipContent = yield zip.generateAsync({ type: 'nodebuffer' });
        const hash = (0, md5_min_1.default)(zipContent);
        const outpout = `${folderPath}.${hash}.zip`;
        console.log(`Compressing ${outpout} : ${hash}`);
        fs.writeFileSync(outpout, zipContent);
        return { md5: hash, size: zipContent.length };
    });
}
function zipBundles(bundleDir, settings) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const bundleVersions = {};
        const entries = fs.readdirSync(bundleDir);
        for (const bundle of entries) {
            if (!((_a = settings[bundle]) === null || _a === void 0 ? void 0 : _a.needZip)) {
                continue;
            }
            const bundlePath = path.join(bundleDir, bundle);
            const stats = fs.statSync(bundlePath);
            if (stats.isDirectory()) {
                const files = fs.readdirSync(bundlePath);
                for (const file of files) {
                    if (file.startsWith('config')) {
                        const info = yield compressFolderToZip(bundlePath);
                        bundleVersions[bundle] = { md5: info.md5, size: info.size, forceClear: settings[bundle].forceClear };
                        console.log(`${bundle} : ${bundleVersions[bundle]}`);
                        break;
                    }
                }
            }
        }
        const outputVersion = path.join(bundleDir, 'bundleConfig.json');
        const now = Date.now();
        let config = { buildTime: new Date(now).toISOString(), hash: now.toString(16), bundles: bundleVersions };
        let json = JSON.stringify(config);
        fs.writeFileSync(outputVersion, json);
    });
}
exports.zipBundles = zipBundles;
