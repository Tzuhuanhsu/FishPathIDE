
declare const CC_EDITOR: boolean;

//Timeout 時間
const SERVICE_WORKER_TIMEOUT_MS: number = 1000;

const enum BundleCacherState
{
	Idle,
	Update,
	Updating
}
export interface UpdateList
{
	[ key: string ]: { md5: string, size: number, forceClear?: boolean }
}

export class BundleCacher
{
	private static _instance: BundleCacher = new BundleCacher();
	//Service Worker 狀態
	private _state: BundleCacherState = BundleCacherState.Idle;
	public static get instance()
	{

		return this._instance;
	}

	private _installPromises = new Map<string, Promise<void>>();
	private _installExecutors = new Map();
	private _progressCallbacks = new Map();

	private _clearPromises = new Map<string, Promise<void>>();
	private _clearExecutors = new Map();

	private _configPromise: Promise<UpdateList> | null = null;
	private _configUpdated: { resolve: ( value: UpdateList | PromiseLike<UpdateList> ) => void, reject: ( reason?: any ) => void } | null = null;
	private _internalId: NodeJS.Timeout;

	public supportServiceWorker: boolean;


	public get swState(): string | undefined
	{
		return navigator.serviceWorker.controller?.state;
	}

	private constructor()
	{
		if ( CC_EDITOR )
		{
			return;
		}

		this.supportServiceWorker = 'serviceWorker' in navigator;
		if ( !this.supportServiceWorker || !navigator.serviceWorker )
		{
			console.error( 'Service Worker not supported.' );
			return;
		}


		navigator.serviceWorker.addEventListener( 'message', ( event ) =>
		{
			const data = event.data;
			// console.log( 'Message from Service Worker event :', event[] );
			// console.log( 'Message from Service Worker event.data:', data );

			switch ( data.api )
			{
				case 'onConfigUpdated':
					this.onConfigUpdated( data );
					break;
				case 'onInstallFinish':
					this.onInstallFinish( data );
					break;
				case 'onProgress':
					this._progressCallbacks.get( data.target )?.( data.stage, data.progress, data.total );
					break;
				case 'onBundleClear':
					this.onBundleClear( data );
					break;
				case 'SetLog':
					this.SetLog( data );
					break;
				case 'onUpdateFetchBack':
					this._state = BundleCacherState.Updating;
					break;
				default:
					break;
			}
		} );

		// // 有可能在這裡監聽到的 controllerchange 事件，不是目前頁面的 Service Worker 狀態變化
		// // TODO
		navigator.serviceWorker.oncontrollerchange = ( event ) =>
		{
			console.log( 'Service Worker controller changed:', event );
			// this.updateConfig();
		};
	}

	/// 安裝指定的 Asset Bundle
	/// @param bundle Asset Bundle 名稱
	/// @param hashCheck 是否檢查md5 Hash，檢查失敗則中斷安裝
	/// @param onProgress 進度回調；stage: 0-下載，1-解壓，current: 當前進度，total: 總進度
	/// @returns Promise<void>
	public installBundle( bundle: string, hashCheck: boolean, onProgress?: ( stage: number, current: number, total: number ) => void ): Promise<void>
	{
		// 如果已經有相同的任務在處理中，直接返回 Promise
		if ( this._installPromises.has( bundle ) )
		{
			return this._installPromises.get( bundle )!;
		}

		// 如果有進度回調，存放到 Map 中
		if ( onProgress )
		{
			this._progressCallbacks.set( bundle, onProgress );
		}

		const installPromise = new Promise<void>( ( resolve, reject ) =>
		{
			this._installExecutors.set( bundle, { resolve, reject } );
			this.sendMessageToSW( { api: 'install', bundle: bundle, hashCheck: hashCheck } );
		} );

		this._installPromises.set( bundle, installPromise );
		return installPromise;
	}

	public SetLog( log: any )
	{
		console.log( "SetLog", log );
	}

