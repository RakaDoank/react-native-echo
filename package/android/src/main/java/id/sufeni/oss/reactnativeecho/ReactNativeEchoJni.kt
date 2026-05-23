package id.sufeni.oss.reactnativeecho

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.common.annotations.FrameworkAPI
import com.facebook.react.turbomodule.core.CallInvokerHolderImpl

@OptIn(FrameworkAPI::class)
object ReactNativeEchoJni {

  private external fun installJsi(
    jsContextNativePointer: Long,
    jsCallInvokerHolder: CallInvokerHolderImpl,
  )

  private external fun invalidateJsi()

  fun install(context: ReactApplicationContext) {
    val jsContextPointer = context.javaScriptContextHolder!!.get()
    val jsCallInvokerHolder = context.jsCallInvokerHolder as CallInvokerHolderImpl

    installJsi(
      jsContextPointer,
      jsCallInvokerHolder,
    )
  }

  fun invalidate() {
    invalidateJsi()
  }

}