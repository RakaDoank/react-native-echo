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

	const obj: {
		body:
			| string
			| {
				bodyType: "blob",
				text: string,
				type: string, // mime
			}
			| {
				bodyType: "file-uri",
				uri: string,
				type?: string, // mime
			},
		headers: Record<string, string>,
		status: Response["status"],
		statusText: Response["statusText"],
	} = {
		body: "",
		headers: {},
		status: response.status,
		statusText: response.statusText,
	}

	if(typeof response.body == "string") {

		if(response.headers.get(Const.Headers.XReactNativeEchoResponseBody.NAME) == Const.Headers.XReactNativeEchoResponseBody.FILE_URI) {
			obj.body = {
				bodyType: "file-uri",
				uri: response.body,
			}
			response.headers.delete(Const.Headers.XReactNativeEchoResponseBody.NAME)
		} else {
			obj.body = response.body
		}

	} else if(response.body instanceof Blob) {

		const
			type =
				response.body.type,

			text =
				await response.body.text()

		obj.body = {
			bodyType: "blob",
			text,
			type,
		}

	}

	response.headers.forEach((value, key) => {
		obj.headers[value] = key
	})

	return obj

}
