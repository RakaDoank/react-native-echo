export interface NativeRequestObject {
	headers: Record<string, string>,
	method: string,
	url: {
		pathname: string,
		search: string,
	},
	formData: (
		onResult: (data: Record<string, unknown>) => void,
	) => void,
	text: (
		onResult: (data: string) => void,
	) => void,
}
