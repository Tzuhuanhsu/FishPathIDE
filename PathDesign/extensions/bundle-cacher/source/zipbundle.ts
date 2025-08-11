import * as fs from 'fs';
import * as path from "path";
import JSZip from '../lib/jszip.min';
import md5 from '../lib/md5.min';
import { CacheSetting } from '../@types';

const ALREADY_COMPRESSED = [
	'.zip', '.gz', '.png', '.jpg', '.jpeg', '.pdf', '.doc', '.docx', '.ppt', '.pptx',
	'.xls', '.xlsx', '.heic', '.heif', '.7z', '.bz2', '.rar', '.gif', '.webp', '.webm',
	'.mp4', '.mov', '.mp3', '.aifc'
];

interface BundleConfig {
	buildTime: string;
	hash: string;
	bundles: {};
}

// 遞歸讀取資料夾內容並加入到JSZip
function addFolderToZip(zip: JSZip, folderPath: string, zipFolderPath: string = '') {
	const items = fs.readdirSync(folderPath);

	for (const item of items) {
		const fullPath = path.join(folderPath, item);
		const zipPath = path.join(zipFolderPath, item);
		const stat = fs.statSync(fullPath);

		if (stat.isDirectory()) {
			// 如果是子資料夾，遞歸處理            
			addFolderToZip(zip, fullPath, zipPath);
		} else {
			// 如果是文件，加入到 ZIP
			const fileData = fs.readFileSync(fullPath);
			const ext = path.parse(fullPath).ext.toLowerCase();
			const isCompressed = ALREADY_COMPRESSED.indexOf(ext) != -1;
			const options: JSZip.JSZipFileOptions = {
				createFolders: false,
				compression: isCompressed ? 'STORE' : 'DEFLATE',
				compressionOptions: isCompressed ? undefined : { level: 6 },
				date: new Date(0)
			}

			zip.file(zipPath, fileData, options); // 加入文件到ZIP			
		}
	}
}

// 壓縮資料夾
async function compressFolderToZip(folderPath: string) : Promise<{md5: string, size: number}> {
	const zip = new JSZip();	
	const baseDir = path.basename(path.resolve(folderPath));
	addFolderToZip(zip, folderPath, baseDir);
	const zipContent = await zip.generateAsync({ type: 'nodebuffer' });		
		
	const hash = md5(zipContent);
	const outpout = `${folderPath}.${hash}.zip`;
	console.log(`Compressing ${outpout} : ${hash}`);
	fs.writeFileSync(outpout, zipContent);
	return {md5: hash, size: zipContent.length};
}

export async function zipBundles(bundleDir: string, settings: {[bundle: string]: CacheSetting}) {
	const bundleVersions = {};
	const entries = fs.readdirSync(bundleDir);
	for (const bundle of entries) {		
		if(!settings[bundle]?.needZip){
			continue;
		}

		const bundlePath = path.join(bundleDir, bundle);
		const stats = fs.statSync(bundlePath);
		if (stats.isDirectory()) {
			const files = fs.readdirSync(bundlePath);
			for (const file of files) {
				if (file.startsWith('config')) {
					const info = await compressFolderToZip(bundlePath);
					bundleVersions[bundle] = {md5: info.md5, size: info.size, forceClear: settings[bundle].forceClear};
					console.log(`${bundle} : ${bundleVersions[bundle]}`);
					break;
				}
			}
		}
	}
	
	const outputVersion = path.join(bundleDir, 'bundleConfig.json');

	const now = Date.now();
	let config: BundleConfig = { buildTime: new Date(now).toISOString(), hash: now.toString(16), bundles: bundleVersions };
	let json = JSON.stringify(config);
	fs.writeFileSync(outputVersion, json);
}