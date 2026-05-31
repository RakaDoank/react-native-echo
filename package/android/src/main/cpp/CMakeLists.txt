project(ReactNativeEchoAndroid)

set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

if(CMAKE_ANDROID_ARCH_ABI STREQUAL "arm64-v8a" OR CMAKE_ANDROID_ARCH_ABI STREQUAL "x86_64")
	set(CMAKE_SHARED_LINKER_FLAGS "${CMAKE_SHARED_LINKER_FLAGS} -Wl,-z,max-page-size=16384")
endif()

file(
	GLOB_RECURSE
	LIB_SRCS
	RELATIVE
	${CMAKE_CURRENT_SOURCE_DIR}
	"./*.cpp"
)

add_library(
	${PROJECT_NAME}
	SHARED
	LIB_SRCS
)

target_include_directories(
	${PROJECT_NAME}
	PUBLIC
	"."
)

# Alias
add_library(
	ReactNativeEcho::android
	ALIAS
	${PROJECT_NAME}
)

# TODO
