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
                        facebook::jsi::Function onListenerFailure,
                        facebook::jsi::Function onRoute);

  void httpServerClose(facebook::jsi::Runtime &rt,
                       facebook::jsi::String serverID);

  void httpServerRouteWriteResponse(facebook::jsi::Runtime &rt,
                                    facebook::jsi::String serverID,
                                    facebook::jsi::String requestID,
                                    facebook::jsi::Object responseObject);

  void httpServerRequestFormData(facebook::jsi::Runtime &rt,
                                 facebook::jsi::String serverID,
                                 facebook::jsi::String requestID,
                                 facebook::jsi::Function onResult);

  void httpServerRequestText(facebook::jsi::Runtime &rt,
                             facebook::jsi::String serverID,
                             facebook::jsi::String requestID,
                             facebook::jsi::Function onResult);

};

}
