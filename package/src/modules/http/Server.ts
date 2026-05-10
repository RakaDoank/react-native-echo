import type {
	EventSubscription,
} from "react-native"

import NativeReactNativeEcho from "../../_internal/native-modules/NativeReactNativeEcho"

import type {
	Method,
} from "./Method"

import {
	RouteError,
} from "./RouteError"

import type {
	RouteErrorHandler,
} from "./RouteErrorHandler"

import type {
	RouteHandler,
} from "./RouteHandler"

import type {
	ServerInterface,
} from "./ServerInterface"

import {
	RequestBuilder,
} from "./_RequestBuilder"

import * as RouteErrorCode from "./route-error-code"

export class Server implements ServerInterface {

	private serverID: string

	private requestListenerSubscription: EventSubscription | null = null

	private registeredRoute: {
		[Path in string]: {
			handler: RouteHandler,
			errorHandler?: RouteErrorHandler,
		}
	} =
		{}

	private routeErrorHandler: RouteErrorHandler | null = null

	private registeredRouteMethod: {
		[Path in string]: Partial<Record<
			Method,
			{
				handler: RouteHandler,
				errorHandler?: RouteErrorHandler,
			}
		>>
	} =
		{}

	constructor() {
		this.serverID = Math.random().toString()

		NativeReactNativeEcho
			.httpCreateServer(this.serverID)

		this.requestListenerSubscription =
			NativeReactNativeEcho
				.httpRequestListener(argObject => {
					const obj = argObject

					if(
						obj &&
						typeof obj == "object" &&

						typeof obj.serverID == "string" &&
						obj.serverID == this.serverID &&

						typeof obj.requestID == "string" &&
						typeof obj.path === "string" &&
						typeof obj.method === "string"
					) {

						const route =
							this.registeredRoute[obj.path] ??
							this.registeredRouteMethod[obj.path]?.[obj.method as Method]

						if(route?.handler) {
							route
								.handler(
									new RequestBuilder({
										headers: obj.headers,
										method: obj.method as Method,
									}),
								)
								.then(response => {
									const test = new Response()
								})
								.catch(e => {
									const error = this.getError(e)

									if(this.routeErrorHandler) {
										this.routeErrorHandler(error)
									} else {
										this.defaultResponse()
									}
								})
						} else if(route?.errorHandler) {
							route
								.errorHandler(
									new RouteError({
										code: RouteErrorCode.FOUR_O_FOUR,
										message: "Unspecified route",
									}),
								)
								.then(response => {
									
								})
								.catch(e => {
									const error = this.getError(e)

									if(this.routeErrorHandler) {
										this.routeErrorHandler(error)
									} else {
										this.defaultResponse()
									}
								})
						}

					}
				})
	}

	private registerRouteMethod(
		route: {
			path: string,
			method: Method,
			handler: RouteHandler,
			errorHandler?: RouteErrorHandler,
		},
	) {
		if(!this.registeredRouteMethod[route.path]) {
			this.registeredRouteMethod[route.path] = {
				[route.method]: {
					handler: route.handler,
					errorHandler: route.errorHandler,
				},
			}
		} else {
			this.registeredRouteMethod[route.path]![route.method] = {
				handler: route.handler,
				errorHandler: route.errorHandler,
			}
		}
	}

	private getError(e: unknown) {
		const error = e instanceof Error
			? e
			: new RouteError({
				code: RouteErrorCode.UNKNOWN,
				message: "Unknown error",
			})

		return error
	}

	private defaultResponse() {
		
	}

	listen(
		port: number,
		onStart?: () => void,
	) {
		NativeReactNativeEcho
			.httpServerStart(this.serverID, port)
			.then(onStart)
	}

	stop() {
		this.requestListenerSubscription?.remove()

		NativeReactNativeEcho
			.httpServerStop(this.serverID)
	}

	/**
	 * Register a route for a specific path.
	 * This route takes precedence over the shorthand route method, e.g. `get`, `post`, `put`, etc.
	 */
	route(
		path: string,
		handler: RouteHandler,
		errorHandler?: RouteErrorHandler,
	) {
		this.registeredRoute[path] = {
			handler,
			errorHandler,
		}
	}

	/**
	 * Register a route as the last fallback for an error handler.
	 * 
	 * An route will invoke your error handler from each route in your `route`, `get`, `post`, and other methods.
	 * If you don't pass an error handler to your route, this function will be invoked instead.
	 * 
	 * If you don't even pass an error handler to this method,
	 * `react-native-echo` will returns default response.
	 */
	routeError(
		errorHandler: RouteErrorHandler,
	) {
		this.routeErrorHandler = errorHandler
	}

	// options(path: string, handler: RouteHandler) {
	// 	this.registerRoute({
	// 		path,
	// 		handler,
	// 		method: "OPTIONS",
	// 	})
	// }

	get(
		path: string,
		handler: RouteHandler,
		errorHandler?: RouteErrorHandler,
	) {
		this.registerRouteMethod({
			path,
			handler,
			errorHandler,
			method: "GET",
		})
	}

	post(
		path: string,
		handler: RouteHandler,
		errorHandler?: RouteErrorHandler,
	) {
		this.registerRouteMethod({
			path,
			method: "POST",
			handler,
			errorHandler,
		})
	}

	put(
		path: string,
		handler: RouteHandler,
		errorHandler?: RouteErrorHandler,
	) {
		this.registerRouteMethod({
			path,
			method: "PUT",
			handler,
			errorHandler,
		})
	}

	delete(
		path: string,
		handler: RouteHandler,
		errorHandler?: RouteErrorHandler,
	) {
		this.registerRouteMethod({
			path,
			method: "DELETE",
			handler,
			errorHandler,
		})
	}

}
