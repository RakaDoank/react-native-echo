project(ReactNativeEcho)
cmake_minimum_required(VERSION 3.14.0)

include(FetchContent)

set(PACKAGE_NAME "react-native-echo")
set(CMAKE_VERBOSE_MAKEFILE ON)

find_package(ReactAndroid REQUIRED CONFIG)
find_package(fbjni REQUIRED CONFIG)

file(GLOB_RECURSE cpp_shared_files RELATIVE ${CMAKE_SOURCE_DIR} "../cpp/**.cpp")
# It's useful to include JNI
# file(GLOB_RECURSE cpp_android_files RELATIVE ${CMAKE_SOURCE_DIR} "src/main/cpp/**/*.cpp")

add_library(
	${PACKAGE_NAME}
	SHARED
	${cpp_shared_files}
	# ${cpp_android_files}
)

target_include_directories(${PACKAGE_NAME} PUBLIC "src/main/cpp" "../cpp")

# +++++ Define uWebSockets C++ library +++++
# Thanks to https://github.com/tony-go/cmake-uwebsockets/blob/main/CMakeLists.txt
FetchContent_Declare(
	rnecho_uwebsockets_content
	GIT_REPOSITORY https://github.com/uNetworking/uWebSockets
	GIT_TAG v20.37.0
	GIT_SHALLOW ON
	GIT_SUBMODULES ""
)
FetchContent_MakeAvailable(rnecho_uwebsockets_content)

# Create a folder to include the uWebSockets library with its path name, like `#include "uWebSockets/App.h"
set(UWEBSOCKETS_WRAPPER_DIR ${CMAKE_BINARY_DIR}/uwebsockets_copy)

# 1. Remove existing directory "${CMAKE_BINARY_DIR}/uwebsockets_copy"
file(REMOVE_RECURSE ${UWEBSOCKETS_WRAPPER_DIR})
# 2. Make the directory again "${CMAKE_BINARY_DIR}/uwebsockets_copy"
file(
	MAKE_DIRECTORY
	${UWEBSOCKETS_WRAPPER_DIR}
)
# 3. Copy the "${rnecho_uwebsockets_content_SOURCE_DIR}/src" to "${UWEBSOCKETS_WRAPPER_DIR}"
# The result will be "${CMAKE_BINARY_DIR}/uwebsockets_copy/src/...cxxFiles..."
file(
	COPY
	"${rnecho_uwebsockets_content_SOURCE_DIR}/src"
	DESTINATION
	"${UWEBSOCKETS_WRAPPER_DIR}"
)
# 4. Rename "${UWEBSOCKETS_WRAPPER_DIR}/src" to ${UWEBSOCKETS_WRAPPER_DIR}/uWebSockets"
file(
	RENAME
	"${UWEBSOCKETS_WRAPPER_DIR}/src"
	"${UWEBSOCKETS_WRAPPER_DIR}/uWebSockets"
)

add_library(uWebSockets INTERFACE)
target_include_directories(uWebSockets INTERFACE ${UWEBSOCKETS_WRAPPER_DIR})
target_compile_options(uWebSockets INTERFACE -Wno-deprecated-declarations)
# ----- Define uWebSockets C++ library -----

# Link Libraries
target_link_libraries(
	${PACKAGE_NAME}
	ReactAndroid::reactnative
	ReactAndroid::jsi
	fbjni::fbjni
	uWebSockets
	android
)
