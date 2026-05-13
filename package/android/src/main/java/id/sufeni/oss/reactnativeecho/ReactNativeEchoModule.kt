package id.sufeni.oss.reactnativeecho

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import id.sufeni.oss.reactnativeecho.http.Server
import id.sufeni.oss.reactnativeecho.http.ServerOptions
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class ReactNativeEchoModule(
	reactApplicationContext: ReactApplicationContext,
) : NativeReactNativeEchoSpec(reactApplicationContext) {

  private val httpServers =
    mutableMapOf<String, Server>()

  override fun httpCreateServer(
    serverID: String,
    options: ReadableMap,
  ) {
    val serverOptions = object : ServerOptions {
      override val routeHandleTimeout =
        options.getDouble("routeHandleTimeout").toLong()
    }

    val httpServer = Server(
      options = serverOptions,
    ) { requestID, routeRequest ->

    }

    httpServers[serverID] = httpServer
  }

  override fun httpServerListen(
    serverID: String,
    port: Double,
    promise: Promise?,
  ) {
    val httpServer = httpServers[serverID]
    if(httpServer != null) {
      httpServer.listen(
        port.toUInt().toUShort(),
      ) {
        promise?.resolve("listening")
      }
    } else {
      promise?.reject("ECHO_HTTP_SERVER_ALREADY_LISTENED", "Server is already listened")
    }
  }

  override fun httpServerClose(serverID: String) {
    httpServers[serverID]?.close()
  }

  override fun httpWriteResponse(
    serverID: String,
    requestID: String,
    responseObject: ReadableMap?,
    promise: Promise,
  ) {
    val httpServer = httpServers[serverID]
    if(httpServer != null) {
      httpServer.writeResponse(
        requestID,
        responseObject,
      )
      promise.resolve(null)
    } else {
      promise.reject("ECHO_HTTP_SERVER_NOT_FOUND", "Server not found")
    }
  }

  override fun httpGetRequestFormData(
    serverID: String,
    requestID: String,
    promise: Promise,
  ) {
    val httpServer = httpServers[serverID]
    if(httpServer != null) {
      val routeRequest = httpServer.routeRequest(requestID)
      if(routeRequest != null) {

      } else {
        promise.reject("ECHO_HTTP_SERVER_ROUTE_REQUEST_NOT_FOUND", "Route request not found")
      }
    } else {
      promise.reject("ECHO_HTTP_SERVER_NOT_FOUND", "Server not found")
    }
  }

//  override fun httpGetRequestJson(
//    serverID: String,
//    requestID: String,
//    promise: Promise,
//  ) {
//    TODO("Not yet implemented")
//  }

  override fun httpGetRequestText(
    serverID: String,
    requestID: String,
    promise: Promise,
  ) {
    TODO("Not yet implemented")
  }

  companion object {
    const val NAME = NativeReactNativeEchoSpec.NAME
  }

}
