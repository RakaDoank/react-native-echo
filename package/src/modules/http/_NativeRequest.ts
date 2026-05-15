import NativeReactNativeEcho, {
	type Spec,
} from "../../_internal/native-modules/NativeReactNativeEcho"

import {
	File,
} from "./File"

import {
	FormData,
} from "./FormData"

import type {
	Request,
} from "./Request"

export class NativeRequest implements Request {

	private _bodyUsed: boolean = false

	readonly headers: Headers = new Headers()

	readonly method: Request["method"]

	readonly url: Request["url"]

	readonly origin: Request["origin"]

	readonly referrer: Request["referrer"]

	readonly referrerPolicy: Request["referrerPolicy"]

	constructor(
		private serverID: string,
		private requestID: string,
		init: {
			headers: Parameters<Parameters<Spec["httpRequestListener"]>[0]>[0]["headers"],
			method: Request["method"],
			origin: Request["origin"],
			url: Request["url"],
			referrer: Request["referrer"],
			referrerPolicy: Request["referrerPolicy"],
		},
	) {
		Object.entries(init.headers).forEach(([key, val]) => {
			if(typeof val == "string") {
				this.headers.append(key, val)
			}
		})

		this.method = init.method
		this.url = init.url
		this.origin = init.origin
		this.referrer = init.referrer
		this.referrerPolicy = init.referrerPolicy
	}

	get bodyUsed() {
		return this._bodyUsed
	}

	formData(): Promise<FormData> {
		if(!this._bodyUsed) {
			this._bodyUsed = true
			return NativeReactNativeEcho.httpGetRequestFormData(this.serverID, this.requestID)
				.then(object => {
					if(object && typeof object == "object") {
						const formData = new FormData()
						Object.entries(object).forEach(([key, val]) => {
							const value = val as string | File

							if(typeof value == "string") {
								formData.append(key, value)
							} else if(
								value &&
								typeof value == "object" &&
								typeof value.name == "string" &&
								typeof value.uri == "string"
							) {
								formData.append(
									key,
									new File(value),
								)
							}
						})
						return formData
					}
					throw new TypeError("The body cannot be parsed as a FormData object")
				})
				.catch(error => {
					if(error instanceof Error) {
						throw error
					}
					throw new TypeError()
				})
		} else {
			throw new TypeError("The request body is disturbed or locked")
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	json(): Promise<any> {
		if(!this._bodyUsed) {
			this._bodyUsed = true
			return NativeReactNativeEcho.httpGetRequestText(this.serverID, this.requestID)
				.then(string => {
					if(string) {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-return
						return JSON.parse(string)
					}
					throw new SyntaxError("The request body cannot be parsed as JSON")
				})
				.catch(error => {
					if(error instanceof Error) {
						throw error
					}
					throw new TypeError()
				})
		} else {
			throw new TypeError("The request body is disturbed or locked")
		}
	}

	text(): Promise<string> {
		if(!this._bodyUsed) {
			this._bodyUsed = true
			return NativeReactNativeEcho.httpGetRequestText(this.serverID, this.requestID)
				.then(string => {
					if(typeof string == "string") {
						return string
					}
					throw new TypeError("The body cannot be parsed as a FormData object")
				})
				.catch(error => {
					if(error instanceof Error) {
						throw error
					}
					throw new TypeError()
				})
		} else {
			throw new TypeError("The request body is disturbed or locked")
		}
	}

}
