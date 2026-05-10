/**
 * The Response interface of the server represents the response to a request.
 * 
 * You can create a new Response object using the `Response()` constructor,
 * or you can use its static methods as a shorthand.
 * 
 * It's intended to be similar as possible to the `Response` Web API standard,
 * yet the instance is not fully similar.
 */
export class Response {

	readonly headers: Headers

	readonly status: number = 200

	/**
	 * The `statusText` read-only property of the Response interface contains the status message corresponding to the HTTP status code in Response.status.
	 * 
	 * `Reason-Phrase` is not supported in HTTP/2+,
	 * even though we don't know how to create an HTTP/2+ protocol from Android.
	 */
	readonly statusText: string = "OK"

	/**
	 * The json() static method of the `Response` interface returns a `Response` that contains the provided JSON data as body, and a `Content-Type` header which is set to `application/json`. The response status, status message, and additional headers can also be set.
	 */
	static json(
		data: unknown,
		init?: ConstructorParameters<typeof Response>[1],
	) {
		const headers = createHeadersResponseInit(init?.headers)
		headers.append("Content-Type", "application/json")

		return new Response(
			JSON.stringify(data),
			{
				status: init?.status,
				statusText: init?.statusText,
				headers,
			},
		)
	}

	static file(
		uri: string,
		init?: ConstructorParameters<typeof Response>[1],
	) {
		const headers = createHeadersResponseInit(init?.headers)
		// this header key will be removed later from the actual server response
		// This is only for the native side purposes to tell it that string is an file uri
		headers.append("X-React-Native-Echo-Response-Body-File", "file")

		return new Response(
			uri,
			{
				status: init?.status,
				statusText: init?.statusText,
				headers,
			},
		)
	}

	constructor(
		public body:
			| string
			| null,
		init?: {
			/**
			 * The status code for the response. The default value is `200`.
			 * @default 200
			 */
			status?: number,
			/**
			 * The status message associated with the status code, such as `"OK"`. The default value is `""`
			 * @default ""
			 */
			statusText?: string,
			headers?:
				| Headers
				| Record<string, string>
				| [string, string][],
		},
	) {

		if(typeof init?.status == "number") {
			this.status = init.status
		}

		// globalThis is documented in React Native website since 0.82 version
		// ```
		// global is a legacy alias for globalThis, as defined in Node.js.
		// The use of globalThis is recommended over global.
		// ```
		const globalThisResponse = new globalThis.Response(
			null,
			{
				status: this.status,
				headers: init?.headers,
				statusText: init?.statusText,
			},
		)

		this.headers = globalThisResponse.headers

		this.statusText = globalThisResponse.statusText

	}

}

function createHeadersResponseInit(
	nextHeaders?:
		| Headers
		| Record<string, string>
		| [string, string][],
): Headers {
	let headers: Headers | null = null

	if(nextHeaders) {
		if(nextHeaders instanceof Headers) {
			headers = nextHeaders
		} else {
			if(!headers) {
				headers = new Headers()
			}

			if(Array.isArray(nextHeaders)) {
				nextHeaders.forEach(([key, val]) => {
					headers!.append(key, val)
				})
			} else {
				Object.entries(nextHeaders).forEach(([key, val]) => {
					headers!.append(key, val)
				})
			}
		}
	} else {
		headers = new Headers()
	}

	return headers
}
