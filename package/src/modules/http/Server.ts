import {
	Platform,
	type EventSubscription,
} from "react-native"

import * as Const from "../../_internal/const"

import NativeReactNativeEcho from "../../_internal/native-modules/NativeReactNativeEcho"

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
	ServerOptions,
} from "./ServerOptions"

import type {
	ServerRouteInterface,
} from "./ServerRouteInterface"

import {
	NativeRequest,
} from "./_NativeRequest"

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
		[Path in string]: Partial<{
			[Method in string]: {
				handler: RouteHandler,
				errorHandler?: RouteErrorHandler,
			}
		}>
	} =
		{}

	private routeErrorHandler: RouteErrorHandler | null = null

	private registeredServerEvent: Partial<{
		[Name in ServerEventName]: () => void
	}> = {}

	constructor(
		/**
		 * Assign an ID to the server instance.
		 * You can leave it `undefined` or empty string to assign it randomly
		 */
		id?: string,
		options?: ServerOptions,
	) {
		this.id = id || Math.random().toString()

		// NativeReactNativeEcho
		// 	.httpCreateServer(
		// 		this.id,
		// 		{
		// 			routeHandlerTimeout: options?.routeHandlerTimeout ?? 180_000, // 3 minutes
		// 		},
		// 	)

		NativeReactNativeEcho
			.httpCreateServer(
				this.id,
				{
					routeHandlerTimeout: options?.routeHandlerTimeout ?? 180_000, // 3 minutes by default
				},
			)
	}

	private sendNativeResponse(
		requestID: string,
		response: Response,
	): void {
		// responseToCodegenObject(response)
		// 	.then(data => {
		// 		NativeReactNativeEcho
		// 			.httpWriteResponse(
		// 				this.id,
		// 				requestID,
		// 				data,
		// 			)
		// 			.then(this.registeredServerEvent?.on_response)
		// 			.catch(err => {
		// 				if(__DEV__) {
		// 					console.log("react-native-echo :: Error occured when send native response", err)
		// 				}
		// 			})
		// 	})

		try {
			responseToCodegenObject(response)
				.then(data => {
					NativeReactNativeEcho
						.httpServerWriteResponse(
							this.id,
							requestID,
							data,
						)
				})
		} catch(err) {
			if(__DEV__) {
				console.log("react-native-echo :: Error occured when send native response", err)
			}
		}
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
		this.sendNativeResponse(
			requestID,
			Response.json(
				{
					status: data.status,
					error: data.error,
					metadata: data.metadata,
				},
				{
					status: data.status,
				},
			),
		)
	}

	private registerRouteWithMethod(
		route: {
			path: string,
			method: string,
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

	private nativeRouteHandler(
		handler: RouteHandler,
		errorHandler: RouteErrorHandler | undefined,
		requestObject: object,
	) {
		console.log("native route handler", requestObject)
		// const request = new NativeRequest()
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
					.httpServerListen(
						this.id,
						4040,
						() => {
							onStart?.()
						},
						() => {
							console.log("onFailure listen")
						},
						() => {
							console.log("on http ")
						},
					)
				// NativeReactNativeEcho
				// 	.httpServerListen(this.id, port)
				// 	.then(onStart)
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
		if(this.port != -1) {
			// this.requestListenerSubscription?.remove()
			// this.requestListenerSubscription = null

			NativeReactNativeEcho.httpServerClose(this.id)
			// NativeReactNativeEcho
			// 	.httpServerClose(this.id)

			this.port = -1
			// this.registeredRoute = {}
			// this.registeredRouteWithMethod = {}

			// this.registeredServerEvent.on_close?.()
			// this.registeredServerEvent = {}
		}
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
			// ReactNativeEchoJsi
			// 	.httpServerRoute(
			// 		this.id,
			// 		path,
			// 		this.nativeRouteHandler.bind(this, handler, errorHandler),
			// 	)
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
			method: "GET",
			handler,
			errorHandler,
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

	// event(
	// 	name: ServerEventName,
	// 	fn:
	// 		| (() => void)
	// 		| null,
	// ) {
	// 	if(typeof fn == "function") {
	// 		this.registeredServerEvent[name] = fn
	// 	} else {
	// 		delete this.registeredServerEvent[name]
	// 	}
	// }

}
