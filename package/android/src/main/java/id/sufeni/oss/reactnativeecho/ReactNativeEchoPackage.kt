package id.sufeni.oss.reactnativeecho

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class ReactNativeEchoPackage : BaseReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    return when (name) {
      ReactNativeEchoModule.NAME -> {
        ReactNativeEchoModule(reactContext)
      }
      else -> {
        null
      }
    }
  }

  override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
    mapOf(
      // http
      ReactNativeEchoModule.NAME to ReactModuleInfo(
        name = ReactNativeEchoModule.NAME,
        className = ReactNativeEchoModule.NAME,
        canOverrideExistingModule = false,
        needsEagerInit = false,
        isCxxModule = false,
        isTurboModule = true
      ),

      // ws
    )
  }

}
