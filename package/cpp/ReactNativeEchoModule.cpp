#include "ReactNativeEchoModule.h"
#include <algorithm>
#include <android/log.h>
#include <future>
#include <memory>
#include <iterator>
#include <jsi/jsi.h>
#include <string>
#include <utility>
#include <vector>
#include "RequestHostObject.h"
#include "http/RouteState.h"
#include "http/Server.h"
#include "uWebSockets/HttpContextData.h"
#include "uWebSockets/HttpResponse.h"

namespace facebook::react {

namespace {

std::vector<std::shared_ptr<react_native_echo::Server>> servers;

std::shared_ptr<react_native_echo::Server> getServerByID(std::string &serverID) {
  auto serverPtr = std::find_if(servers.begin(), servers.end(), [&serverID](auto &item) {
    return serverID == item->id;
  });
  return *serverPtr;
}

} // namespace

ReactNativeEchoModule::ReactNativeEchoModule(std::shared_ptr<CallInvoker> jsInvoker)
  : NativeReactNativeEchoCxxSpec(std::move(jsInvoker)) {}

void ReactNativeEchoModule::httpCreateServer(facebook::jsi::Runtime &rt,
                                             facebook::jsi::String serverID,
                                             facebook::jsi::Object options) {
  auto server = std::make_shared<react_native_echo::Server>(serverID.utf8(rt),
                                          react_native_echo::ServerOptions::fromJsiObject(rt, std::move(options)));

  servers.emplace_back(std::move(server));
}

void ReactNativeEchoModule::httpServerListen(facebook::jsi::Runtime &rt,
                                             facebook::jsi::String serverID,
                                             double port,
                                             facebook::jsi::Function onListener,
                                             facebook::jsi::Function onListenerFailure) {
  std::string strServerID = serverID.utf8(rt);
  auto intPort = static_cast<int>(port);
  auto serverPtr = getServerByID(strServerID);

  auto onListenerAsyncCallback = AsyncCallback(rt, std::move(onListener), this->jsInvoker_);
  auto onListenerFailureAsyncCallback = AsyncCallback(rt, std::move(onListenerFailure), this->jsInvoker_);

  if(serverPtr) {
    serverPtr->listen(intPort, [onListenerAsyncCallback_ = std::move(onListenerAsyncCallback)]() {
      onListenerAsyncCallback_.call();
    }, [onListenerFailureAsyncCallback_ = std::move(onListenerFailureAsyncCallback)]() {
      onListenerFailureAsyncCallback_.call();
    });
  }
}

void ReactNativeEchoModule::httpServerClose(facebook::jsi::Runtime &rt,
                                            facebook::jsi::String serverID) {
  std::string strServerID = serverID.utf8(rt);
  auto serverPtr = getServerByID(strServerID);

  if(serverPtr) {
    serverPtr->close([&strServerID]() {
      auto it = std::find_if(servers.begin(), servers.end(), [strServerID](auto &item) {
        return strServerID == item->id;
      });
      if(it != servers.end()) {
        servers.erase(it);
      }
    });
  }
}

void ReactNativeEchoModule::httpServerRouteAny(facebook::jsi::Runtime &rt,
                                               facebook::jsi::String serverID,
                                               facebook::jsi::String path,
                                               facebook::jsi::Function callback) {
  std::string strServerID = serverID.utf8(rt);
  auto serverPtr = getServerByID(strServerID);

  auto asyncCallback = AsyncCallback(rt, std::move(callback), this->jsInvoker_);

  if(serverPtr) {
    serverPtr->routeAny(path.utf8(rt), [&rt, asyncCallback_ = std::move(asyncCallback)](uWS::HttpResponse<false> *res, uWS::HttpRequest *req) {
      auto responseObjectPromise = std::make_shared<std::promise<facebook::jsi::Object>>();
      auto responseObjectFuture = responseObjectPromise->get_future();

      asyncCallback_.call([res, req, responseObjectPromise](facebook::jsi::Runtime &rt_1, facebook::jsi::Function &cb) {
        auto requestHostObject = std::make_shared<react_native_echo::RequestHostObject>(res, req);

        cb.call(rt_1,
                // requestObject
                facebook::jsi::Object::createFromHostObject(rt_1, std::move(requestHostObject)),

                // responseNotifier
                facebook::jsi::Function::createFromHostFunction(rt_1,
                                                                facebook::jsi::PropNameID::forUtf8(rt_1, "responseNotifier"),
                                                                1,
                                                                [responseObjectPromise](facebook::jsi::Runtime &rt_2,
                                                                                        const facebook::jsi::Value &thisValue,
                                                                                        const facebook::jsi::Value *arguments,
                                                                                        size_t count) -> facebook::jsi::Value {
                  /**
                   * Check the JS object definition at /src/modules/http/_response-to-object.ts
                   */
                  auto responseObject = facebook::jsi::Object(arguments[0].asObject(rt_2));
                  responseObjectPromise->set_value(std::move(responseObject));

                  return facebook::jsi::Value::undefined();
                })/* end call */);
      });

      /**
       * Check the JS object definition at /src/modules/http/_response-to-object.ts
       */
      auto responseObject = responseObjectFuture.get();

      auto body = responseObject.getProperty(rt, "body");
      auto bodyType = responseObject.getProperty(rt, "bodyType").asString(rt);

      auto headers = responseObject.getProperty(rt, "headers").asObject(rt);

      auto status = responseObject.getProperty(rt, "status").asNumber();
      auto statusText = responseObject.getProperty(rt, "statusText").asString(rt);

      // +++++ Write Header +++++
      {
        const auto headerNames = headers.getPropertyNames(rt);
        for(int i = 0; i < static_cast<int>(headerNames.length(rt)); i++) {
          facebook::jsi::String headerNameJsString = headerNames.getValueAtIndex(rt, i).asString(rt);
          std::string headerValueStr = headers.getProperty(rt, headerNameJsString).asString(rt).utf8(rt);

          res->writeHeader(std::move(headerNameJsString).utf8(rt), std::move(headerValueStr));
        }
      }
      // ----- Write Header -----

      // +++++ Write Response +++++
      if(bodyType.utf8(rt) == "text" && body.isString()) {
        res->end(body.asString(rt).utf8(rt));
      } else {
        res->end(R"({"message": "Internal server error"})");
      }
      // ---- Write Response
    });
  }
}

void ReactNativeEchoModule::httpServerRouteGet(facebook::jsi::Runtime &rt,
                                               facebook::jsi::String serverID,
                                               facebook::jsi::String path,
                                               facebook::jsi::Function callback) {
  // TODO
}

void ReactNativeEchoModule::httpServerRoutePost(facebook::jsi::Runtime &rt,
                                                facebook::jsi::String serverID,
                                                facebook::jsi::String path,
                                                facebook::jsi::Function callback) {
  // TODO
}

void ReactNativeEchoModule::httpServerRoutePut(facebook::jsi::Runtime &rt,
                                               facebook::jsi::String serverID,
                                               facebook::jsi::String path,
                                               facebook::jsi::Function callback) {
  // TODO
}

void ReactNativeEchoModule::httpServerRouteDelete(facebook::jsi::Runtime &rt,
                                                  facebook::jsi::String serverID,
                                                  facebook::jsi::String path,
                                                  facebook::jsi::Function callback) {
  // TODO
}

}