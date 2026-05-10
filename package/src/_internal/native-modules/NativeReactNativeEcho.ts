import {
	TurboModuleRegistry,
	type CodegenTypes,
	type TurboModule,
} from "react-native"

export interface NativeReactNativeEchoSpec extends TurboModule {

	// +++++ HTTP +++++
	httpCreateServer: (
		serverID: string,
	) => void,

	httpServerStart: (
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
		path: string,

		url: string,
		method: string,
		headers: CodegenTypes.UnsafeObject,
		referrer: string,
		referrerPolicy: string,
	}>,

	httpResponse: CodegenTypes.EventEmitter<{
		serverID: string,
		requestID: string,
	}>,

	httpGetRequestHeaders: (
		serverID: string,
		requestID: string,
	) => void,

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

export default TurboModuleRegistry.getEnforcing<NativeReactNativeEchoSpec>(
	"ReactNativeEcho",
)
