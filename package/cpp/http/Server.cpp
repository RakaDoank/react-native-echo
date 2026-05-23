#include "Server.h"
#include <android/log.h>
#include <jsi/jsi.h>
#include <thread>
#include "RequestJsObject.h"
#include "uWebSockets/App.h"
#include "uWebSockets/HttpResponse.h"

namespace {

/**
 * This is temporary app setup.
 * The value will be moved to the worker thread (std::move) after user call the `listen` method.
 * It's should've been guarded from the JS to prevent call the listen method of the JSI.
 */
uWS::TemplatedApp<false> *app = new uWS::App;

std::thread serverThread;

us_listen_socket_t *listenSocket = nullptr;
std::mutex listenSocketMutex;

uWS::Loop *serverLoop = nullptr;

}

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

Server::~Server() {
  this->close();
}

// Ini gak bisa dilakukan
// Seharusnya event loop di thread pasang route yang mengambil semua pattern
// Sama seperti di implementasi sebelumnya di Ktor
// Gak bisa chaining method si "App" yang tadi
void Server::route(facebook::jsi::Runtime &rt,
                   std::string &&path,
                   std::function<void (const facebook::jsi::Object requestObject)> callback) {
  auto nApp = app->any(std::move(path), [&rt, &callback](auto *res, auto *req) {
    __android_log_print(ANDROID_LOG_INFO, "echoserver", "route call");
    RequestJsObject requestJsObject(req);
    facebook::jsi::Object requestObject = facebook::jsi::Object::createFromHostObject(rt,
                                                                                      std::make_shared<RequestJsObject>(std::move(requestJsObject)));


    callback(std::move(requestObject));

    // for a test response
    res->end("Hello World");
  });

  app = &nApp;
}

void Server::listen(int port,
                    std::function<void ()> &&listenerCallback) {
  std::function<void (uWS::TemplatedApp<false> &&wApp, int &wPort, std::function<void ()> wCallback)> workerTest = [](auto wApp, auto wPort, auto wCallback) {
    serverLoop = uWS::Loop::get();

    wApp.listen(wPort, [&wCallback](auto *listenerSocket) {
      listenSocket = listenerSocket;
      wCallback();
    });

    // Run the event loop
    wApp.run();
  };

  // To prevent the UI thread is getting blocked
  // Run the server from another thread
  // https://github.com/uNetworking/uWebSockets/issues/1858#issuecomment-2907728248
  serverThread = std::thread(std::move(workerTest),
                     std::move(*app),
                     std::ref(port),
                     listenerCallback);

  serverThread.join();
}

void Server::close() {
  if(serverLoop) {
    serverLoop->defer([]() {
      // Close the listening sockets
      std::lock_guard<std::mutex> lock(listenSocketMutex);
      if(listenSocket) {
        us_listen_socket_close(0, listenSocket);
        listenSocket = nullptr;
      }
    });
  }

//  if(serverThread && serverThread->joinable()) {
//    serverThread->join();
//  }
}

} // namespace react_native_echo
