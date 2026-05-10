import type {
	NativeReactNativeEchoSpec,
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
		data: {
			headers: Parameters<Parameters<NativeReactNativeEchoSpec["httpRequestListener"]>[0]>[0]["headers"],
			method: Request["method"],
			url: Request["url"],
			referrer: Request["referrer"],
			referrerPolicy: Request["referrerPolicy"],
		},
	) {
		Object.entries(data.headers).forEach(([key, val]) => {
			if(typeof val == "string") {
				this.headers.append(key, val)
			}
		})

		this.method = data.method
		this.url = data.url
		this.referrer = data.referrer
		this.referrerPolicy = data.referrerPolicy
	}

	get bodyUsed() {
		return this._bodyUsed
	}

	formData(): Promise<FormData> {
		this._bodyUsed = true
	}

	json(): Promise<any> {

	}

	text(): Promise<string> {

	}

}
