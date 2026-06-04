#pragma once

#include <atomic>
#include <functional>
#include <jsi/jsi.h>
#include <memory>
#include <optional>
#include <string>
#include <queue>
#include <thread>
#include <unordered_map>
#include <utility>
#include "ServerOptions.h"
#include "uWebSockets/App.h"

namespace react_native_echo {

class Server {

private:
  std::thread serverThread;

  /**
   * Be careful. Once the `listen` method has been invoked,
   * this member has moved into another rvalue.
   */
  uWS::App app;

  /**
   * The main loop of the uWebSockets.
   * Useful to wake the uWS Loop immediately to execute queued tasks.
   */
  uWS::Loop *loop = uWS::Loop::get();

  // +++++ for socket closing +++++
  us_listen_socket_t *listenSocket = nullptr;

  std::mutex listenSocketMutex;
  // ----- for socket closing -----

public:
  std::string id;
  ServerOptions options;

  Server(std::string id, ServerOptions &&options) : id(std::move(id)), options(options) {};

  ~Server();

  void listen(int &port,
              const std::function<void ()> &listenerCallback,
              const std::function<void ()> &listenerFailureCallback);

  void close(const std::function<void ()> &onClose);

  void routeAny(std::string &&path,
                const std::function<void (uWS::HttpResponse<false> *httpResponse, uWS::HttpRequest *httpRequest)> &&handler);

  void routeGet(std::string &&path,
                const std::function<void (uWS::HttpResponse<false> *httpResponse, uWS::HttpRequest *httpRequest)> &handler);

  void routePost(std::string &&path,
                 const std::function<void (uWS::HttpResponse<false> *httpResponse, uWS::HttpRequest *httpRequest)> &handler);

  void routePut(std::string &&path,
                const std::function<void (uWS::HttpResponse<false> *httpResponse, uWS::HttpRequest *httpRequest)> &handler);

  void routeDelete(std::string &&path,
                   const std::function<void (uWS::HttpResponse<false> *httpResponse, uWS::HttpRequest *httpRequest)> &handler);
};

}
