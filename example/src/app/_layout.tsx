import {
	Stack,
} from "expo-router"

import {
	CarbonReactNative,
} from "@audira/carbon-react-native"

export default function Layout() {

	return (
		<CarbonReactNative>
			<Stack
				screenOptions={{
					headerShown: false,
				}}
			/>
		</CarbonReactNative>
	)

}
