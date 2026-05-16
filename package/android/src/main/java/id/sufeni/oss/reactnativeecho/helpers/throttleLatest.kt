package id.sufeni.oss.reactnativeecho.helpers

import kotlinx.coroutines.Job
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

// Originally from https://stackoverflow.com/a/57252799

fun <T> throttleLatest(
  intervalMs: Long,
  destinationFunction: suspend (T) -> Unit
): suspend (T) -> Unit {
  var throttleJob: Job? = null
  var latestParam: T
  return { param: T ->
    latestParam = param
    if (throttleJob?.isCompleted != false) {
      throttleJob = coroutineScope {
        launch {
          delay(intervalMs)
          destinationFunction(latestParam)
        }
      }
    }
  }
}
