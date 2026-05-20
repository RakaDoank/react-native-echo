#include "ReactNativeEcho.hpp"
#include <ReactCommon/CallInvoker.h>
#include <algorithm>
#include <jsi/jsi.h>
#include <jsi/jsilib.h>
#include <string>
#include <vector>
#include "http/Server.h"
#include "uWebSockets/App.h"

namespace react_native_echo {

std::shared_ptr<facebook::react::CallInvoker> invoker;
std::vector<std::shared_ptr<react_native_echo::Server>> servers;

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
    auto server = std::make_shared<react_native_echo::Server>(serverID);
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
    auto paramCallback = std::make_shared<facebook::jsi::Object>(arguments[2].getObject(runtime));

    auto serverPtr = std::find_if(servers.begin(), servers.end(), [&paramServerID](auto &item) {
      return paramServerID == item->id;
    });

    serverPtr->get()->listen(paramPort, [&runtime, &paramCallback]() {
      paramCallback->asFunction(runtime).call(runtime, facebook::jsi::Value::undefined());
    });

    return facebook::jsi::Value::undefined();
  });

  facebook::jsi::Object reactNativeEchoModule = facebook::jsi::Object(rt);

  reactNativeEchoModule.setProperty(rt, "httpCreateServer", std::move(httpCreateServer));
  reactNativeEchoModule.setProperty(rt, "httpServerListen", std::move(httpServerListen));

} // install

}