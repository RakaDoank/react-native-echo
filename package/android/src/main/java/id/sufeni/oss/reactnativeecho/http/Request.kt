package id.sufeni.oss.reactnativeecho.http

class Request(

  val url: RequestUrl,
) {

  data class RequestUrl(
    val origin: String,
    val pathname: String,
    val search: String,
  )

}