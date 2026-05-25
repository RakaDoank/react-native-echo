#include "ReactNativeEcho.hpp"
#include <ReactCommon/CallInvoker.h>
#include <android/log.h>
#include <algorithm>
#include <functional>
#include <memory>
#include <jsi/jsi.h>
#include <jsi/jsilib.h>
#include <optional>
#include <string>
#include <string_view>
#include <vector>
#include "http/RouteState.h"
#include "http/Server.h"
#include "uWebSockets/App.h"

namespace react_native_echo {

std::shared_ptr<facebook::react::CallInvoker> jsCallInvoker;

std::vector<std::shared_ptr<react_native_echo::Server>> servers;

std::shared_ptr<react_native_echo::Server> getServerByID(std::string &serverID) {
  auto serverPtr = std::find_if(servers.begin(), servers.end(), [&serverID](auto &item) {
    return serverID == item->id;
  });
  return *serverPtr;
}

void install(facebook::jsi::Runtime &rt,
             const std::shared_ptr<facebook::react::CallInvoker> &invoker) {
  jsCallInvoker = invoker;

  auto httpCreateServer = facebook::jsi::Function::createFromHostFunction(rt,
                                                                          facebook::jsi::PropNameID::forAscii(rt, "httpCreateServer"),
                                                                          1,
                                                                          [](facebook::jsi::Runtime &runtime,
                                                                            const facebook::jsi::Value &thisValue,
                                                                            const facebook::jsi::Value *arguments,
                                                                            size_t count) -> facebook::jsi::Value {
    std::string serverID = arguments[0].asString(runtime).utf8(runtime);
    auto paramServerOptions = arguments[1].asObject(runtime);

    auto server = std::make_shared<react_native_echo::Server>(std::move(serverID),
                                                              ServerOptions::fromJsiObject(runtime, std::move(paramServerOptions)));
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

    // https://github.com/ammarahm-ed/react-native-jsi-template/blob/master/cpp/example.cpp#L48
    auto paramCallbackOnListen = arguments[2].getObject(runtime).getFunction(runtime);
    auto paramCallbackOnListenFailure = arguments[3].getObject(runtime).getFunction(runtime);
    auto paramCallbackOnRouteRequest = arguments[4].getObject(runtime).getFunction(runtime);

    auto serverPtr = getServerByID(paramServerID);
    if(serverPtr) {
      serverPtr->listen(paramPort, [&paramCallbackOnListen]() {
        // listen success callback
        jsCallInvoker->invokeAsync([&paramCallbackOnListen](auto &jsRuntime) {
          paramCallbackOnListen.call(jsRuntime, facebook::jsi::Value::undefined());
        });
      }, [&paramCallbackOnListenFailure]() {
        // listen failure callback
        jsCallInvoker->invokeAsync([&paramCallbackOnListenFailure](auto &jsRuntime) {
          paramCallbackOnListenFailure.call(jsRuntime, facebook::jsi::Value::undefined());
        });
      }, [&paramCallbackOnRouteRequest](const std::string &requestID, auto &routeState) {
        // route callback
        jsCallInvoker->invokeAsync([&paramCallbackOnRouteRequest, &routeState](auto &jsRuntime) {
          paramCallbackOnRouteRequest.call(jsRuntime,
                                           facebook::jsi::Object::createFromHostObject(jsRuntime, routeState->requestHostObject));
        });
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

  auto httpServerRouteWriteResponse = facebook::jsi::Function::createFromHostFunction(rt,
                                                                                      facebook::jsi::PropNameID::forAscii(rt, "httpServerRouteWriteResponse"),
                                                                                      3,
                                                                                      [](facebook::jsi::Runtime &runtime,
                                                                                              const facebook::jsi::Value &thisValue,
                                                                                              const facebook::jsi::Value *arguments,
                                                                                              size_t count) -> facebook::jsi::Value {
    std::string paramServerID = arguments[0].asString(runtime).utf8(runtime);
    std::string paramRequestID = arguments[1].asString(runtime).utf8(runtime);

    // see the complete definitions at
    // /react-native-echo/package/src/modules/http/_response-to-codegen-object.ts
    auto paramResponseObject = arguments[2].asObject(runtime);
    auto responseHeaders = paramResponseObject.getProperty(runtime, "headers");
    auto responseBody = paramResponseObject.getProperty(runtime, "body");
    auto responseStatus = paramResponseObject.getProperty(runtime, "status");

    if(!responseBody.isUndefined() && responseHeaders.isObject() && responseStatus.isNumber()) {
      auto server = getServerByID(paramServerID);
      if(server != nullptr) {
        server->routeWriteResponse(paramRequestID,
                                   [](const std::shared_ptr<RouteState> &routeState) -> std::optional<std::string_view> {
          routeState->httpResponse->writeStatus("200 OK");
          // TODO : Resolve the body from JS object to the actual response
          return "Hello world";
        });
      }
    }

    auto server = getServerByID(paramServerID);
    if(server) {

    }

    return facebook::jsi::Value::undefined();
  });

  facebook::jsi::Object reactNativeEchoJsi = facebook::jsi::Object(rt);
  reactNativeEchoJsi.setProperty(rt, "httpCreateServer", std::move(httpCreateServer));
  reactNativeEchoJsi.setProperty(rt, "httpServerListen", std::move(httpServerListen));
  reactNativeEchoJsi.setProperty(rt, "httpServerClose", std::move(httpServerClose));
  reactNativeEchoJsi.setProperty(rt, "httpServerRouteWriteResponse", std::move(httpServerRouteWriteResponse));
//  reactNativeEchoJsi.setProperty(rt, "httpServerRoute", std::move(httpServerRoute));

  // Expose "__react_native_echo" proxy to the global JavaScript property
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