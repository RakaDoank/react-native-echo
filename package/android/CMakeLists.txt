project(ReactNativeEcho)
cmake_minimum_required(VERSION 3.14.0)

include(FetchContent)

set(PACKAGE_NAME "react-native-echo") # this is also used by react-native.config.js
set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(LIB_ANDROID_DIR ${CMAKE_CURRENT_SOURCE_DIR})
set(LIB_CODEGEN_SPEC_NAME "ReactNativeEchoSpecs")
set(LIB_ANDROID_GENERATED_JNI_DIR ${LIB_ANDROID_DIR}/build/generated/source/codegen/jni)

# message("CMAKE echo LIB_ANDROID_DIR = ${LIB_ANDROID_DIR}")
# message("CMAKE echo LIB_ANDROID_GENERATED_JNI_DIR = ${LIB_ANDROID_GENERATED_JNI_DIR}")

find_package(ReactAndroid REQUIRED CONFIG)
find_package(fbjni REQUIRED CONFIG)

file(
	GLOB_RECURSE
	LIB_SHARED_SRCS
	RELATIVE
	${CMAKE_CURRENT_SOURCE_DIR}
	"../cpp/*.cpp"
	"../cpp/http/*.cpp"
)
# It's useful later to call cpp to Java/Kotlin
# file(GLOB_RECURSE LIB_ANDROID_SRCS RELATIVE ${CMAKE_SOURCE_DIR} "src/main/cpp/*.cpp")
file(
	GLOB
	LIB_ANDROID_SRCS
	RELATIVE
	${LIB_ANDROID_DIR}
	"src/main/cpp/*.cpp"
)

# Codegen source files
file(
	GLOB_RECURSE
	LIB_CODEGEN_SRCS
	CONFIGURE_DEPENDS
	${LIB_ANDROID_GENERATED_JNI_DIR}/*.cpp
	${LIB_ANDROID_GENERATED_JNI_DIR}/**/*.cpp
)

add_library(
	${PACKAGE_NAME}
	SHARED
	${LIB_SHARED_SRCS}
	${LIB_ANDROID_SRCS}
	${LIB_CODEGEN_SRCS}
)

target_include_directories(
	${PACKAGE_NAME}
	PUBLIC
	"src/main/cpp"
	"../cpp"
	"../cpp/http"
	${LIB_ANDROID_GENERATED_JNI_DIR}
	"${LIB_ANDROID_GENERATED_JNI_DIR}/react/renderer/components/${LIB_CODEGEN_SPEC_NAME}"
)

# include generated Android JNI codegen
# target_include_directories(
# 	${PACKAGE_NAME}
# 	PUBLIC
# 	"build/generated/source/codegen/jni"
# )

# target_include_directories(
# 	${PACKAGE_NAME}
# 	PRIVATE
# 	"../cpp/http"
# )

# +++++ uWebSockets C++ library +++++
# Thanks to https://github.com/tony-go/cmake-uwebsockets/blob/main/CMakeLists.txt
FetchContent_Declare(
	rnecho_usockets_content
	GIT_REPOSITORY https://github.com/uNetworking/uSockets
	GIT_TAG v0.8.8
	GIT_SHALLOW ON
	GIT_SUBMODULES ""
)
FetchContent_MakeAvailable(rnecho_usockets_content)

file(GLOB_RECURSE SOURCES ${rnecho_usockets_content_SOURCE_DIR}/src/*.c)
add_library(
	uSockets
	${SOURCES}
)
target_include_directories(uSockets PUBLIC "${rnecho_usockets_content_SOURCE_DIR}/src")
target_compile_definitions(uSockets PRIVATE LIBUS_NO_SSL)

FetchContent_Declare(
	rnecho_uwebsockets_content
	GIT_REPOSITORY https://github.com/uNetworking/uWebSockets
	GIT_TAG v20.37.0
	GIT_SHALLOW ON
	GIT_SUBMODULES ""
)
FetchContent_MakeAvailable(rnecho_uwebsockets_content)
find_package(ZLIB REQUIRED)

# Create a folder to include the uWebSockets library with a scoped path
# like `#include "uWebSockets/App.h"

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
# Result from "${CMAKE_BINARY_DIR}/uwebsockets_copy/src" to "${CMAKE_BINARY_DIR}/uwebsockets_copy/uWebSockets"
file(
	RENAME
	"${UWEBSOCKETS_WRAPPER_DIR}/src"
	"${UWEBSOCKETS_WRAPPER_DIR}/uWebSockets"
)

add_library(uWebSockets INTERFACE)
target_include_directories(uWebSockets INTERFACE ${UWEBSOCKETS_WRAPPER_DIR})
target_link_libraries(uWebSockets INTERFACE uSockets ${ZLIB_LIBRARIES})
target_compile_options(uWebSockets INTERFACE -Wno-deprecated-declarations)
# ----- uWebSockets C++ library -----

if(CMAKE_ANDROID_ARCH_ABI STREQUAL "arm64-v8a" OR CMAKE_ANDROID_ARCH_ABI STREQUAL "x86_64")
	set(CMAKE_SHARED_LINKER_FLAGS "${CMAKE_SHARED_LINKER_FLAGS} -Wl,-z,max-page-size=16384")
endif()

# Link Libraries
target_link_libraries(
	${PACKAGE_NAME}
	ReactAndroid::reactnative
	ReactAndroid::jsi
	fbjni::fbjni
	folly
	uWebSockets
	react_codegen_ReactNativeEchoSpecs
	android
	log
)
