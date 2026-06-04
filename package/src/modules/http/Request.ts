import type {
	FormData,
} from "./FormData"

import {
	NativeRequestSymbol,
} from "./_native-request-symbol"

/**
 * Read a client request from a route handler in your server.
 * 
 * It's intended to be similar as possible to the `Request` Web API standard,
 * yet the instance is not fully similar.
 */
export class Request {

	readonly bodyUsed: boolean = false

	readonly headers: Headers = new Headers()

	readonly method: string = ""

	/**
	 * @example
	 * ```js
	 * {
	 * 	pathname: "/api/foo/bar",
	 * 	search: "?q=123&foo=bar" // it could be empty string
	 * }
	 * ```
	 */
	readonly url: {
		/**
		 * @example "/api/foo/bar"
		 */
		readonly pathname: string,
		/**
		 * A string indicating the URL's parameter string; if any parameters are provided, this string includes all of them, beginning with the leading ? character. It will be empty string if it doesn't has any.
		 * @example "?q=123&foo=bar"
		 */
		readonly search: string,
	} = {
		pathname: "",
		search: "",
	}

	/**
	 * This is the correct spell of the Web API mistake's `referer`.
	 */
	readonly referrer: string = ""

	readonly referrerPolicy: string = ""

	/**
	 * The `referer` from the Web API is actually mispelled.
	 * This is an alias of `referrer`
	 */
	get referer(): string {
		return this.referrer
	}

	formData(): Promise<FormData> {
		throw new TypeError("The body cannot be parsed as a FormData object")
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	json(): Promise<any> {
		throw new SyntaxError("The request body cannot be parsed as JSON")
	}

	text(): Promise<string> {
		throw new TypeError("The body cannot be parsed as a text")
	}

	static [Symbol.hasInstance](value: unknown) {
		return !!(value as Record<string, unknown> | null)?.[NativeRequestSymbol]
	}

	// TODO
	// I don't know the best way to provide clone method
	// to clone the request formData, json, and text in native side
	// clone()

}
