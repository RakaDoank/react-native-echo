#include <jsi/jsi.h>
#include <string>
#include "uWebSockets/App.h"

namespace react_native_echo {

struct ServerOptions {
  u_long routeHandlerTimeout;

public:
  static ServerOptions fromJsiObject(facebook::jsi::Runtime &rt,
                                     facebook::jsi::Object &&object);
};

class Server {
public:
    std::string id;
    ServerOptions options;

    Server(std::string id, ServerOptions &&options) : id(std::move(id)), options(options) {
    };

    ~Server();

    void route(facebook::jsi::Runtime &rt,
               std::string &&path,
               std::function<void (const facebook::jsi::Object requestObject)> callback);

    void listen(int port,
                std::function<void ()> &&callback);

    void close();
};

}
