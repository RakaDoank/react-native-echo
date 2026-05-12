import NativeReactNativeEcho, {
	type Spec,
} from "../../_internal/native-modules/NativeReactNativeEcho"

import type {
	Request,
} from "./Request"

export class RequestBuilder implements Request {

	private _bodyUsed: boolean = false

	readonly headers: Headers = new Headers()

	readonly method: Request["method"]

	readonly url: Request["url"]

	readonly referrer: Request["referrer"]

	readonly referrerPolicy: Request["referrerPolicy"]

	constructor(
		private serverID: string,
		private requestID: string,
		init: {
			headers: Parameters<Parameters<Spec["httpRequestListener"]>[0]>[0]["headers"],
			method: Request["method"],
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
							if(typeof val == "string") {
								formData.append(key, val)
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
			return NativeReactNativeEcho.httpGetRequestJson(this.serverID, this.requestID)
				.then(string => {
					if(string) {
						return JSON.stringify(string)
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
					if(string) {
						return JSON.stringify(string)
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
