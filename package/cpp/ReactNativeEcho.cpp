#include "ReactNativeEcho.hpp"
#include "http/Server.h"
#include "uWebSockets/App.h"
#include <ReactCommon/CallInvoker.h>
#include <android/log.h>
#include <algorithm>
#include <memory>
#include <jsi/jsi.h>
#include <jsi/jsilib.h>
#include <string>
#include <vector>

namespace {

std::shared_ptr<facebook::react::CallInvoker> invoker;
std::vector<std::shared_ptr<react_native_echo::Server>> servers;

std::shared_ptr<react_native_echo::Server> getServerByID(std::string &serverID) {
  auto serverPtr = std::find_if(servers.begin(), servers.end(), [serverID](auto &item) {
    return serverID == item->id;
  });
  return *serverPtr;
}

}

namespace react_native_echo {

void install(facebook::jsi::Runtime &rt,
             const std::shared_ptr<facebook::react::CallInvoker> &invoker_
             ) {
  invoker = invoker_;

  auto httpCreateServer = facebook::jsi::Function::createFromHostFunction(rt,
                                                                 facebook::jsi::PropNameID::forAscii(rt, "httpCreateServer"),
                                                                 1,
                                                                 [](facebook::jsi::Runtime &runtime,
                                                                            const facebook::jsi::Value &thisValue,
                                                                            const facebook::jsi::Value *arguments,
                                                                            size_t count) -> facebook::jsi::Value {
    std::string serverID = arguments[0].asString(runtime).utf8(runtime);
    auto paramServerOptions = arguments[1].asObject(runtime);

    Server newServer(std::move(serverID), ServerOptions::fromJsiObject(runtime, std::move(paramServerOptions)));
    auto server = std::make_shared<react_native_echo::Server>(newServer);
    servers.emplace_back(std::move(server));

    return facebook::jsi::Value::undefined();
  });

  auto httpServerListen = facebook::jsi::Function::createFromHostFunction(rt,
                                                                          facebook::jsi::PropNameID::forAscii(rt, "httpServerListen"),
                                                                          3,
                                                                          [](facebook::jsi::Runtime &runtime,
                                                                                     const facebook::jsi::Value &thisValue,
                                                                                     const facebook::jsi::Value *arguments,
                                                                                     size_t count) -> facebook::jsi::Value {
    std::string paramServerID = arguments[0].asString(runtime).utf8(runtime);
    int paramPort = static_cast<int>(arguments[1].asNumber());

    // https://github.com/ammarahm-ed/react-native-jsi-template/blob/master/cpp/example.cpp#L74
//    auto paramCallback = std::make_shared<facebook::jsi::Object>(arguments[2].getObject(runtime).asFunction(runtime));

    auto serverPtr = getServerByID(paramServerID);
    if(serverPtr) {
      serverPtr->listen(paramPort, []() {
//        paramCallback_->asFunction(runtime).call(runtime, facebook::jsi::Value::undefined());
      });
    }

    __android_log_print(ANDROID_LOG_INFO, "echoserver", "httpServerListen returning");

    return facebook::jsi::Value::undefined();
  });

  auto httpServerClose = facebook::jsi::Function::createFromHostFunction(rt,
                                                                         facebook::jsi::PropNameID::forAscii(rt, "httpServerClose"),
                                                                         1,
                                                                         [](facebook::jsi::Runtime &runtime,
                                                                                 const facebook::jsi::Value &thisValue,
                                                                                 const facebook::jsi::Value *arguments,
                                                                                 size_t count) -> facebook::jsi::Value {
    std::string paramServerID = arguments[0].asString(runtime).utf8(runtime);

    auto serverPtr = getServerByID(paramServerID);
    if(serverPtr != nullptr) {
      serverPtr->close();
    }

    return facebook::jsi::Value::undefined();
  });

  /**
   * ```js
   * function() {
   *   ReactNativeEchoJsi.httpServerRoute(
   *    "someID",
   *    "/api/foo/bar",
   *    (request) => {
   *      // logics
   *    },
   *   )
   * }
   * ```
   */
  auto httpServerRoute = facebook::jsi::Function::createFromHostFunction(rt,
                                                                         facebook::jsi::PropNameID::forAscii(rt, "httpServerRoute"),
                                                                         1,
                                                                         [](facebook::jsi::Runtime &runtime,
                                                                                 const facebook::jsi::Value &thisValue,
                                                                                 const facebook::jsi::Value *arguments,
                                                                                 size_t count) -> facebook::jsi::Value {
    auto paramServerID = arguments[0].asString(runtime).utf8(runtime);
    auto paramPath = arguments[1].asString(runtime).utf8(runtime);
    auto paramCallback = std::make_shared<facebook::jsi::Object>(arguments[2].getObject(runtime));

    auto serverPtr = getServerByID(paramServerID);
    serverPtr->route(runtime,
                     std::move(paramPath),
                     [&runtime, &paramCallback](const auto requestObject) {
      paramCallback->asFunction(runtime).call(runtime, std::move(requestObject));
    });

    return facebook::jsi::Value::undefined();
  });

  facebook::jsi::Object reactNativeEchoJsi = facebook::jsi::Object(rt);
  reactNativeEchoJsi.setProperty(rt, "httpCreateServer", std::move(httpCreateServer));
  reactNativeEchoJsi.setProperty(rt, "httpServerListen", std::move(httpServerListen));
  reactNativeEchoJsi.setProperty(rt, "httpServerClose", std::move(httpServerClose));
  reactNativeEchoJsi.setProperty(rt, "httpServerRoute", std::move(httpServerRoute));

  // Expose __react_native_echo proxy to the global JavaScript property
  // This is used in the /react-native-echo/package/src/_internal/native-modules/ReactNativeEchoJsi.ts
  rt.global().setProperty(rt, "__react_native_echo", std::move(reactNativeEchoJsi));

} // install

// React native will try to clean the module on JS context invalidation
// Code Push / Hot Reload
void invalidate() {
  for(const auto &server : servers) {
    server->close();
  }

  servers.clear();
}

}