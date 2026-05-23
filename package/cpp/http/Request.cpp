#include "Request.h"
#include <jsi/jsi.h>
#include "uWebSockets/HttpContextData.h"
#include "uWebSockets/HttpParser.h"
#include "uWebSockets/HttpResponse.h"
#include "uWebSockets/Multipart.h"

namespace react_native_echo {

facebook::jsi::Object Request::headers(facebook::jsi::Runtime &rt,
                                       uWS::HttpRequest *req) {
  auto headers = facebook::jsi::Object(rt);
  for(auto [key, val] : *req) {
    headers.setProperty(rt,
                        static_cast<std::string>(key).c_str(),
                        static_cast<std::string>(val));
  }
  return headers;
}

facebook::jsi::String Request::method(facebook::jsi::Runtime &rt,
                                      uWS::HttpRequest *req) {
  auto method = facebook::jsi::String::createFromAscii(rt, static_cast<std::string>(req->getMethod()));
  return method;
}

facebook::jsi::Object Request::url(facebook::jsi::Runtime &rt,
                                   uWS::HttpRequest *req) {
  auto url = facebook::jsi::Object(rt);
  url.setProperty(rt, "path", static_cast<std::string>(req->getUrl()));
  // TODO search
  // url.setProperty(rt, "search", ...);
  return url;
}

void formData(facebook::jsi::Runtime &rt,
              uWS::HttpRequest *req,
              uWS::HttpResponse<false> *res,
              std::function<void (facebook::jsi::Object formData)> &callback) {
  Request::text(rt, req, res, [&callback](auto &&dataText) {
    // See this example from uWebSockets.js
    // https://github.com/uNetworking/uWebSockets.js/blob/master/src/addon.cpp

    auto mp = uWS::MultipartParser("multipart/form-data"); // it's already guarded by JavaScript
    if(mp.isValid()) {
      mp.setBody(dataText);

      std::pair<std::string_view, std::string_view> headers[10];


    }
  });
}

void Request::text(facebook::jsi::Runtime &rt,
                                    uWS::HttpRequest *req,
                                    uWS::HttpResponse<false> *res,
                                    std::function<void (const std::string text)> callback) {
  res->onData([&callback, buffer = std::string{}](std::string_view data, bool last) mutable {
    buffer.append(data.data(), data.length());
    if(last) {
      callback(std::move(buffer));
    }
  });
}

}
