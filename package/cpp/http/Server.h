#include <string>

#include "uWebSockets/App.h"

namespace react_native_echo {

class Server {
public:
    std::string id;

    Server(std::string id) : id(std::move(id)) {
    };

    void listen(int port,
                std::function<void ()> callback);

    void close();
};

}