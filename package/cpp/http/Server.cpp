#include "Server.h"
#include <chrono>
#include <jsi/jsi.h>
#include <memory>
#include <optional>
#include <random>
#include <string>
#include <string_view>
#include <thread>
#include <utility>
#include "uWebSockets/App.h"
#include "uWebSockets/HttpResponse.h"

namespace react_native_echo {

Server::~Server() {
  this->close([]() {});
}

void Server::listen(int &port,
                    const std::function<void ()> &listenerCallback,
                    const std::function<void ()> &listenerFailureCallback) {
  // To prevent the UI thread is getting blocked
  // Run the server from another thread
  // https://github.com/uNetworking/uWebSockets/issues/1858#issuecomment-2907728248
  this->serverThread = std::thread([this, listenerCallback, listenerFailureCallback, port]() {
    // move app instance due to different thread
    uWS::App internalApp = uWS::App(std::move(this->app));

    this->serverLoop = internalApp.getLoop();

    internalApp.listen("0.0.0.0", port,
                       [this, listenerCallback, listenerFailureCallback](auto *listenedSocket) {
      this->listenSocket = listenedSocket;
      if(listenedSocket) {
        listenerCallback();
      } else {
        listenerFailureCallback();
      }
    });

    this->serverLoop->run();
  });

  this->serverThread.detach();
}

void Server::close(const std::function<void ()> &onClose) {
  if(this->serverLoop) {
    this->serverLoop->defer(static_cast<uWS::MoveOnlyFunction<void (void)> &&>([this, onClose]() {
        // Close the listening sockets
        std::lock_guard<std::mutex> lock(this->listenSocketMutex);
        if (this->listenSocket) {
          us_listen_socket_close(0, listenSocket);
          this->listenSocket = nullptr;
          onClose();
        }
    }));
  }
}

void Server::routeAny(std::string &&path,
                      const std::function<void (uWS::HttpResponse<false> *httpResponse, uWS::HttpRequest *httpRequest)> &&handler) {
  this->app.any(path, [handler](auto *res, auto *req) mutable {
    handler(res, req);
//    res->end("Hola " + std::to_string(result));
//    if(this->serverLoop) {
//      int result = handler(res, req);

//      res->end("Hola");
//      this->serverLoop->defer([handler, res, req]() mutable {
//        res->end("Hola");
////        handler(res, req);
//      });
//    } else {
//      auto now = std::chrono::system_clock::now();
//      auto duration = now.time_since_epoch();
//      auto millis = std::chrono::duration_cast<std::chrono::milliseconds>(duration).count();
//      res->end(std::to_string(millis));
//    }
  });
}

void Server::routeGet(std::string &&path,
                      const std::function<void(uWS::HttpResponse<false> *, uWS::HttpRequest *)> &handler) {
  // TODO
}

void Server::routePost(std::string &&path,
                       const std::function<void(uWS::HttpResponse<false> *, uWS::HttpRequest *)> &handler) {
  // TODO
}

void Server::routePut(std::string &&path,
                      const std::function<void(uWS::HttpResponse<false> *, uWS::HttpRequest *)> &handler) {
  // TODO
}

void Server::routeDelete(std::string &&path,
                         const std::function<void(uWS::HttpResponse<false> *, uWS::HttpRequest *)> &handler) {
  // TODO
}

} // namespace react_native_echo
