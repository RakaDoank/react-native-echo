#pragma once

#include <ReactCommon/CallInvoker.h>
#include <jsi/jsi.h>
#include <jsi/jsilib.h>
#include "http/Server.h"

namespace react_native_echo {

std::shared_ptr<react_native_echo::Server> getServerByID(std::string &serverID);

void install(facebook::jsi::Runtime& rt,
             const std::shared_ptr<facebook::react::CallInvoker>& invoker);

void invalidate();

} // namespace reactnativeecho
