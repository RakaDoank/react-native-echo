package id.sufeni.oss.reactnativeecho

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import id.sufeni.oss.reactnativeecho.http.Server

class ReactNativeEchoModule(
	reactApplicationContext: ReactApplicationContext,
) : NativeReactNativeEchoSpec(reactApplicationContext) {

  private val httpServers =
    mutableMapOf<String, Server>()

  override fun httpCreateServer(
    serverID: String,
  ) {
    TODO("Not yet implemented")
  }

  override fun httpServerListen(
    serverID: String,
    port: Double,
    promise: Promise?,
  ) {
    TODO("Not yet implemented")
  }

  override fun httpServerStop(serverID: String) {
    val httpServer = httpServers.get(serverID)
    if(httpServer != null) {

    }
    TODO("Not yet implemented")
  }

  override fun httpWriteResponse(
    serverID: String,
    requestID: String,
    responseObject: ReadableMap?,
    promise: Promise,
  ) {
    TODO("Not yet implemented")
  }

  override fun httpGetRequestFormData(
    serverID: String,
    requestID: String,
    promise: Promise,
  ) {
    TODO("Not yet implemented")
  }

  override fun httpGetRequestJson(
    serverID: String,
    requestID: String,
    promise: Promise,
  ) {
    TODO("Not yet implemented")
  }

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
