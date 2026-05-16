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

	CarbonStyleSheet.use()

	useEffect(() => {
		const server = new Echo.Http.Server()

		server.get(
			"/api/hello/world",
			() => {
				return Echo.Http.Response.json(
					{
						string: "Hello World",
						number: Math.random(),
						boolean: false,
						array: [
							{
								message: "Ich komme aus Osterreich",
								null: null,
							},
							{
								number: -1,
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

		server.post(
			"/api/json",
			async request => {
				try {
					const json = await request.json() as unknown as Record<string, string>
					return Echo.Http.Response.json(
						{
							foo: "bar",
							data: json,
						},
					)
				} catch(err) {
					return Echo.Http.Response.json(
						{
							foo: null,
							data: null,
							error: err instanceof Error ? {
								message: err.message,
							} : undefined,
						},
					)
				}
			},
		)

		server.post(
			"/api/formdata",
			async request => {
				try {
					const formData = await request.formData()
					return Echo.Http.Response.json(
						{
							yeay: true,
							file: formData.get("file1"),
						},
					)
				} catch(err) {
					return Echo.Http.Response.json(
						{
							yeay: false,
							error: err instanceof Error ? {
								message: err.message,
							} : undefined,
						},
					)
				}
			},
		)

		server.listen(
			4040,
			function() {
				console.log("onListened")
			},
		)

		return () => {
			server.close()
		}
	}, [])

	return (
		<View
			style={ [
				CarbonStyleSheet.g.py_09,
				CarbonStyleSheet.g.px_05,
			] }
		>
			<Text
				style={ [
					carbonStyleSheet.text,
				] }
			>
				Hit the server
			</Text>
		</View>
	)

}

const
	carbonStyleSheet =
		CarbonStyleSheet.create({
			text: {
				color: CarbonStyleSheet.color.text_primary,
			},
		})
