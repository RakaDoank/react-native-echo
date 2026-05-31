#include "Server.h"
#include <android/log.h>
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

void Server::listen(int &port,
                    const std::function<void ()> &listenerCallback,
                    const std::function<void ()> &listenerFailureCallback,
                    const std::function<void (const std::string &requestID, const std::shared_ptr<RouteState> routeState)> &routeCallback) {
  // To prevent the UI thread is getting blocked
  // Run the server from another thread
  // https://github.com/uNetworking/uWebSockets/issues/1858#issuecomment-2907728248
  this->serverThread = std::thread([this, listenerCallback, listenerFailureCallback, routeCallback, &port]() {
    this->serverLoop = uWS::Loop::get();

    uWS::App().any("/*", [this, routeCallback](auto *res, auto *req) {
      auto pendingRouteState = std::make_shared<PendingRouteState>(req, res);

      std::string requestID;
      {
        const std::string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        std::random_device rd;
        std::mt19937 mt(rd());
        std::uniform_real_distribution<> dist(0, chars.size() - 1);

        for(int i = 0; i < 16; ++i) {
          requestID += chars[static_cast<int>(dist(mt))];
        }
      }

      // Store pending route
      this->pendingRoutes[requestID] = pendingRouteState;

      // handle client disconnect
      res->onAborted([this, &pendingRouteState, &requestID]() {
        pendingRouteState->aborted = true;
        std::lock_guard<std::mutex> lock(this->pendingRouteMutex);
        this->pendingRoutes.erase(requestID);
      });

      // Notify JS callback
      routeCallback(requestID, pendingRouteState->state);
    }).listen("0.0.0.0", port, [this, &listenerCallback, &listenerFailureCallback](auto *listenedSocket) {
      this->listenSocket = listenedSocket;
      if(listenedSocket) {
        listenerCallback();
      } else {
        __android_log_print(ANDROID_LOG_INFO, "echoserver", "Not listened");
        listenerFailureCallback();
      }
    }).run();
  });

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
    std::lock_guard<std::mutex> lock(this->pendingRouteMutex);
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
