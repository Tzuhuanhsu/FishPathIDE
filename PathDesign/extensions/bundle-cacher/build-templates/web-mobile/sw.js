importScripts("./lib/bundleCacher.js");
// 安裝Service Worker
const STATIC_NAME = 'static-1'

self.addEventListener('install', (event) =>
{
	console.log('[Service Worker] install');
	/*event.waitUntil(
		(async () => {
			const cache = await caches.open(STATIC_NAME);
			cache.addAll([			
				'./cocos-js/cc.js',				
			]);
		})()
	);*/

	self.skipWaiting();
})

// 自定義Cache Strategies
self.addEventListener('fetch', (event) =>
{
	event.respondWith(
		(async () =>
		{
			const res = await caches.match(event.request);
			// if (res) {
			// 	console.log(`[Service Worker] fetch from cache: ${event.request.url}`);
			// }
			return res ? res : fetch(event.request);
		})()
	)
})

// 啟動Service Worker
self.addEventListener('activate', (event) =>
{
	console.log('[Service Worker] activate');
	event.waitUntil(
		(async () =>
		{
			const keys = await caches.keys();
			Promise.allSettled(keys.map(key => (key.includes('static') && key !== STATIC_NAME) ? caches.delete(key) : null));
		})()
	)
	clients.claim();
})