import {
	EchoError,
} from "../../_internal/modules"

export class ServerError extends EchoError {

	constructor(
		data: {
			code: string,
			message: string,
		},
	) {
		super({
			...data,
			name: "ServerError",
		})
	}

}
