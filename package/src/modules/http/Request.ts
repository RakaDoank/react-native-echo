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

	readonly url: {
		/**
		 * The origin property gives connection information about the original caller 
		 */
		readonly origin: string,
		/**
		 * @example /api/foo/bar
		 */
		readonly pathname: string,
		/**
		 * A string indicating the URL's parameter string; if any parameters are provided, this string includes all of them, beginning with the leading ? character. It will be empty string if it doesn't has any.
		 * @example ?q=123
		 */
		readonly search: string,
	},

	readonly referrer: string,

	readonly referrerPolicy: string,

	formData(): Promise<FormData>,

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	json(): Promise<any>,

	text(): Promise<string>,

	// TODO : Provide a clone method to clone the request formData, json, and text in native side
	// clone()

}
