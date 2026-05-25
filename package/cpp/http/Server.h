#include <atomic>
#include <functional>
#include <optional>
#include <string>
#include <queue>
#include <thread>
#include <unordered_map>
#include <utility>
#include "RouteState.h"
#include "ServerOptions.h"
#include "uWebSockets/App.h"

namespace react_native_echo {

class Server {

private:
  std::thread serverThread;

  /**
   * The main loop of the uWebSockets.
   * Useful to wake the uWS Loop immediately to execute queued tasks.
   */
  uWS::Loop *serverLoop = nullptr;

  // +++++ for socket closing +++++
  us_listen_socket_t *listenSocket = nullptr;

  std::mutex listenSocketMutex;
  // ----- for socket closing -----

  // +++++ Pending Request +++++
  std::mutex pendingMutex;

  /**
   * This is needed for JavaScript to get the `Request` Web API object,
   * and to write a response from a route.
   *
   * This is just the struct, JS need to find the exact `PendingRoute` by the `requestID` they received.
   */
  struct PendingRouteState {
    std::shared_ptr<RouteState> state;
    std::atomic<bool> aborted = false;
    std::atomic<bool> completed = false;

    PendingRouteState(uWS::HttpRequest *httpRequest, uWS::HttpResponse<false> *httpResponse) : state(std::make_shared<RouteState>(httpRequest, httpResponse)) {};
  };

  /**
   * Store the `PendingRoute` struct here whenever a route get requested
   * with a string as the `requestID` and as the map's key.
   */
  std::unordered_map<std::string /* requestID */, std::shared_ptr<PendingRouteState>> pendingRoutes;
  // ----- Pending Request -----

public:
  std::string id;
  ServerOptions options;

  Server(std::string id, ServerOptions &&options) : id(std::move(id)), options(options) {};

  ~Server();

  void listen(int &port,
              std::function<void ()> listenerCallback,
              std::function<void ()> listenerFailureCallback,
              std::function<void (const std::string &requestID, const std::shared_ptr<RouteState> &routeState)> routeCallback);

  void close();

  void routeWriteResponse(const std::string &requestID,
                          std::function<std::optional<std::string_view> (const std::shared_ptr<RouteState> &routeState)> &&resCallback);
};

}
