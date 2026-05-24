#include "Server.h"
#include <android/log.h>
#include <jsi/jsi.h>
#include <random>
#include <thread>
#include "uWebSockets/App.h"
#include "uWebSockets/HttpResponse.h"

namespace react_native_echo {

Server::~Server() {
  this->close();
}

// Ini gak bisa dilakukan
// Seharusnya event loop di thread pasang route yang mengambil semua pattern
// Sama seperti di implementasi sebelumnya di Ktor
// Gak bisa chaining method si "App" yang tadi
//void Server::route(facebook::jsi::Runtime &rt,
//                   std::string &&path,
//                   std::function<void (const facebook::jsi::Object requestObject)> callback) {
//  auto nApp = app->any(std::move(path), [&rt, &callback](auto *res, auto *req) {
//    __android_log_print(ANDROID_LOG_INFO, "echoserver", "route call");
//    RequestJsObject requestJsObject(req);
//    facebook::jsi::Object requestObject = facebook::jsi::Object::createFromHostObject(rt,
//                                                                                      std::make_shared<RequestJsObject>(std::move(requestJsObject)));
//
//
//    callback(std::move(requestObject));
//
//    // for a test response
//    res->end("Hello World");
//  });
//
//  app = &nApp;
//}

void Server::listen(int &&port,
                    std::function<void ()> &listenerCallback) {
  std::function<void (int &wPort, std::function<void ()> &wListenerCallback)> serverWorker = [this](auto &wPort, auto &wListenerCallback) {
    this->serverLoop = uWS::Loop::get();

    uWS::App().any("/*", [this](auto *res, auto *req) {
      auto pendingRoute = std::make_shared<PendingRoute>(RequestHostObject(req), res);

      res->onAborted([pendingRoute]() {
        pendingRoute->aborted = true;
      });

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

      this->pendingRoutes[requestID] = pendingRoute;

      // callback
    });
  };

  // To prevent the UI thread is getting blocked
  // Run the server from another thread
  // https://github.com/uNetworking/uWebSockets/issues/1858#issuecomment-2907728248
  this->serverThread = std::thread(std::move(serverWorker),
                     std::ref(port),
                     listenerCallback);

  this->serverThread.join();
}

void Server::close() {
  if(this->serverLoop) {
    this->serverLoop->defer(static_cast<uWS::MoveOnlyFunction<void(void)> &&>([this]() {
        // Close the listening sockets
        std::lock_guard<std::mutex> lock(this->listenSocketMutex);
        if (this->listenSocket) {
          us_listen_socket_close(0, listenSocket);
          listenSocket = nullptr;
        }
    }));
  }

//  if(serverThread && serverThread->joinable()) {
//    serverThread->join();
//  }
}

} // namespace react_native_echo
