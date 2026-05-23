#include "uWebSockets/HttpContextData.h"
#include <jsi/jsi.h>
#include <string>

namespace react_native_echo {

class Request {

public:
  static facebook::jsi::Object headers(facebook::jsi::Runtime &rt, uWS::HttpRequest *req);

  static facebook::jsi::String method(facebook::jsi::Runtime &rt, uWS::HttpRequest *req);

  static facebook::jsi::Object url(facebook::jsi::Runtime &rt, uWS::HttpRequest *req);

//  static facebook::jsi::Object form

  static void text(facebook::jsi::Runtime &rt,
                                    uWS::HttpRequest *req,
                                    uWS::HttpResponse<false> *res,
                                    std::function<void (const std::string data)> callback);

};

}
