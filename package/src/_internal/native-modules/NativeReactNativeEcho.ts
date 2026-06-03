import {
	TurboModuleRegistry,
	type CodegenTypes,
	type TurboModule,
} from "react-native"

/**
 * This spec is only for C++.
 */
export interface Spec extends TurboModule {

	// +++++ HTTP +++++
	httpCreateServer: (
		serverID: string,
		options: {
			routeHandlerTimeout: number,
		},
	) => void,

	httpServerListen: (
		serverID: string,
		port: number,
		onListen: () => void,
		onListenFailure: () => void,
	) => void,

	httpServerClose: (
		serverID: string,
	) => void,

	// +++++ We don't need these anymore +++++

	// httpServerRequestListener: CodegenTypes.EventEmitter<{
	// 	serverID: string,
	// 	requestID: string,

	// 	// +++++ Headers +++++
	// 	method: string,
	// 	headers: CodegenTypes.UnsafeObject,
	// 	origin: {
	// 		host: string,
	// 		port: string,
	// 		protocol: string,
	// 	},
	// 	url: {
	// 		pathname: string,
	// 		search: string,
	// 	},
	// 	referrer: string,
	// 	referrerPolicy: string,
	// 	// ----- Headers -----
	// }>,

	// httpServerRouteWriteTextResponse: (
	// 	serverID: string,
	// 	requestID: string,

	// 	/**
	// 	 * This is have to be the `Response` class but in plain object.
	// 	 * Please use `_response-to-codegen-object` function to convert the `Response` class to plain object.
	// 	 */
	// 	responseObject: CodegenTypes.UnsafeObject,
	// ) => void,

	// httpServerRequestFormData: (
	// 	serverID: string,
	// 	requestID: string,
	// 	onResult: (data: CodegenTypes.UnsafeObject) => void,
	// ) => void,

	// httpServerRequestText: (
	// 	serverID: string,
	// 	requestID: string,
	// 	onResult: (data: string) => void,
	// ) => void,

	// ----- We don't need these anymore -----

	httpServerRouteAny: (
		serverID: string,
		path: string,
		callback: (
			requestObject: CodegenTypes.UnsafeObject,
			responseNotifier: (responseObject: CodegenTypes.UnsafeObject) => void,
		) => void,
	) => void,

	httpServerRouteGet: (
		serverID: string,
		path: string,
		callback: (
			requestObject: CodegenTypes.UnsafeObject,
			responseNotifier: (responseObject: CodegenTypes.UnsafeObject) => void,
		) => void,
	) => void,

	httpServerRoutePost: (
		serverID: string,
		path: string,
		callback: (
			requestObject: CodegenTypes.UnsafeObject,
			responseNotifier: (responseObject: CodegenTypes.UnsafeObject) => void,
		) => void,
	) => void,

	httpServerRoutePut: (
		serverID: string,
		path: string,
		callback: (
			requestObject: CodegenTypes.UnsafeObject,
			responseNotifier: (responseObject: CodegenTypes.UnsafeObject) => void,
		) => void,
	) => void,

	httpServerRouteDelete: (
		serverID: string,
		path: string,
		callback: (
			requestObject: CodegenTypes.UnsafeObject,
			responseNotifier: (responseObject: CodegenTypes.UnsafeObject) => void,
		) => void,
	) => void,
	// ----- HTTP -----

}

export default TurboModuleRegistry.getEnforcing<Spec>(
	"ReactNativeEcho",
)
