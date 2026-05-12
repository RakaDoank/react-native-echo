import {
	TurboModuleRegistry,
	type CodegenTypes,
	type TurboModule,
} from "react-native"

export interface Spec extends TurboModule {

	// +++++ HTTP +++++
	httpCreateServer: (
		serverID: string,
	) => void,

	httpServerListen: (
		serverID: string,
		port: number,
	) => Promise<void>,

	httpServerStop: (
		serverID: string,
	) => void,

	/**
	 * Emit a object that contain informations to build an Request Web API
	 */
	httpRequestListener: CodegenTypes.EventEmitter<{
		serverID: string,
		requestID: string,

		// For the Request.url object
		urlOrigin: string,
		urlPathname: string,
		urlSearch: string,

		method: string,
		headers: CodegenTypes.UnsafeObject,
		referrer: string,
		referrerPolicy: string,
	}>,

	httpWriteResponse: (
		serverID: string,
		requestID: string,

		/**
		 * This is have to be the `Response` class but in plain object.
		 * Please use `_response-to-object` function to convert the `Response` class to plain object.
		 */
		responseObject: CodegenTypes.UnsafeObject,
	) => Promise<void>,

	httpGetRequestFormData: (
		serverID: string,
		requestID: string,
	) => Promise<CodegenTypes.UnsafeObject>,

	httpGetRequestJson: (
		serverID: string,
		requestID: string,
	) => Promise<string>,

	httpGetRequestText: (
		serverID: string,
		requestID: string,
	) => Promise<string>,
	// ----- HTTP -----

}

export default TurboModuleRegistry.getEnforcing<Spec>(
	"ReactNativeEcho",
)
