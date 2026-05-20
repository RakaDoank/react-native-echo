#include "Server.h"
#include "uWebSockets/App.h"

namespace react_native_echo {

auto app = uWS::App();

void Server::listen(int port,
                    std::function<void ()> callback) {
  app.listen(port, [&callback](auto *listenSocket) {
    callback();
  });
}

void Server::close() {

}

} // namespace react_native_echo
