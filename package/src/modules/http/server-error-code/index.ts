/**
 * Illegal port number expression.
 * 
 * TCP/IP port numbers are constrained to a 16-bit unsigned integer range, allowing values from 0 to 65535
 */
export const ILLEGAL_PORT = "ILLEGAL_PORT"

/**
 * Somehow the `serverID` from the `Server` instance member is changed,
 * or native side didn't send correct string of `serverID`
 */
export const UNMATCHED_SERVER_ID = "UNMATCHED_SERVER_ID"
