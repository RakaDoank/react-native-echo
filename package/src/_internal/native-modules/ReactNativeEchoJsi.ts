// import type {
// 	Request,
// } from "../../modules/http/Request"

// DO NOT USE THIS ANYMORE
// Just use the Turbo Modules Xplat
// This hacky way is not recommended, and just adding more headache.

import NativeReactNativeEcho from "./NativeReactNativeEcho"

declare namespace global {
	const __react_native_echo: ReactNativeEchoJsi.Instance | undefined
}

if(!global.__react_native_echo) {
	// Call the synchronous blocking install() function
	const installed = NativeReactNativeEcho.install()

	if(!installed) {
		throw new Error(
			`The native module could not be installed! Looks like something went wrong when installing JSI bindings, check the native logs for more info.`,
		);
	}

	if(!global.__react_native_echo) {
		// __react_native_echo is still undefined
		throw new Error("Something went wrong in the react-native-echo native module.")
	}
}

console.log("global ", global.__react_native_echo)

export namespace ReactNativeEchoJsi {

	/**
	 * This is not a Turbo Module spec.
	 * Please be careful of this change!
	 */
	export interface Instance {
		httpCreateServer: (
			serverID: string,
			/**
			 * @see {@link file:///./../../../cpp/http/Server.h"}
			 */
			options: {
				routeHandlerTimeout: number,
			},
		) => void,

		httpServerListen: (
			serverID: string,
			port: number,
			callback: () => void,
			failureCallback: () => void,
			onRouteRequest: (requestObject: object) => void,
		) => void,

		httpServerClose: (
			serverID: string,
		) => void,

		// httpServerRouteOnRequest: (
		// 	serverID: string,
		// 	requestID: string,
		// 	request: Request,
		// ) => void,

		// httpServerRoute: (
		// 	serverID: string,
		// 	path: string,
		// 	callback: (
		// 		request: Request,
		// 	) => void,
		// ) => void,

		httpServerRouteWriteResponse: (
			serverID: string,
			requestID: string,
			/**
			 * The `Response` class in object.
			 * Please use the `_response-to-codegen-object.ts`
			 */
			response: object,
		) => void,
	}

	export const httpCreateServer = global.__react_native_echo!.httpCreateServer

	export const httpServerListen = global.__react_native_echo!.httpServerListen

	export const httpServerClose = global.__react_native_echo!.httpServerClose

	// export const httpServerRoute = global.__react_native_echo!.httpServerRoute

	// export const httpServerRouteOnRequest = global.__react_native_echo!.httpServerRouteOnRequest

	export const httpServerRouteWriteResponse = global.__react_native_echo!.httpServerRouteWriteResponse

}
