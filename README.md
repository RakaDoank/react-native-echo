# react-native-echo

A library to embed a HTTP server in a React Native app with thread safety to handle high-volume and high-pressure requests.

> ⚠️ The library is still in development and research. I'm still playing around with this library. Read [New Research](#new-research)

See this [example](https://github.com/RakaDoank/react-native-echo/blob/main/example/src/app/index.tsx) of how to use this library.

## Features

- Built-in support for `JSON` thanks to the nature of JavaScript
- Memory optimized for `multipart/form-data` request handling support with its cached file instead of holding an array buffer
- Simple library APIs and reimplementation to the [Web APIs](https://developer.mozilla.org/en-US/docs/Web/API) as similar as possible

#### Pending
- Static file and/or directory serving
- WebSocket support for real time bidirectional communication
- ~~HTTP server for iOS & macOS support. Possibly with [Swift NIO Transport Services](https://github.com/apple/swift-nio-transport-services)~~ currently migrating to [uWebSockets](https://github.com/uNetworking/uWebSockets) which already supported iOS and macOS (and probably Windows).

## New Research
I'm still in development and research to make this library performs better in high-volume and high-pressure requests. Currently, migrating to [uWebSockets](https://github.com/uNetworking/uWebSockets) server to support cross platforms and better performance since React Native new architecture can make JavaScript side communicate back and forth with C++ through JSI with a little overhead.

## Old Research
This section is the old research that has particularly done with [Ktor](https://github.com/ktorio/ktor) server with [Netty](https://github.com/netty/netty) in Android. I will not continue this research.

`react-native-echo` was currently doing **good relatively** with the Ktor + Netty server library with really minimal error, and the `multipart/form-data` request handling is still performing good with cached files, but the performance in a Android device is becoming a question from myself, is this good or not. That's why I'm currently migrating to C++ implementation with [uWebSockets](https://github.com/uNetworking/uWebSockets) server.

I did a simple Postman runner performance test, with 20 Virtual Users run an API in parallel and repeatedly for 1 minute. I did the test with a Realme GT Master (Snapdragon 778G, 8GB RAM. It doesn't mean the library use all the power of the device, because we are limited in an Android app)

| Route                   | Description                                                                                                                                     | Total Requests | Requests/second | Avg. response time (ms) | Min response time (ms) | Max response time (ms) | P90 (ms)    | P95 (ms)   | P99 (ms)    | Error            |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | --------------- | ----------------------- | ---------------------- | ---------------------- | ----------- | ---------- | ----------- | ---------------- |
| GET /api/hello/world    | A simple route to get a simple JSON response                                                                                                    | 1077           | 15.88           | 73                      | 13                     | 523                    | 152         | 207        | 452         | 0                |
| POST /api/formdata      | I sent one string entry, and two entries of file. The server (RN side) is returning one file information in JSON response (see the example app) | 783            | 11.55           | 681                     | 82                     | 7441                   | 1343        | 1606       | 3266        | 0                |
| POST /api/json          | Sent a JSON in the body, and give the JSON back to the response (with JSON.parse from RN side)                                                  | 1053           | 15.75           | 208                     | 10                     | 6914                   | 192         | 290        | 6715        | 1 (ECONRESET)    |
> The `/api/json` avg and max time is high because of the one error. It's actually doing good as the `/api/hello/world`.
