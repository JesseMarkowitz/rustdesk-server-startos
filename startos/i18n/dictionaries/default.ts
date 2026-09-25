export const DEFAULT_LANG = 'en_US'

const dict = {
  // actions/configure.ts
  'Always use the relay': 0,
  'Send every session through the relay on this server instead of letting devices connect to each other directly. Slower; use it when direct connections fail or are unreliable.': 1,
  'Relay address': 2,
  'Leave blank: clients reach the relay at the ID server’s address on the standard relay port. Set this only if the relay is reachable somewhere else, as host or host:port, several separated by commas. Use an IP address or a public DNS name: the server drops any entry it cannot resolve when it starts, and .local names do not resolve inside it.': 3,
  'Host names or addresses, optionally with :port, separated by commas': 4,
  Configure: 5,
  'Force sessions through the relay, or tell clients where the relay lives.': 6,
  // actions/connectionDetails.ts
  'Connection Details': 7,
  'Show the ID server, relay server, and key to enter in each RustDesk client.': 8,
  'The server has not generated its key yet. Start the service, wait for the ID server to report healthy, and run this again.': 9,
  'In each RustDesk client, open Settings, Network, ID/Relay server. Enter one of the addresses below as the ID server, leave the relay server blank, and paste the key. Pick the address the client can reach from where it is.': 10,
  'In each RustDesk client, open Settings, Network, ID/Relay server. Enter the ID server and relay server with the ports shown below, and paste the key. This server was given non-standard ports, so the port is required.': 11,
  'ID server': 12,
  'Relay server': 13,
  'Optional: clients derive it from the ID server address.': 14,
  Key: 15,
  'The server’s public key. Every client must present it; there is no password.': 16,
  'No address is enabled on the RustDesk interface yet. Enable one there and run this again.': 26,
  // interfaces.ts
  RustDesk: 17,
  'The ID server and relay ports RustDesk clients connect to. Run Connection Details for what to enter in a client.': 18,
  // main.ts
  'Starting RustDesk Server!': 19,
  'ID Server': 20,
  'The ID server is accepting clients': 21,
  'The ID server is not listening yet': 22,
  'Relay Server': 23,
  'The relay is accepting sessions': 24,
  'The relay is not listening yet': 25,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
