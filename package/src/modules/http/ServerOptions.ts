export interface ServerOptions {
	/**
	 * Set a timeout in milliseconds for all route handlers.
	 * This is required for the native to set route execution time limit.
	 * Default is `180_000` (3 minutes).
	 * 
	 * If you want to set a timeout for a specific route,
	 * alternatively, you can make this native timeout option longer,
	 * and use your own timeout shorter with `setTimeout`.
	 * 
	 * @default 180000
	 */
	routeHandlerTimeout?: number,
}
