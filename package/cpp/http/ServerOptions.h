#include <jsi/jsi.h>

namespace react_native_echo {

struct ServerOptions {

public:
  u_long routeHandlerTimeout;

  static ServerOptions fromJsiObject(facebook::jsi::Runtime &rt,
                                     facebook::jsi::Object &&object);

};

}
