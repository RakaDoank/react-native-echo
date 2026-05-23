#include "RequestJsObject.h"
#include <jsi/jsi.h>
#include <vector>
#include "Request.h"
#include "uWebSockets/HttpContextData.h"

namespace react_native_echo {

facebook::jsi::Value RequestJsObject::get(facebook::jsi::Runtime &rt,
                                          const facebook::jsi::PropNameID &propNameID) {
  auto name = propNameID.utf8(rt);

  if(name == "headers") {
    return Request::headers(rt, this->httpRequest);
  }

  if(name == "method") {
    return Request::method(rt, this->httpRequest);
  }

  if(name == "url") {
    return Request::url(rt, this->httpRequest);
  }

  return facebook::jsi::Value::undefined();
}

void RequestJsObject::set(facebook::jsi::Runtime &rt,
         const facebook::jsi::PropNameID &propNameID,
         const facebook::jsi::Value &value) {
  throw std::runtime_error("Request object is read-only");
}

std::vector<facebook::jsi::PropNameID> RequestJsObject::getPropertyNames(
        facebook::jsi::Runtime &rt) {
  std::vector<facebook::jsi::PropNameID> keys = {};
  keys.emplace_back(facebook::jsi::PropNameID::forUtf8(rt, "headers"));
  keys.emplace_back(facebook::jsi::PropNameID::forUtf8(rt, "method"));
  keys.emplace_back(facebook::jsi::PropNameID::forUtf8(rt, "url"));
  return keys;
}

}