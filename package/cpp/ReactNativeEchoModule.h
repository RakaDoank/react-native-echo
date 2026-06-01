#pragma once

#include <ReactNativeEchoSpecsJSI.h>
#include <memory>
#include "http/Server.h"

namespace facebook::react {

class ReactNativeEchoModule : public NativeReactNativeEchoCxxSpec<ReactNativeEchoModule> {

public:
  ReactNativeEchoModule(std::shared_ptr<CallInvoker> jsInvoker);

  void httpCreateServer(facebook::jsi::Runtime &rt,
                        facebook::jsi::String serverID,
                        facebook::jsi::Object options);

  void httpServerListen(facebook::jsi::Runtime &rt,
                        facebook::jsi::String serverID,
                        double port,
                        facebook::jsi::Function onListener,
                        facebook::jsi::Function onListenerFailure);

  void httpServerClose(facebook::jsi::Runtime &rt,
                       facebook::jsi::String serverID);

  void httpServerRouteAny(facebook::jsi::Runtime &rt,
                          facebook::jsi::String serverID,
                          facebook::jsi::String path,
                          facebook::jsi::Function callback);

  void httpServerRouteGet(facebook::jsi::Runtime &rt,
                          facebook::jsi::String serverID,
                          facebook::jsi::String path,
                          facebook::jsi::Function callback);

  void httpServerRoutePost(facebook::jsi::Runtime &rt,
                           facebook::jsi::String serverID,
                           facebook::jsi::String path,
                           facebook::jsi::Function callback);

  void httpServerRoutePut(facebook::jsi::Runtime &rt,
                          facebook::jsi::String serverID,
                          facebook::jsi::String path,
                          facebook::jsi::Function callback);

  void httpServerRouteDelete(facebook::jsi::Runtime &rt,
                             facebook::jsi::String serverID,
                             facebook::jsi::String path,
                             facebook::jsi::Function callback);

};

}
