#pragma once
#include <memory>
#include "uWebSockets/HttpContextData.h"
#include "uWebSockets/HttpResponse.h"

namespace react_native_echo {

struct RouteState {
  uWS::HttpRequest *httpRequest;
  uWS::HttpResponse<false> *httpResponse;

  RouteState(uWS::HttpRequest *pHttpRequest, uWS::HttpResponse<false> *pHttpResponse) : httpRequest(pHttpRequest), httpResponse(pHttpResponse) {}
};

}
