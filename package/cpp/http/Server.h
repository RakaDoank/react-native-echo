#include "ServerOptions.h"
#include <jsi/jsi.h>
#include <string>
#include <thread>
#include <unordered_map>
#include "RequestHostObject.h"
#include "uWebSockets/App.h"

namespace react_native_echo {

class Server {

private:
    std::thread serverThread;

    uWS::Loop *serverLoop = nullptr;

    us_listen_socket_t *listenSocket = nullptr;

    std::mutex listenSocketMutex;

    struct PendingRoute {
      RequestHostObject requestHostObject;
      uWS::HttpResponse<false> *httpResponse;
      bool aborted = false;

      PendingRoute(RequestHostObject &&pRequestHostObject, uWS::HttpResponse<false> *pHttpResponse) : requestHostObject(pRequestHostObject), httpResponse(pHttpResponse) {}
    };

    std::unordered_map<std::string, std::shared_ptr<PendingRoute>> pendingRoutes;

//    std::string generateRequestID();

public:
    std::string id;
    ServerOptions options;

    Server(std::string id, ServerOptions &&options) : id(std::move(id)), options(options) {
    };

    ~Server();

//    void route(facebook::jsi::Runtime &rt,
//               std::string &path,
//               std::function<void (const facebook::jsi::Object requestObject)> &callback);

    void listen(int &&port,
                std::function<void ()> &callback);

    void close();
};

}
