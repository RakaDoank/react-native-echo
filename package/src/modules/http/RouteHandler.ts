import type {
	Request,
} from "./Request"

export type RouteHandler =
	(
		request: Request,
	) =>
		| Promise<Response>
