#pragma once

#include <ReactCommon/CallInvoker.h>
#include <jsi/jsi.h>
#include <jsi/jsilib.h>

namespace react_native_echo {

void install(facebook::jsi::Runtime& rt,
             const std::shared_ptr<facebook::react::CallInvoker>& invoker
             );

void invalidate();

} // namespace reactnativeecho
