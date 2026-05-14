import type {
	Request,
} from "./Request"

import type {
	Response,
} from "./Response"

export type RouteHandler =
	(
		request: Request,
	) =>
		| Promise<Response>
		| Response
