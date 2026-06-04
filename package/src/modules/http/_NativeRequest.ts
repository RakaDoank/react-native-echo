// import type {
// 	File,
// } from "./File"

import {
	FormData,
} from "./FormData"

import type {
	Request,
} from "./Request"

// import {
// 	NativeFile,
// } from "./_NativeFile"

import type {
	NativeRequestObject,
} from "./_NativeRequestObject"

import {
	NativeRequestSymbol,
} from "./_native-request-symbol"

export class NativeRequest implements Request {

	// @ts-expect-error Used internally for Request symbol instance
	private readonly [NativeRequestSymbol] = true

	private _bodyUsed: boolean = false

	readonly headers: Headers = new Headers()

	readonly method: Request["method"]

	readonly url: Request["url"]

	readonly referrer: Request["referrer"]

	readonly referrerPolicy: Request["referrerPolicy"]

	constructor(
		private __nativeRequestObject: NativeRequestObject,
	) {
		Object.entries(__nativeRequestObject.headers).forEach(([key, val]) => {
			if(typeof val == "string") {
				this.headers.append(key, val)
			}
		})

		this.method = __nativeRequestObject.method
		this.url = {
			pathname: __nativeRequestObject.url.pathname,
			search: __nativeRequestObject.url.search,
		}

		this.referrer = this.headers.get("referrer") || ""
		this.referrerPolicy = this.headers.get("referrer-policy") || ""
	}

	get bodyUsed() {
		return this._bodyUsed
	}

	get referer() {
		return this.referrer
	}

	formData(): Promise<FormData> {
		if(!this._bodyUsed) {
			this._bodyUsed = true
			// TODO
			return Promise.resolve(new FormData())

			// return NativeReactNativeEcho.httpGetRequestFormData(this.serverID, this.requestID)
			// 	.then(object => {
			// 		if(object && typeof object == "object") {
			// 			const formData = new FormData()
			// 			Object.entries(object).forEach(([key, val]) => {
			// 				const value = val as string | File

			// 				if(typeof value == "string") {
			// 					formData.append(key, value)
			// 				} else if(
			// 					value &&
			// 					typeof value == "object" &&
			// 					typeof value.name == "string" &&
			// 					typeof value.uri == "string"
			// 				) {
			// 					formData.append(
			// 						key,
			// 						new NativeFile(value),
			// 					)
			// 				}
			// 			})
			// 			return formData
			// 		}
			// 		throw new TypeError("The body cannot be parsed as a FormData object")
			// 	})
			// 	.catch(error => {
			// 		if(error instanceof Error) {
			// 			throw error
			// 		}
			// 		throw new TypeError()
			// 	})
		} else {
			throw new TypeError("The request body is disturbed or locked")
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	json(): Promise<any> {
		if(!this._bodyUsed) {
			this._bodyUsed = true
			return this.text()
				.then(text => {
					if(text) {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-return
						return JSON.parse(text)
					}
					throw new SyntaxError("The request body cannot be parsed as JSON")
				})
				.catch(error => {
					if(error instanceof Error) {
						throw error
					}
					throw new TypeError();
				})
		} else {
			throw new TypeError("The request body is disturbed or locked")
		}
	}

	text(): Promise<string> {
		if(!this._bodyUsed) {
			this._bodyUsed = true
			return new Promise<string>(this.__nativeRequestObject.text)
		} else {
			throw new TypeError("The request body is disturbed or locked")
		}
	}

}
