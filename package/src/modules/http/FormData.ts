import {
	File,
} from "./File"

import {
	NativeFile,
} from "./_NativeFile"

/**
 * This class is a reimplementation of `FormData` from Web API to support the reimplemented `File` for the route request.
 * 
 * Due to the reimplementation, `FormData` is not support to store a `Blob` from the Web API standard.
 * 
 * To check if an entry is a file, you can simply check with `instanceof` operator test
 * @example
 * ```ts
 * import * as Echo from "react-native-echo"
 * 
 * server.post("/api/bar", request => {
 * 	const formData = await request.formData()
 * 	const file = formData.get("file_foo")
 * 
 * 	if(file instanceof Echo.Http.File) {
 * 		// your code
 * 	}
 * })
 * ```
 */
export class FormData {

	private record: Record<string, FormDataEntryValue[]> = {}

	append(
		name: string,
		value: FormDataEntryValue,
	) {
		if(!this.record[name]) {
			this.record[name] = [value]
		} else {
			this.record[name].push(value)
		}
	}

	delete(
		name: string,
	) {
		delete this.record[name]
	}

	entries() {
		return Object.entries(this.record).reduce<[string, FormDataEntryValue][]>((accumulator, [name, values]) => {
			if(values[0]) {
				accumulator.push([name, values[0]])
			}
			return accumulator
		}, [])
	}

	get(
		name: string,
	): FormDataEntryValue | undefined {
		return this.record[name]?.[0]
	}

	getAll(
		name: string,
	): FormDataEntryValue[] {
		return this.record[name] ?? []
	}

	has(
		name: string,
	) {
		return !!this.record[name]
	}

	keys() {
		return Object.keys(this.record)
	}

	set(
		name: string,
		value: FormDataEntryValue,
		filename?: string,
	) {
		if(this.record[name]?.[this.record[name].length - 1]) {
			if(typeof value == "string") {
				this.record[name] = [value]
			} else if(value instanceof File) {
				this.record[name] = [
					new NativeFile({
						...value,
						name: filename ?? value.name,
					}),
				]
			}
		}
	}

	values() {
		return Object.values(this.record).reduce<FormDataEntryValue[]>((accumulator, value) => {
			if(value[0]) {
				accumulator.push(value[0])
			}
			return accumulator
		}, [])
	}

	forEach(
		callbackFn: (
			value: FormDataEntryValue,
			name: string,
			parent: FormData,
		) => void,
	) {
		Object.entries(this.record)
			.forEach(([key, val]) => {
				if(val[0]) {
					callbackFn(val[0], key, this)
				}
			})
	}

}

type FormDataEntryValue =
	| string
	| File
