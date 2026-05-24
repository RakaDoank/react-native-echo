#include "RequestHostObject.h"
#include <algorithm>
#include <jsi/jsi.h>
#include <vector>
#include "uWebSockets/HttpContextData.h"

namespace react_native_echo {

// +++++ PRIVATES +++++

facebook::jsi::Object RequestHostObject::headers(facebook::jsi::Runtime &rt) {
  auto headers = facebook::jsi::Object(rt);
  for(auto [key, val] : *(this->httpRequest)) {
    headers.setProperty(rt,
                        static_cast<std::string>(key).c_str(),
                        static_cast<std::string>(val));
  }
  return headers;
}

facebook::jsi::String RequestHostObject::method(facebook::jsi::Runtime &rt) {
  auto method = facebook::jsi::String::createFromAscii(rt, static_cast<std::string>(this->httpRequest->getMethod()));
  return method;
}

facebook::jsi::Object RequestHostObject::url(facebook::jsi::Runtime &rt) {
  auto url = facebook::jsi::Object(rt);
  url.setProperty(rt, "path", static_cast<std::string>(this->httpRequest->getUrl()));
  // TODO search
  // url.setProperty(rt, "search", ...);
  return url;
}

// ----- PRIVATES -----

facebook::jsi::Value RequestHostObject::get(facebook::jsi::Runtime &rt,
                                            const facebook::jsi::PropNameID &propNameID) {
  auto name = std::find_if(this->keys.begin(), this->keys.end(), [&rt, &propNameID](std::string &it) {
    return it == propNameID.utf8(rt);
  });

  if(name == this->keys.end()) {
    return facebook::jsi::Value::undefined();
  }

  if(*name == "headers") {
    return RequestHostObject::headers(rt);
  }

  if(*name == "method") {
    return RequestHostObject::method(rt);
  }

  if(*name == "url") {
    return RequestHostObject::url(rt);
  }

  return facebook::jsi::Value::undefined();
}

void RequestHostObject::set(facebook::jsi::Runtime &rt,
         const facebook::jsi::PropNameID &propNameID,
         const facebook::jsi::Value &value) {
  throw std::runtime_error("Request object is read-only");
}

std::vector<facebook::jsi::PropNameID> RequestHostObject::getPropertyNames(
        facebook::jsi::Runtime &rt) {
  std::vector<facebook::jsi::PropNameID> names = {};

  std::for_each(this->keys.begin(), this->keys.end(), [&names, &rt](auto &it) {
    names.emplace_back(facebook::jsi::PropNameID::forUtf8(rt, it));
  });

  return names;
}

}