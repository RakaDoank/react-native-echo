export class EchoError extends Error {

	readonly code: string

	constructor(
		data: {
			name: string,
			code: string,
			message: string,
		},
	) {
		super(data.message)

		this.name = data.name || "EchoError"
		this.code = data.code
	}

	override toString() {
		return `[object ${this.name} ${JSON.stringify({
			// Alphabetical order
			code: this.code,
			message: this.message,
			name: this.name,
		})}`
	}

}
