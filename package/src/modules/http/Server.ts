import {
	Platform,
	type EventSubscription,
} from "react-native"

import * as Const from "../../_internal/const"

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

import {
	ServerError,
} from "./ServerError"

import type {
	ServerEventName,
} from "./ServerEventName"

import type {
	ServerRouteInterface,
} from "./ServerRouteInterface"

import {
	RequestBuilder,
} from "./_RequestBuilder"

import {
	responseToCodegenObject,
} from "./_response-to-codegen-object"

import * as RouteErrorCode from "./route-error-code"

import * as ServerErrorCode from "./server-error-code"

export class Server implements ServerRouteInterface {

	readonly id: string

	private port: number = -1

	private requestListenerSubscription: EventSubscription | null = null

	private registeredRoute: {
		[Path in string]: {
			handler: RouteHandler,
			errorHandler?: RouteErrorHandler,
		}
	} =
		{}

	private registeredRouteWithMethod: {
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

	private registeredServerEvent: Partial<{
		[Name in ServerEventName]: () => void
	}> = {}

	constructor() {
		this.id = Math.random().toString()

		NativeReactNativeEcho
			.httpCreateServer(this.id)

		this.requestListenerSubscription =
			NativeReactNativeEcho
				.httpRequestListener(nativeRequest => {
					if(
						nativeRequest &&
						typeof nativeRequest == "object" &&

						typeof nativeRequest.serverID == "string" &&

						// What kind of cosmic rays will change this value?
						nativeRequest.serverID == this.id &&

						// Native side has to provide an `requestID` string.
						// So JS side can write a correct response to a specific client request
						typeof nativeRequest.requestID == "string"
					) {

						const route =
							this.registeredRoute[nativeRequest.urlPathname] ??
							this.registeredRouteWithMethod[nativeRequest.urlPathname]?.[nativeRequest.method as Method]

						if(route?.handler) {
							route
								.handler(
									new RequestBuilder(
										nativeRequest.serverID,
										nativeRequest.requestID,
										{
											headers: nativeRequest.headers,
											method: nativeRequest.method as Method,
											url: {
												origin: nativeRequest.urlOrigin,
												pathname: nativeRequest.urlPathname,
												search: nativeRequest.urlSearch,
											},
											referrer: nativeRequest.referrer,
											referrerPolicy: nativeRequest.referrerPolicy,
										},
									),
								)
								.then(response => {
									this.sendNativeResponse(
										nativeRequest.requestID,
										response,
									)
								})
								.catch(e1 => {
									const error = e1 instanceof Error
										? e1
										: new RouteError({
											code: RouteErrorCode.UNKNOWN,
											message: "Unknown error",
										})

									if(route.errorHandler) {
										// A route handler thrown an Error in the specific request
										// Use their error handler.
										route.errorHandler(error)
											.then(response => {
												this.sendNativeResponse(
													nativeRequest.requestID,
													response,
												)
											})
											.catch(e2 => {
												// The error handler in specific request throw an Error again
												// Use the fallback error handler
												this.routeErrorHandler?.(
													e2 instanceof Error
														? e2
														: new ServerError({
															code: ServerErrorCode.UNKNOWN,
															message: "Unknown error",
														}),
												)
													.then(response => {
														this.sendNativeResponse(
															nativeRequest.requestID,
															response,
														)
													})
													.catch(e3 => {
														// The fallback error handler throw an Error again
														// Use default error response
														this.defaultErrorResponseHandler(
															nativeRequest.requestID,
															{
																status: 500,
																error: {
																	code: "ECHO_UNHANDLED_ERROR",
																	message: e3 instanceof Error
																		? e3.message || "Internal server error"
																		: "Internal server error",
																},
															},
														)
													})
											})
									} else if(this.routeErrorHandler) {
										// No route handler found in the specific request
										// Use fallback route error handler
										this.routeErrorHandler(error)
											.then(response => {
												this.sendNativeResponse(
													nativeRequest.requestID,
													response,
												)
											})
											.catch(e2 => {
												// The fallback error handler throw an Error again
												// Use default error response
												this.defaultErrorResponseHandler(
													nativeRequest.requestID,
													{
														status: 500,
														error: {
															code: "ECHO_UNHANDLED_ERROR",
															message: e2 instanceof Error
																? e2.message || "Internal server error"
																: "Internal server error",
														},
													},
												)
											})
									} else {
										// No fallback route error handler found
										// Use default error response
										this.defaultErrorResponseHandler(
											nativeRequest.requestID,
											{
												status: 500,
												error: {
													code: "ECHO_UNHANDLED_ERROR",
													message: error.message || "Internal server error",
												},
											},
										)
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
									this.sendNativeResponse(
										nativeRequest.requestID,
										response,
									)
								})
								.catch(e1 => {
									// The .routeError was thrown an Error again
									// Use react-native-echo default response

									// If you are a react-native-echo user,
									// please do not throw an error again
									// You can use try..catch in your .routeError
									// and returns your proper Echo.Http.Response

									this.defaultErrorResponseHandler(
										nativeRequest.requestID,
										{
											status: 500,
											error: {
												code: "ECHO_UNHANDLED_ERROR",
												message: e1 instanceof Error
													? e1.message || "Internal server error"
													: "Internal server error",
											},
										},
									)
								})
						} else {
							// Specific route was not found
							// use the default response
							this.defaultErrorResponseHandler(
								nativeRequest.requestID,
								{
									status: 404,
								},
							)
						}

					} else if(typeof nativeRequest.requestID == "string") {
						// DON'T CALM.
						// PLEASE BE PANIC!

						const error = {
							code: "ECHO_PANIC_INVALID_NATIVE_REQUEST",
							message: "Something went wrong in react-native-echo",
						}

						const metadata = {
							version: Const.Echo.VERSION,
							platform: {
								os: Platform.OS,
								version: Platform.Version,
								react_native_version: Platform.constants.reactNativeVersion,
							},
						}

						this.defaultErrorResponseHandler(
							nativeRequest.requestID,
							{
								status: 500,
								error,
								metadata,
							},
						)

						if(__DEV__) {
							console.error(
								`${error.code} :: ${error.message}`,
								metadata,
							)
						}
					} else {
						// PANIC!
						// WE CAN'T WRITE A RESPONSE TO UNKNOWN REQUEST
						this.close()
						this.listen(
							this.port,
						)
					}
				})
	}

	private sendNativeResponse(
		requestID: string,
		response: Response,
	): void {
		NativeReactNativeEcho
			.httpWriteResponse(
				this.id,
				requestID,
				responseToCodegenObject(response),
			)
			.then(this.registeredServerEvent?.on_response)
	}

	private defaultErrorResponseHandler(
		requestID: string,
		data: {
			status: number,
			error?: {
				code: string,
				message?: string,
			},
			metadata?: unknown,
		},
	) {
		const status = Math.min(Math.max(data.status, 100), 599)

		NativeReactNativeEcho
			.httpWriteResponse(
				this.id,
				requestID,
				responseToCodegenObject(
					Response.json({
						status,
						error: data.error,
						metadata: data.metadata,
					}, {
						status,
					}),
				),
			)
			.then(this.registeredServerEvent.on_response)
	}

	private registerRouteWithMethod(
		route: {
			path: string,
			method: Method,
			handler: RouteHandler,
			errorHandler?: RouteErrorHandler,
		},
	) {
		if(this.port == -1) {
			if(!this.registeredRouteWithMethod[route.path]) {
				this.registeredRouteWithMethod[route.path] = {
					[route.method]: {
						handler: route.handler,
						errorHandler: route.errorHandler,
					},
				}
			} else {
				this.registeredRouteWithMethod[route.path]![route.method] = {
					handler: route.handler,
					errorHandler: route.errorHandler,
				}
			}
		}
	}

	listen(
		port: number,
		onStart?: () => void,
		onError?: (error: Error) => void,
	) {
		if(port >= 0 && port <= 65535) {

			if(this.port == -1) {
				this.port = port
				NativeReactNativeEcho
					.httpServerListen(this.id, port)
					.then(onStart)
			} else {
				onError?.(
					new ServerError({
						code: ServerErrorCode.ALREADY_USED,
						message: "Server is already in use",
					}),
				)
			}

		} else {
			onError?.(
				new ServerError({
					code: ServerErrorCode.ILLEGAL_PORT,
					message: "Illegal port number expression",
				}),
			)
		}
	}

	close() {
		this.requestListenerSubscription?.remove()
		this.requestListenerSubscription = null

		NativeReactNativeEcho
			.httpServerStop(this.id)

		this.port = -1
		this.registeredServerEvent.on_close?.()
	}

	// +++++ Route +++++

	/**
	 * Register a route request for a specific path.
	 * This route takes precedence over the shorthand route method, e.g. `get`, `post`, `put`, etc.
	 * 
	 * @param path Specific path request e.g. `/api/foo/bar`
	 * @param handler A handler for the specific path request. You have to return the handler function with `Echo.Http.Response`.
	 * @param errorHandler An optional error handler for the specific path request. If you throw an error again in the handler function, the `routeError` instance method will be invoked.
	 */
	route(
		path: string,
		handler: RouteHandler,
		errorHandler?: RouteErrorHandler,
	) {
		if(this.port == -1) {
			this.registeredRoute[path] = {
				handler,
				errorHandler,
			}
		}
	}

	/**
	 * Register an error handler as the fallback for all routes.
	 * 
	 * This error handler here will be invoked only if you don't pass an error handler to the specific route,
	 * or another error occurs again in the error handling of specific route.
	 * 
	 * A specific request will invoke your error handler first from each route in the `route`, `get`, `post`, and other methods.
	 * 
	 * If you don't even pass an error handler to this instance method,
	 * or another error occurs again,
	 * `react-native-echo` will returns default error response.
	 */
	routeError(
		errorHandler: RouteErrorHandler,
	) {
		this.routeErrorHandler = errorHandler
	}

	/**
	 * Register a GET method route request for a specific path.
	 * 
	 * @param path Specific path request e.g. `/api/foo/bar`
	 * @param handler A handler for the specific path request. You have to return the handler function with `Echo.Http.Response`.
	 * @param errorHandler An optional error handler for the specific path request. If you throw an error again in the handler function, the `routeError` instance method will be invoked.
	 */
	get(
		path: string,
		handler: RouteHandler,
		errorHandler?: RouteErrorHandler,
	) {
		this.registerRouteWithMethod({
			path,
			handler,
			errorHandler,
			method: "GET",
		})
	}

	/**
	 * Register a POST method route request for a specific path.
	 * 
	 * @param path Specific path request e.g. `/api/foo/bar`
	 * @param handler A handler for the specific path request. You have to return the handler function with `Echo.Http.Response`.
	 * @param errorHandler An optional error handler for the specific path request. If you throw an error again in the handler function, the `routeError` instance method will be invoked.
	 */
	post(
		path: string,
		handler: RouteHandler,
		errorHandler?: RouteErrorHandler,
	) {
		this.registerRouteWithMethod({
			path,
			method: "POST",
			handler,
			errorHandler,
		})
	}

	/**
	 * Register a PUT method route request for a specific path.
	 * 
	 * @param path Specific path request e.g. `/api/foo/bar`
	 * @param handler A handler for the specific path request. You have to return the handler function with `Echo.Http.Response`.
	 * @param errorHandler An optional error handler for the specific path request. If you throw an error again in the handler function, the `routeError` instance method will be invoked.
	 */
	put(
		path: string,
		handler: RouteHandler,
		errorHandler?: RouteErrorHandler,
	) {
		this.registerRouteWithMethod({
			path,
			method: "PUT",
			handler,
			errorHandler,
		})
	}

	/**
	 * Register a DELETE method route request for a specific path.
	 * 
	 * @param path Specific path request e.g. `/api/foo/bar`
	 * @param handler A handler for the specific path request. You have to return the handler function with `Echo.Http.Response`.
	 * @param errorHandler An optional error handler for the specific path request. If you throw an error again in the handler function, the `routeError` instance method will be invoked.
	 */
	delete(
		path: string,
		handler: RouteHandler,
		errorHandler?: RouteErrorHandler,
	) {
		this.registerRouteWithMethod({
			path,
			method: "DELETE",
			handler,
			errorHandler,
		})
	}

	// ----- Route -----

	event(
		name: ServerEventName,
		fn:
			| (() => void)
			| null,
	) {
		if(typeof fn == "function") {
			this.registeredServerEvent[name] = fn
		} else {
			delete this.registeredServerEvent[name]
		}
	}

}
