importScripts("./lib/jszip.min.js", "./lib/md5.min.js", "./lib/umd.js");

function getCurrentTime()
{
	const now = new Date(Date.now());
	return now.toISOString();
}

async function fetchWithProgress(url, onProgress)
{
	const response = await fetch(url);

	if (!response.ok)
	{
		throw new Error(`HTTP error! ${url}, status: ${response.status}`);
	}

	// 取得 Content-Length 標頭，用於計算總大小
	const contentLength = response.headers.get('Content-Length');
	if (!contentLength)
	{
		throw new Error('Content-Length not available');
	}

	const total = parseInt(contentLength, 10); // 總大小	
	let loaded = 0; // 已下載的大小

	const reader = response.body.getReader();
	const stream = new ReadableStream({
		async pull(controller)
		{
			const { done, value } = await reader.read();
			if (done)
			{
				controller.close();
				return;
			}

			// 更新已下載的大小
			loaded += value.byteLength;

			// 呼叫回調函數，回報進度
			onProgress(loaded, total);

			// 將資料送入流中
			controller.enqueue(value);
		}
	});

	// 讀取並返回已處理的流
	return new Response(stream);
}

async function installBundle(bundle, hashCheck, source)
{
	try
	{
		const info = await db.get(bundlesStore, bundle);
		if (!info)
		{
			throw new Error(`Bundle ${bundle} not found in config`);
		}

		await installBundleWithVersion(bundle, info.md5, hashCheck, source);
	} catch (error)
	{
		source?.postMessage({ api: 'onInstallFinish', target: bundle, result: false, error: error });
	}
}

async function installBundleWithVersion(bundle, version, hashCheck, source)
{
	try
	{
		const bundleName = `${bundle}.${version}`;
		const hasCache = await caches.has(bundleName);
		const cache = await caches.open(bundleName);

		// 如果已经缓存了，且缓存中有文件，则不再下载
		if (hasCache && (await cache.keys()).length != 0)
		{
			throw new Error(`Bundle Cache: ${bundleName} already installed`);
		}

		// ZIP 文件的下载链接
		const zipURL = `./assets/${bundleName}.zip`;
		const eventProgress = { api: 'onProgress', stage: 0, target: bundle, progress: 0, total: 0 };
		const response = await fetchWithProgress(zipURL, (progress, total) =>
		{
			if (source)
			{
				eventProgress.progress = progress;
				eventProgress.total = total;
				source?.postMessage(eventProgress);
			}
		});

		if (!response.ok)
		{
			throw new Error('Failed to download ZIP');
		}

		const zipRaw = await response.arrayBuffer();

		// 验证 ZIP 文件的md5，version为md5值
		if (hashCheck)
		{
			const hash = md5(zipRaw);
			if (hash !== version)
			{
				throw new Error(`Failed to verify md5 ${zipURL}:${hash}`);
			}
		}

		const zip = await JSZip.loadAsync(zipRaw);
		eventProgress.stage = 1;
		eventProgress.progress = 0;
		eventProgress.total = 0;
		// 遍历 ZIP 文件的内容，并缓存每个文件
		const cachePromises = Object.entries(zip.files).map(async ([ filename, file ]) =>
		{
			if (file.dir) return;
			const arrayBuffer = await file.async('arraybuffer');

			if (!arrayBuffer || arrayBuffer.byteLength == 0)
			{
				throw new Error(`Failed to read file: ${filename}`);
			}

			const stream = new ReadableStream(
				{
					start(controller)
					{
						controller.enqueue(new Uint8Array(arrayBuffer));
						controller.close(); // 完成流
					}
				});

			const response = new Response(
				stream,
				{
					headers: { 'Content-Type': 'application/octet-stream' }
				});

			eventProgress.total++;
			const url = new URL(`assets/${filename}`, location).href;
			await cache.put(url, response);
			eventProgress.progress++;
			source?.postMessage(eventProgress);
		});

		// 等待所有文件缓存完成
		await Promise.all(cachePromises);

		source?.postMessage({ api: 'onInstallFinish', target: bundle, result: true });
		//console.log(`ZIP 文件已下载并解压到缓存中！ - ${getCurrentTime()}`);
	} catch (error)
	{
		source?.postMessage({ api: 'onInstallFinish', target: bundle, result: false, error: error });
		console.error('onInstallFailed:', error);
	}
}

