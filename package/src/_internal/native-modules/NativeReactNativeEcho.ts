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
		onRoute: () => void,
	) => void,

	httpServerClose: (
		serverID: string,
	) => void,

	/**
	 * Emit a object that contain informations to build an Request Web API
	 */
	httpServerRequestListener: CodegenTypes.EventEmitter<{
		serverID: string,
		requestID: string,

		// +++++ Headers +++++
		method: string,
		headers: CodegenTypes.UnsafeObject,
		origin: {
			host: string,
			port: string,
			protocol: string,
		},
		url: {
			pathname: string,
			search: string,
		},
		referrer: string,
		referrerPolicy: string,
		// ----- Headers -----
	}>,

	httpServerWriteResponse: (
		serverID: string,
		requestID: string,

		/**
		 * This is have to be the `Response` class but in plain object.
		 * Please use `_response-to-codegen-object` function to convert the `Response` class to plain object.
		 */
		responseObject: CodegenTypes.UnsafeObject,
	) => void,

	httpServerRequestFormData: (
		serverID: string,
		requestID: string,
		onResult: (data: CodegenTypes.UnsafeObject) => void,
	) => void,

	httpServerRequestText: (
		serverID: string,
		requestID: string,
		onResult: (data: string) => void,
	) => void,
	// ----- HTTP -----

}

export default TurboModuleRegistry.getEnforcing<Spec>(
	"ReactNativeEcho",
)
