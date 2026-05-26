#include "Server.h"
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
  this->close();
}

void Server::listen(std::shared_ptr<facebook::jsi::Object> jsListenerCallback,
                    int &port,
                    const std::function<void (std::shared_ptr<facebook::jsi::Object> jsListenerCallback)> &listenerCallback,
                    const std::function<void ()> &listenerFailureCallback,
                    const std::function<void (const std::string &requestID, const std::shared_ptr<RouteState> &routeState)> &routeCallback) {
  // +++++ server worker +++++
//  std::function<void (int &wPort, std::function<void ()> &wListenerCallback, std::function<void ()> &wListenerFailureCallback, std::function<void (const std::string &requestID, const std::shared_ptr<RouteState> &routeState)> &wRouteCallback)> serverWorker = [this](auto &wPort, auto &wListenerCallback, auto &wListenerFailureCallback, auto &wRouteCallback) {
//    this->serverLoop = uWS::Loop::get();
//
//    uWS::App().any("/*", [this, &wRouteCallback](auto *res, auto *req) {
//      auto pendingRouteState = std::make_shared<PendingRouteState>(req, res);
//
//      std::string requestID;
//      {
//        const std::string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//        std::random_device rd;
//        std::mt19937 mt(rd());
//        std::uniform_real_distribution<> dist(0, chars.size() - 1);
//
//        for(int i = 0; i < 16; ++i) {
//          requestID += chars[static_cast<int>(dist(mt))];
//        }
//      }
//
//      // Store pending route
//      this->pendingRoutes[requestID] = pendingRouteState;
//
//      // handle client disconnect
//      res->onAborted([this, &pendingRouteState, &requestID]() {
//        pendingRouteState->aborted = true;
//        std::lock_guard<std::mutex> lock(this->pendingMutex);
//        this->pendingRoutes.erase(requestID);
//      });
//
//      // Notify JS callback
//      // ReactNativeEchoJsi.httpServerListen( 4040, () => console.log("on listen"), (req) => console.log("on request") )
//      wRouteCallback(requestID, pendingRouteState->state);
//    }).listen(wPort, [this, &wListenerCallback, &wListenerFailureCallback](auto *listenerSocket) {
//      this->listenSocket = listenerSocket;
//
//      if(listenerSocket) {
//        wListenerCallback();
//      } else {
//        wListenerFailureCallback();
//      }
//    }).run();
//  };
  // ---- server worker -----

  // To prevent the UI thread is getting blocked
  // Run the server from another thread
  // https://github.com/uNetworking/uWebSockets/issues/1858#issuecomment-2907728248
//  this->serverThread = std::thread(std::move(serverWorker),
//                                   std::ref(port),
//                                   std::ref(listenerCallback),
//                                   std::ref(listenerFailureCallback),
//                                   std::ref(routeCallback));

//  this->serverThread.detach();

//  this->serverThread = std::thread([this, &port, &listenerCallback, &listenerFailureCallback, &routeCallback]() {
//    this->serverLoop = uWS::Loop::get();
//
//    uWS::App().any("/*", [this, &routeCallback](auto *res, auto *req) {
//      auto pendingRouteState = std::make_shared<PendingRouteState>(req, res);
//
//      std::string requestID;
//      {
//        const std::string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//        std::random_device rd;
//        std::mt19937 mt(rd());
//        std::uniform_real_distribution<> dist(0, chars.size() - 1);
//
//        for(int i = 0; i < 16; ++i) {
//          requestID += chars[static_cast<int>(dist(mt))];
//        }
//      }
//
//      // Store pending route
//      this->pendingRoutes[requestID] = pendingRouteState;
//
//      // handle client disconnect
//      res->onAborted([this, &pendingRouteState, &requestID]() {
//        pendingRouteState->aborted = true;
//        std::lock_guard<std::mutex> lock(this->pendingMutex);
//        this->pendingRoutes.erase(requestID);
//      });
//
//      // Notify JS callback
//      // ReactNativeEchoJsi.httpServerListen( 4040, () => console.log("on listen"), (req) => console.log("on request") )
//      routeCallback(requestID, pendingRouteState->state);
//    }).listen(port, [this, &listenerCallback, &listenerFailureCallback](auto *listenerSocket) {
//      this->listenSocket = listenerSocket;
//
//      if(listenerSocket) {
//        listenerCallback();
//      } else {
//        listenerFailureCallback();
//      }
//    }).run();
//  });

//  std::function<void (facebook::jsi::Runtime &rt, std::function<void (facebook::jsi::Runtime &rt)> &listenerCallback_)> simpleWorker = [](auto &rt_, const auto &listenerCallback_) {
//    listenerCallback_(rt_);
//  };

  this->serverThread = std::thread([jsListenerCallback, listenerCallback]() {
    listenerCallback(jsListenerCallback);
  });

// doesn't work
//  this->serverThread = std::thread([&listenerCallback]() {
//    listenerCallback();
//  });

  this->serverThread.detach();
}

void Server::close() {
  if(this->serverLoop) {
    this->serverLoop->defer(static_cast<uWS::MoveOnlyFunction<void(void)> &&>([this]() {
        // Close the listening sockets
        std::lock_guard<std::mutex> lock(this->listenSocketMutex);
        if (this->listenSocket) {
          us_listen_socket_close(0, listenSocket);
          this->listenSocket = nullptr;
        }
    }));
  }
}

/**
 * Called from JS / React Native thread
 */
void Server::routeWriteResponse(const std::string &requestID,
                                std::function<std::optional<std::string_view> (const std::shared_ptr<RouteState> &routeState)> &&resCallback) {
  std::shared_ptr<PendingRouteState> routeState;
  {
    std::lock_guard<std::mutex> lock(this->pendingMutex);
    auto it = this->pendingRoutes.find(requestID);

    if(it == this->pendingRoutes.end()) {
      // there is no pending request found
      return;
    }

    routeState = it->second;
    this->pendingRoutes.erase(it);
  }

  auto bodyResponse = resCallback(routeState->state);

  // Wake uWS loop safely
  this->serverLoop->defer([&routeState, &bodyResponse]() {
    if(routeState->aborted || routeState->completed) {
      return;
    }

    routeState->completed = true;

    if(bodyResponse.has_value()) {
      routeState->state->httpResponse->end(bodyResponse.value());
    } else {
      routeState->state->httpResponse->endWithoutBody();
    }
  });
}

} // namespace react_native_echo
