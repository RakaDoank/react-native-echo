import type {
	RouteErrorHandler,
} from "./RouteErrorHandler"

import type {
	RouteHandler,
} from "./RouteHandler"

export interface ServerRouteInterface {

	route: (
		path: string,
		handler: RouteHandler,
		errorHandler?: RouteErrorHandler,
	) => void,

	routeError: (
		errorHandler: RouteErrorHandler,
	) => void,

	get: (
		path: string,
		handler: RouteHandler,
		errorHandler?: RouteErrorHandler,
	) => void,

	post: ServerRouteInterface["get"],

	put: ServerRouteInterface["get"],

	delete: ServerRouteInterface["get"],

}
