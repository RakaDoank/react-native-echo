#include <jsi/jsi.h>
#include <vector>
#include <uWebSockets/HttpParser.h>
#include "uWebSockets/HttpContextData.h"

namespace react_native_echo {

class JSI_EXPORT RequestHostObject : public facebook::jsi::HostObject {

private:
  uWS::HttpRequest *httpRequest;

  std::vector<std::string> keys = {"id",      // represent as the request-id
                                   "headers", // obviously headers object
                                   "method",  // GET, POST, or else
                                   "url"
  };



  facebook::jsi::Object headers(facebook::jsi::Runtime &rt);

  facebook::jsi::String method(facebook::jsi::Runtime &rt);

  facebook::jsi::Object url(facebook::jsi::Runtime &rt);

public:
  RequestHostObject(uWS::HttpRequest *req) : httpRequest(req) {};

  facebook::jsi::Value get(facebook::jsi::Runtime &rt,
                           const facebook::jsi::PropNameID &propNameID) override;

  void set(facebook::jsi::Runtime &rt,
           const facebook::jsi::PropNameID &propNameID,
           const facebook::jsi::Value &value) override;

  std::vector<facebook::jsi::PropNameID> getPropertyNames(facebook::jsi::Runtime &rt) override;

};

}
