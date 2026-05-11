import type {
	Method,
} from "./Method"

/**
 * Read a client request from a route handler in your server.
 * 
 * It's intended to be similar as possible to the `Request` Web API standard,
 * yet the instance is not fully similar.
 */
export interface Request {

	readonly bodyUsed: boolean,

	readonly headers: Headers,

	readonly method: Method,

	readonly url: string,

	readonly referrer: string,

	readonly referrerPolicy: string,

	formData(): Promise<FormData>,

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	json(): Promise<any>,

	text(): Promise<string>,

	// TODO : Provide a clone method to clone the request formData, json, and text in native side
	// clone()

}
