export type RouteErrorHandler =
	(
		error: Error,
	) =>
		| Promise<Response>
