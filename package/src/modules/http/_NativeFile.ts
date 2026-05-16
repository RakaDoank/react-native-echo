import type {
	CodegenTypes,
} from "react-native"

import {
	File,
} from "./File"

import {
	NativeFileSymbol,
} from "./_native-file-symbol"

export class NativeFile implements File {

	// @ts-expect-error Used internally for File symbol instance
	private readonly [NativeFileSymbol] = true

	readonly name: File["name"] = ""

	readonly originalName: File["originalName"] = ""

	readonly size: File["size"] = 0

	readonly type: File["type"] = ""

	readonly uri: File["uri"] = ""

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
