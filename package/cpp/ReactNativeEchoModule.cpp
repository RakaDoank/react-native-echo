#include "ReactNativeEchoModule.h"
#include <algorithm>
#include <memory>
#include <jsi/jsi.h>
#include <string>
#include <vector>
#include "http/RouteState.h"
#include "http/Server.h"
#include "uWebSockets/App.h"

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
                                             facebook::jsi::Function onListenerFailure,
                                             facebook::jsi::Function onRoute) {
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
    }, [](auto &requestID, auto routeState) {
      // TODO
    });
  }
}

void ReactNativeEchoModule::httpServerClose(facebook::jsi::Runtime &rt,
                                            facebook::jsi::String serverID) {
  std::string strServerID = serverID.utf8(rt);
  auto serverPtr = getServerByID(strServerID);

  if(serverPtr) {
    serverPtr->close();
  }
}

void ReactNativeEchoModule::httpServerRouteWriteResponse(facebook::jsi::Runtime &rt,
                                                         facebook::jsi::String serverID,
                                                         facebook::jsi::String requestID,
                                                         facebook::jsi::Object responseObject) {
  // TODO
}

void ReactNativeEchoModule::httpServerRequestFormData(facebook::jsi::Runtime &rt,
                                                      facebook::jsi::String serverID,
                                                      facebook::jsi::String requestID,
                                                      facebook::jsi::Function onResult) {
  // TODO
}

void ReactNativeEchoModule::httpServerRequestText(facebook::jsi::Runtime &rt,
                                                  facebook::jsi::String serverID,
                                                  facebook::jsi::String requestID,
                                                  facebook::jsi::Function onResult) {
  // TODO
}

}