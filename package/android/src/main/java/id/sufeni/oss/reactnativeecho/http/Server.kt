package id.sufeni.oss.reactnativeecho.http

import com.facebook.react.bridge.ReadableMap
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.install
import io.ktor.server.engine.EmbeddedServer
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.ktor.server.netty.NettyApplicationEngine
import io.ktor.server.plugins.forwardedheaders.ForwardedHeaders
import io.ktor.server.response.*
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import java.util.UUID
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeout

class Server(
  private val options: ServerOptions,
  val onRouteRequest: (requestID: String, routeRequest: RouteRequest) -> Unit,
) {

  private val routeRequests =
    mutableMapOf<RequestID, RouteRequest>()

  private val deferredResponses =
    mutableMapOf<RequestID, CompletableDeferred<ReadableMap?>>()

  private var server: EmbeddedServer<NettyApplicationEngine, NettyApplicationEngine.Configuration>? =
    null

  fun listen(
    port: UShort,
    onStart: () -> Unit,
  ) {
    // already guarded by JS
    // to prevent this method is getting invoked more than once
    server = embeddedServer(
      Netty,
      port = port.toInt(),
    ) {

      install(ForwardedHeaders)

      routing {
        route("{...}") {
          handle {
            val requestID = UUID.randomUUID().toString()
            val routeRequest = RouteRequest(call)
            routeRequests[requestID] = routeRequest

            val deferredResponse = CompletableDeferred<ReadableMap?>()
            deferredResponses[requestID] = deferredResponse

            onRouteRequest(requestID, routeRequest)

            val responseCodegenObject = withTimeout(options.routeHandleTimeout) {
              try {
                deferredResponse.await()
              } catch(_: CancellationException) {
                null
              }
            }

            deferredResponses.remove(requestID)

            if(responseCodegenObject == null) {
              call.respond(HttpStatusCode.NoContent)
            } else {
              // see the complete object definition of `responseCodegenObject`
              // at /react-native-echo/package/src/modules/http/_response-to-codegen-object.ts

              val headers = responseCodegenObject.getMap("headers")
              headers?.entryIterator?.forEach { entry ->
                if(entry.value is String) {
                  call.response.header(entry.key, entry.value as String)
                }
              }

              val status = responseCodegenObject.getDouble("status").toInt()
              val statusText = responseCodegenObject.getString("statusText")
              call.response.status(
                HttpStatusCode(
                  status,
                  statusText ?: HttpStatusCode.fromValue(status).description,
                ),
              )

              val bodyText = responseCodegenObject.getString("body")
              if(bodyText != null) {
                call.respondText(bodyText)
              } else {
                // TODO : blob and file-uri respond
                call.respond(HttpStatusCode.NoContent)
              }
            }
          }
        }
      } // routing

    }.start(wait = false)

    onStart()
  }

  fun close() {
    if(server != null) {
      server!!.stop()
    }
  }

  fun routeRequest(
    requestID: String,
  ): RouteRequest? {
    return routeRequests[requestID]
  }

  fun routeRequestFormData(
    requestID: String,
    onResult: (result: ReadableMap?) -> Unit,
  ) {
    val routeRequest = this.routeRequest(requestID)
    if(server != null && routeRequest != null) {
      CoroutineScope(server!!.application.coroutineContext).launch {
        onResult(
          routeRequest.formData()
        )
      }
    }
  }

  fun writeResponse(
    requestID: String,
    responseCodegenObject: ReadableMap?,
  ) {
    val deferredResponse = deferredResponses[requestID]
    deferredResponse?.complete(responseCodegenObject)
  }

}

private typealias RequestID = String