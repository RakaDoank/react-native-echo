#pragma once
#include <memory>
#include "RequestHostObject.h"
#include "uWebSockets/HttpContextData.h"
#include "uWebSockets/HttpResponse.h"

namespace react_native_echo {

struct RouteState {
  std::shared_ptr<RequestHostObject> requestHostObject;
  uWS::HttpResponse<false> *httpResponse;

  RouteState(uWS::HttpRequest *pHttpRequest, uWS::HttpResponse<false> *pHttpResponse) : requestHostObject(std::make_shared<RequestHostObject>(pHttpRequest)) {
    this->httpResponse = pHttpResponse;
  };
};

}
