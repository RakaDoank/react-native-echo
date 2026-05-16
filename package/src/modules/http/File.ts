import type {
	CodegenTypes,
} from "react-native"

/**
 * This instance is a reimplementation of `File` from Web API standard.
 * The reimplementation is required due to the multipart file that server retrieve
 * will be stored as a temporary file (or may known as cache).
 * 
 * The temporary file will be removed immediately after a route sent a response.
 * 
 * You may need the `uri` string of the instance member to write the file
 * to the device storage, or send to an another remote server.
 * 
 * Probably in the future, this library will use the JSI to bounce
 * the array buffer from and to native and JavaScript to create File instance,
 * or will use C++ http server library directly.
 */
export class File {

	/**
	 * The file name returned by the native file after the file is stored.
	 * The name may changed due to native behaviour of the platform.
	 * Use the `originalName` to get the original file name from the requester.
	 */
	readonly name: string = ""

	/**
	 * Original file name from the requester.
	 */
	readonly originalName: string = ""

	/**
	 * The size in bytes, of the data contained in the file object.
	 */
	readonly size: number = 0

	/**
	 * A string indicating the MIME type of the data. If the type is unknown, this string is empty.
	 */
	readonly type: string = ""

	/**
	 * The temporary file URI of the app cache storage.
	 * The server will use the app cache directory for the temporary file,
	 * and it will be removed immediately after a Response has been sent.
	 */
	readonly uri: string = ""

	constructor(
		init: CodegenTypes.UnsafeObject,
	) {
		const data = init as Record<string, unknown>

		if(
			data &&
			typeof data == "object" &&
			typeof data.uri == "string"
		) {

			if(typeof data.name == "string") {
				this.name = data.name
			}

			if(typeof data.originalName == "string") {
				this.originalName = data.originalName
			}

			if(typeof data.size == "number") {
				this.size = data.size
			}

			if(typeof data.type == "string") {
				this.type = data.type
			}

			if(typeof data.uri == "string") {
				this.uri = data.uri
			}

		}
	}

}
