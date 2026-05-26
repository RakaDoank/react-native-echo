#include "ReactNativeEcho.hpp"
#include <fbjni/fbjni.h>
#include <jni.h>
#include <jsi/jsi.h>
#include <ReactCommon/CallInvokerHolder.h>
#include <typeinfo>

struct ReactNativeEchoJni : facebook::jni::JavaClass<ReactNativeEchoJni> {
  static constexpr auto kJavaDescriptor = "Lid/sufeni/oss/reactnativeecho/ReactNativeEchoJni;";

  static void registerNatives() {
    javaClassStatic()->registerNatives({
      makeNativeMethod("installJsi", ReactNativeEchoJni::installJsi),
      makeNativeMethod("invalidateJsi", ReactNativeEchoJni::invalidateJsi)
    });
  }

private:
  static void installJsi(facebook::jni::alias_ref<facebook::jni::JObject> thiz,
                         jlong jsiRuntimePtr,
                         facebook::jni::alias_ref<facebook::react::CallInvokerHolder::javaobject> jsCallInvokerHolder) {
    auto jsiRuntime = reinterpret_cast<facebook::jsi::Runtime *>(jsiRuntimePtr);
    auto jsCallInvoker = jsCallInvokerHolder->cthis()->getCallInvoker();

    react_native_echo::install(*jsiRuntime, jsCallInvoker);
  }

  static void invalidateJsi(facebook::jni::alias_ref<facebook::jni::JObject> thiz) {
    react_native_echo::invalidate();
  }
};

JNIEXPORT jint JNI_OnLoad(JavaVM *vm, void *) {
  return facebook::jni::initialize(vm, []{
    ReactNativeEchoJni::registerNatives();
  });
}