async function clearBundle(bundle, source)
{
	const info = await db.get(bundlesStore, bundle);
	if (!info)
	{
		source?.postMessage({ api: 'onBundleClear', target: bundle, result: false, error: `Bundle ${bundle} not found in config` });
		return;
	}

	const keys = await caches.keys();
	const deleteKeys = keys.filter(key =>
	{
		const [ name, ver ] = key.split(".");
		return name === bundle;
	});

	await Promise.all(deleteKeys.map(key => caches.delete(key)));
	source?.postMessage({ api: 'onBundleClear', target: bundle, result: true });
}

//移除bundle所有cache, 但保留指定版本
/*async function clearBundleExceptVersion(bundle, keepVersion, source) {
	const keys = await caches.keys();
	const deleteKeys = keys.filter(key => {
		const [name, ver] = key.split(".");
		return name === bundle && ver !== keepVersion;
	});

	await Promise.all(deleteKeys.map(key => caches.delete(key)));
	source?.postMessage({ api: 'onBundleClear', target: bundle, keepVersion: keepVersion, result: true });
}*/

const dbName = "bundleConfig";
const configStore = "config";
const bundlesStore = "bundles";
const configKey = 1;
var db;
function initDB(db)
{
	if (!db.objectStoreNames.contains(configStore))
	{
		db.createObjectStore(configStore, { autoIncrement: true });
	}
	if (!db.objectStoreNames.contains(bundlesStore))
	{
		const store = db.createObjectStore(bundlesStore, { keyPath: 'name' });
		store.createIndex('by_md5', 'md5', { unique: false });
	}
}

async function updateIdb(config)
{
	if (!db)
	{
		db = await idb.openDB(dbName, 1, {
			upgrade: initDB
		});

		console.log('Idb init:', db);
	}

	const configInDB = await db.get(configStore, configKey);
	if (configInDB?.hash !== config.hash)
	{

		console.log('Update Config:', configInDB, config);
		await db.put(configStore, { buildTime: config.buildTime, hash: config.hash }, configKey);

		const tx = db.transaction(bundlesStore, 'readwrite');
		const store = tx.store;
		await store.clear();

		const bundles = config.bundles;
		const bundleUpdates = Object.entries(bundles).map(([ name, info ]) =>
			store.add({ name, md5: info.md5, size: info.size })
		);

		await Promise.all([ ...bundleUpdates, tx.done ]);

		//clear out of updated cache
		// TODO: maybe clear or not is based on config
		const keys = await caches.keys();
		const deleteKeys = keys.filter(key =>
		{
			if (STATIC_NAME === key) return false;
			const [ name, ver ] = key.split(".");
			const info = bundles[ name ];
			// remove cache if not in config or force clear or version not match
			return !info || info.forceClear || ver !== info.md5;
		});
		await Promise.all(deleteKeys.map(key => caches.delete(key)));
	}
}

async function updateConfig(source)
{
	try
	{
		source?.postMessage({ api: 'SetLog', log: ("===========updateConfig========") });
		const response = await fetch(`${self.registration.scope}assets/bundleConfig.json?${new Date().getTime()}`);
		source?.postMessage({ api: 'onUpdateFetchBack' });
		if (!response.ok)
		{
			source?.postMessage({ api: 'SetLog', log: ("[bundleCacher.js] response failed") });
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		source?.postMessage({ api: 'SetLog', log: ("[bundleCacher.js] fetch response") });
		const config = await response.json();
		source?.postMessage({ api: 'SetLog', log: ("[bundleCacher.js] updateIdb") });
		await updateIdb(config);
		const updateList = {};
		const bundleChecks = Object.entries(config.bundles).map(async ([ bundle, info ]) =>
		{
			const hasCache = await caches.has(`${bundle}.${info.md5}`);
			if (!hasCache)
			{
				updateList[ bundle ] = info;
			}
		});

		source?.postMessage({ api: 'SetLog', log: ("[bundleCacher.js] bundleChecks") });
		await Promise.all(bundleChecks);
		source?.postMessage({ api: 'SetLog', log: ("[bundleCacher.js] updateConfig Finish") });
		source?.postMessage({ api: 'onConfigUpdated', updateList: updateList, result: true });
	}
	catch (err)
	{
		source?.postMessage({ api: 'SetLog', log: ('[bundleCacher.js] onConfigUpdated error ') });
		console.error('onConfigUpdated:', err);
		source?.postMessage({ api: 'onConfigUpdated', result: false, error: err });
	}
}

self.addEventListener('message', (event) =>
{
	console.log('Received message from game:', event.data);
	switch (event.data.api)
	{
		case 'install':
			installBundle(event.data.bundle, event.data.hashCheck, event.source);
			break;
		case 'clear':
			clearBundle(event.data.bundle, event.source);
			break;
		case 'update':
			updateConfig(event.source);
			break;
		default:
			break;
	}
});

