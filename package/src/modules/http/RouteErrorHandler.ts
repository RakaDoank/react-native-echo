import type {
	Response,
} from "./Response"

export type RouteErrorHandler =
	(
		error: Error,
	) =>
		| Promise<Response>
		| Response