	/// 清除指定的 Asset Bundle
	/// @param bundle Asset Bundle 名稱
	/// @returns Promise<void>
	public clearBundle( bundle: string ): Promise<void>
	{
		if ( this._clearPromises.has( bundle ) )
		{
			return this._clearPromises.get( bundle )!;
		}

		const clearPromises = new Promise<void>( ( resolve, reject ) =>
		{
			this._clearExecutors.set( bundle, { resolve, reject } );
			this.sendMessageToSW( { api: 'clear', bundle: bundle } );
		} );

		this._clearPromises.set( bundle, clearPromises );
		return clearPromises;
	}

	/// 取得需要更新的Asset Bundle列表
	/// @returns Promise<UpdateList>
	public updateConfig(): Promise<UpdateList>
	{
		if ( this._configPromise )
		{
			return this.getUpdateConfigPromise();
		}

		return this._configPromise = new Promise<UpdateList>( ( resolve, reject ) =>
		{
			this._state = BundleCacherState.Update;
			this._configUpdated = { resolve, reject };
			this.sendMessageToSW( { api: 'update' } );
			//因為有可能 BundleCacher 會卡住，所以設定一個Interval
			this._internalId = setInterval( () =>
			{
				if ( this._state == BundleCacherState.Update && this._configUpdated )
				{
					//狀態沒有改變表，表示Service Worker沒有回應，且 Client 等待中
					this.serviceWorkerLockProcess();
				}
				else
				{
					this.onFinishInternal();
				}
			}, SERVICE_WORKER_TIMEOUT_MS );
		} );
	}


	public getUpdateConfigPromise(): Promise<UpdateList>
	{
		return this._configPromise;
	}

	private async sendMessageToSW( message: any )
	{
		console.log( "[BundleCacher] sendMessageToSW", message );
		const sws = await navigator.serviceWorker.getRegistrations();
		if ( sws.length <= 0 )
		{
			console.error( "[BundleCacher] sendMessageToSW  no service", message );
			return;
		}

		const sw = sws[ 0 ];
		if ( !sw.active )
		{
			//Servicer Worker尚未啟動
			console.error( "[BundleCacher] sendMessageToSW  is not active", message );
			return;
		}
		sw.active.postMessage( message );
	}

	private onInstallFinish( data: any )
	{
		console.log( "[BundleCacher] onInstallFinish", data );

		const { target, result, error } = data;
		const { resolve, reject } = this._installExecutors.get( target );
		if ( result )
		{
			resolve();
		} else
		{
			reject( error );
		}

		this._installExecutors.delete( target );
		this._installPromises.delete( target );
		this._progressCallbacks.delete( target );
	}

	private onBundleClear( data: any )
	{
		const { target, result, error } = data;

		const { resolve, reject } = this._clearExecutors.get( target );
		if ( result )
		{
			resolve();
		} else
		{
			reject( error );
		}

		this._clearExecutors.delete( target );
		this._clearPromises.delete( target );
	}

	private onConfigUpdated( data: any )
	{
		console.log( "[BundleCacher] onConfigUpdated", data );
		this.onFinishInternal();
		const { updateList, result, error } = data;
		if ( this._configUpdated )
		{
			const { resolve, reject } = this._configUpdated;
			if ( result )
			{
				resolve( updateList );
			}
			else
			{

				reject( error );
			}
		}
		this._configUpdated = null;
		this._configPromise = null;
	}

	//完成Internal 並清除Interval
	private onFinishInternal()
	{
		this._internalId && clearInterval( this._internalId );
	}

	//Service Worker Lock Process
	private serviceWorkerLockProcess()
	{
		this.onFinishInternal();
		if ( this._configUpdated )
		{
			const { reject } = this._configUpdated;
			reject( new Error( "Timeout" ) );
		}
		this._configUpdated = null;
		this._configPromise = null;
	}
}