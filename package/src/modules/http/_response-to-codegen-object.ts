import * as Const from "../../_internal/const"

import type {
	Response,
} from "./Response"

/**
 * Convert the Response class to the plain object.
 * 
 * This is used by `Echo.Http.Server` internally to send the response in plain object to native side.
 */
export async function responseToCodegenObject(
	response: Response,
) {

	const objBase: CodegenObjectBase = {
		headers: {},
		status: response.status,
		statusText: response.statusText,
	}

	let objBody: CodegenObjectBody

	if(typeof response.body == "string") {

		if(response.headers.get(Const.Headers.XReactNativeEchoResponseBody.NAME) == Const.Headers.XReactNativeEchoResponseBody.FILE_URI) {
			objBody = {
				body: {
					text: response.body,
				},
				bodyType: "file-uri",
			}
			response.headers.delete(Const.Headers.XReactNativeEchoResponseBody.NAME)
		} else {
			objBody = {
				body: response.body,
				bodyType: "text",
			}
		}

	} else if(response.body instanceof Blob) {

		let text: string

		const type = response.body.type

		try {
			text = await response.body.text()
		} catch {
			text = ""
		}

		objBody = {
			body: {
				text,
				type,
			},
			bodyType: "blob",
		}

	} else {
		objBody = {
			body: null,
			bodyType: "text",
		}
	}

	response.headers.forEach((value, key) => {
		objBase.headers[key] = value
	})

	return {
		...objBase,
		...objBody,
	}

}

interface CodegenObjectBase {
	headers: Record<string, string>,
	status: Response["status"],
	statusText: Response["statusText"],
}

type CodegenObjectBody =
	| {
		body: string | null,
		bodyType: "text"
	}
	| {
		body: {
			text: string,
			type: string, // mime,
		} | null,
		bodyType: "blob"
	}
	| {
		body: {
			text: string,
			type?: string, // mime
		} | null,
		bodyType: "file-uri",
	}
