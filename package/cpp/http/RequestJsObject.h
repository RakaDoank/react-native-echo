#include <jsi/jsi.h>
#include <vector>
#include <uWebSockets/HttpParser.h>
#include "uWebSockets/HttpContextData.h"

namespace react_native_echo {

class JSI_EXPORT RequestJsObject : public facebook::jsi::HostObject {

private:
  uWS::HttpRequest *httpRequest;

public:
  RequestJsObject(uWS::HttpRequest *req) : httpRequest(req) {};

public:
  facebook::jsi::Value get(facebook::jsi::Runtime &rt,
                           const facebook::jsi::PropNameID &propNameID) override;

  void set(facebook::jsi::Runtime &rt,
           const facebook::jsi::PropNameID &propNameID,
           const facebook::jsi::Value &value) override;

  std::vector<facebook::jsi::PropNameID> getPropertyNames(facebook::jsi::Runtime &rt) override;

};

}
