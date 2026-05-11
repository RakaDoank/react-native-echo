import type {
	Response,
} from "./Response"

/**
 * Convert the Response class to the plain object.
 * 
 * This is used by `Echo.Http.Server` internally to send the response in plain object to native side.
 */
export function responseToObject(
	response: Response,
) {

	const obj: {
		body: Response["body"],
		headers: Record<string, string>,
		status: Response["status"],
		statusText: Response["statusText"],
	} = {
		body: response.body,
		headers: {},
		status: response.status,
		statusText: response.statusText,
	}

	response.headers.forEach((value, key) => {
		obj.headers[value] = key
	})

	return obj

}
