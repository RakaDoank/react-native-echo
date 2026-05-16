package id.sufeni.oss.reactnativeecho.http

import android.net.Uri
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import io.ktor.http.HttpHeaders
import io.ktor.http.content.PartData
import io.ktor.http.content.forEachPart
import io.ktor.http.fileExtensions
import io.ktor.server.plugins.BadRequestException
import io.ktor.server.plugins.origin
import io.ktor.server.request.ContentTransformationException
import io.ktor.server.request.httpMethod
import io.ktor.server.request.path
import io.ktor.server.request.queryString
import io.ktor.server.request.receiveMultipart
import io.ktor.server.request.receiveText
import io.ktor.server.routing.RoutingCall
import io.ktor.util.cio.writeChannel
import io.ktor.utils.io.copyAndClose
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.IOException

/**
 * For the members like `headers`, `method`, `url`,
 * just send directly to the JS with React Native codegen map.
 */
class Request(
  private val call: RoutingCall,
  private val reactApplicationContext: ReactApplicationContext,
) {

  /**
   * Store temporary files upon request, and remove it after Response.
   */
  private val partFileItems =
      mutableMapOf<String, File>()

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

  val referrer = headers[HttpHeaders.Referrer] ?: ""
  val referrerPolicy = headers["referrer-policy"] ?: ""

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
      val data = call.receiveMultipart()
      val map = Arguments.createMap()

      data.forEachPart { part ->
        when(part) {
          is PartData.FormItem -> {
            if(part.name != null) {
              map.putString(part.name!!, part.value)
            }
          }
          is PartData.FileItem -> {
           if(part.name != null) {
             val defaultPrefix = "rn_echo_tmp"

             val temporaryFile =
               File.createTempFile(
                 defaultPrefix,
                 part.contentType?.fileExtensions()[0]?.let {
                   ".$it"
                 },
                 reactApplicationContext.cacheDir,
               )
             part.provider().copyAndClose(temporaryFile.writeChannel())

             partFileItems[part.name!!] = temporaryFile

             // these are required for
             // /react-native-echo/package/src/modules/http/_NativeRequest.ts
             val mapFile = Arguments.createMap()
             mapFile.putString("name", temporaryFile.name)
             mapFile.putString("originalName", part.originalFileName ?: "")
             mapFile.putLong("size", temporaryFile.length())
             mapFile.putString("type", part.contentType?.toString() ?: "")
             mapFile.putString("uri", Uri.fromFile(temporaryFile).toString())
             map.putMap(part.name!!, mapFile)
           }
          }
          else -> {}
        }
        part.dispose()
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

  /**
   * Call this method to clear some references that needs to be removed or cleared.
   * For instance, removing the cached multipart file if any.
   */
  suspend fun dispose() {
    withContext(Dispatchers.IO) {
      partFileItems.entries.forEach {
        try {
          it.value.delete()
        } catch(_: IOException) {
          // nothing
        }
      }
    }
  }

}