package id.sufeni.oss.reactnativeecho.http

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import io.ktor.server.plugins.BadRequestException
import io.ktor.server.plugins.origin
import io.ktor.server.request.ContentTransformationException
import io.ktor.server.request.httpMethod
import io.ktor.server.request.path
import io.ktor.server.request.queryString
import io.ktor.server.request.receiveParameters
import io.ktor.server.request.receiveText
import io.ktor.server.routing.RoutingCall

/**
 * For the members like `headers`, `method`, `url`,
 * just send directly to the JS without this class.
 *
 * This class is only for the JS to get the formData, json, or text lazily by using method
 */
class RouteRequest(
  private val call: RoutingCall,
) {

  val headers = call.request.headers

  val method = call.request.httpMethod.value

  val origin = Origin(
    host = call.request.origin.remoteHost,
    port = call.request.origin.remotePort.toString(),
    protocol = "${call.request.origin.scheme}:", // trailing colon similar as the Web API of URL.protocol
  )

  val url = Url(
    pathname = call.request.path(),
    search = call.request.queryString(),
  )

  data class Origin (
    val host: String,
    val port: String,
    val protocol: String, // "https:"
  )

  data class Url (
    val pathname: String,
    val search: String,
  )

  suspend fun formData(): ReadableMap? {
    try {
      val parameters = call.receiveParameters()

      val map = Arguments.createMap()
      parameters.forEach { string, _ ->
        map.putString(string, parameters.get(string))
      }

      return map
    } catch(_: ContentTransformationException) {
      // content cannot be transformed to the Parameters
      return null
    }
  }

  suspend fun text(): String? {
    try {
      return call.receiveText()
    } catch(_: BadRequestException) {
      // Content-Type header is invalid
      return null
    }
  }

}