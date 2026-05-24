#include "ServerOptions.h"

namespace react_native_echo {

ServerOptions ServerOptions::fromJsiObject(facebook::jsi::Runtime &rt,
                                           facebook::jsi::Object &&object) {
  auto timeout = object.getProperty(rt, "routeHandlerTimeout");

  ServerOptions options = {180000};

  if(timeout.isNumber()) {
    options.routeHandlerTimeout = static_cast<u_long>(timeout.asNumber());
  }

  return options;
}

}
