//Change Controller Event
const ControllerChangeEvent = 'controllerchange';
//Service Worker Registration Path
const ServiceWorkerPath = './sw.js';
//Service Worker Update API
const UpdateAPI = 'update';

// 註冊 Service Worker
async function registerServiceWorker()
{
	try
	{
		navigator.serviceWorker.removeEventListener(ControllerChangeEvent, onUpdateServiceWorker);
		navigator.serviceWorker.addEventListener(ControllerChangeEvent, onUpdateServiceWorker);
		await navigator.serviceWorker.register(ServiceWorkerPath, { scope: './' });
		onUpdateServiceWorker("Register Service Worker Finish");
	}
	catch (err)
	{
		console.error('serviceWorker register failed:', err);
	}
}

// 更新 Service Worker
function onUpdateServiceWorker(event)
{
	console.log("The controller of current browsing context has changed.", event);
	if (navigator.serviceWorker.controller)
	{
		navigator.serviceWorker.controller.postMessage({ api: UpdateAPI });
	}
}

if ('serviceWorker' in navigator)
{
	// **呼叫函式**
	registerServiceWorker();
}
else
{
	console.log('serviceWorker not available!');
}
