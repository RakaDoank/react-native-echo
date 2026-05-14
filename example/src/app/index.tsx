import {
	useEffect,
} from "react"

import {
	View,
} from "react-native"

import {
	CarbonStyleSheet,
	Text,
} from "@audira/carbon-react-native"

import * as Echo from "react-native-echo"

export default function Page() {

	useEffect(() => {
		const server = new Echo.Http.Server()

		server.get(
			"/api/get",
			request => {
				console.log(request.url.pathname)
				return Echo.Http.Response.json(
					{
						foo: "bar",
						hello: "world",
					},
					{
						status: 200,
					},
				)
			},
		)

		server.get(
			"/api/hello/world",
			request => {
				console.log(request.url.pathname)
				return Echo.Http.Response.json(
					{
						string: "Hello World",
						number: -1,
						boolean: true,
						array: [
							{
								message: "Ich komme aus Deutschland",
								null: null,
							},
							{
								number: 99,
								boolean: true,
							},
						],
						null: null,
						undefined: undefined,
					},
				)
			},
		)

		server.get(
			"/api/nocontent",
			request => {
				console.log(request.url.pathname)
				return new Echo.Http.Response(null)
			},
		)

		server.listen(
			4040,
			function() {
				console.log("onListened")
			},
		)

		// return () => {
		// 	server.close()
		// }
	}, [])

	return (
		<View
			style={ [
				CarbonStyleSheet.g.py_09,
				CarbonStyleSheet.g.px_05,
			] }
		>
			<Text>
				Minimize this app, and hit the server
			</Text>
		</View>
	)

}
