package id.sufeni.oss.reactnativeecho.helpers

import kotlin.random.Random

private val CHAR_POOL = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".toCharArray()
private val POOL_SIZE = CHAR_POOL.size
private val random = Random.Default

fun randomString(length: Int): String {

  val result = CharArray(length)

  for (i in result.indices) {
    result[i] = CHAR_POOL[random.nextInt(POOL_SIZE)]
  }

  return String(result)

}
