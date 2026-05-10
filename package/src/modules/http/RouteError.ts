export class RouteError extends Error {

	readonly code: string

	constructor(
		data: {
			code: string,
			message: string,
		},
	) {
		super()

		this.name = "RouteError"
		this.code = data.code
		this.message = data.message
	}

}
