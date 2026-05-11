import type {
	EventSubscription,
} from "react-native"

import NativeReactNativeEcho from "../../_internal/native-modules/NativeReactNativeEcho"

import type {
	Method,
} from "./Method"

import {
	Response,
} from "./Response"

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

import {
	responseToObject,
} from "./_response-to-object"

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

	private routeErrorHandler: RouteErrorHandler | null = null

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
						typeof obj.path == "string" &&
						typeof obj.method == "string"
					) {

						const route =
							this.registeredRoute[obj.path] ??
							this.registeredRouteMethod[obj.path]?.[obj.method as Method]

						if(route?.handler) {
							route
								.handler(
									new RequestBuilder(
										obj.requestID,
										{
											headers: obj.headers,
											method: obj.method as Method,
										},
									),
								)
								.then(response => {
									
								})
								.catch<Response>(e => {
									const error = e instanceof Error
										? e
										: new RouteError({
											code: RouteErrorCode.UNKNOWN,
											message: "Unknown error",
										})

									const errHandler =
										// User route handler thrown an Error
										// Move to its error handler
										route.errorHandler ||

										// No route handler found for the specific request
										// Use the global route error handler
										this.routeErrorHandler

									if(errHandler) {
										errHandler(error)
											.then(res => {

											})
									} else {
										// No global route error handler found
										// Use react-native-echo default response
										this.defaultResponseHandler(error)
									}
								})
						} else if(this.routeErrorHandler) {
							// Specific route was not found
							// Send an 404 error

							this
								.routeErrorHandler(
									new RouteError({
										code: RouteErrorCode.FOUR_O_FOUR,
										message: "Unspecified route",
									}),
								)
								.then(response => {
									
								})
								.catch(e => {
									// The .routeError was thrown an Error again
									// Use react-native-echo default response

									// If you are a react-native-echo user,
									// please do not throw an error again
									// You can use try..catch in your .routeError
									// and returns your proper Echo.Http.Response

									this.defaultResponseHandler(e)
								})
						} else {
							// 404
							
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

	private sendNativeResponse(
		requestID: string,
		response: Response,
	): void {
		NativeReactNativeEcho
			.httpResponse(
				this.serverID,
				requestID,
				responseToObject(response),
			)
	}

	private defaultResponseHandler(
		error?: unknown,
	): Promise<Response> {
		
	}

	listen(
		port: number,
		onStart?: () => void,
	) {
		NativeReactNativeEcho
			.httpServerListen(this.serverID, port)
			.then(onStart)
	}

	stop() {
		this.requestListenerSubscription?.remove()
		this.requestListenerSubscription = null

		NativeReactNativeEcho
			.httpServerStop(this.serverID)
	}

	/**
	 * Register a route request for a specific path.
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
	 * Register a route as the fallback for an error handler.
	 * 
	 * Remember, a specific request will invoke your error handler first from each route in your `route`, `get`, `post`, and other methods.
	 * 
	 * This function will be invoked only if you don't pass an error handler to your route,
	 * or you throw an Error in your error handler from each route.
	 * 
	 * If you don't even pass an error handler to this instance method,
	 * or throw an Error again,
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
