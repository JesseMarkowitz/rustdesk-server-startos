// hbbs (the ID/rendezvous server) and hbbr (the relay) bind five consecutive
// ports. The package binds them as one range so TCP and UDP travel together
// and a public address, once enabled, forwards the whole block.
export const natTestPort = 21115 // hbbs, TCP: NAT type test
export const idServerPort = 21116 // hbbs, TCP + UDP: registration, hole punching
export const relayPort = 21117 // hbbr, TCP: relayed sessions
export const idServerWsPort = 21118 // hbbs, TCP: WebSocket for the browser client
export const relayWsPort = 21119 // hbbr, TCP: WebSocket relay for the browser client
export const firstPort = natTestPort
export const numberOfPorts = 5

export const hostId = 'rustdesk'
export const rangeInterfaceId = 'rustdesk'

// The image's WORKDIR and HOME. Both binaries read and write their working
// directory: the key pair, the peer database, and the relay's block lists.
export const dataMountpoint = '/root'
export const publicKeyFile = 'id_ed25519.pub'

// A comma-separated list of host or host:port entries, as `hbbs -r` takes it.
export const relayServersPattern =
  '^[A-Za-z0-9.-]+(:[0-9]{1,5})?(,[A-Za-z0-9.-]+(:[0-9]{1,5})?)*$'
