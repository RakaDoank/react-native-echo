import type {
	Method,
} from "./Method"

import type {
	RouteErrorHandler,
} from "./RouteErrorHandler"

import type {
	RouteHandler,
} from "./RouteHandler"

export interface ServerInterface extends Record<
	Lowercase<Method>,
	(
		path: string,
		handler: RouteHandler,
		errorHandler?: RouteErrorHandler,
	) => void
> {

	route: (
		path: string,
		handler: RouteHandler,
		errorHandler?: RouteErrorHandler,
	) => void,

	routeError: (
		errorHandler: RouteErrorHandler,
	) => void,

}
