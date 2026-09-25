// hbbs (the ID/rendezvous server) and hbbr (the relay) listen on five
// consecutive ports. The package exposes the first three as one range, so TCP
// and UDP travel together and a public address, once enabled, forwards the
// whole block. The other two, 21118 (hbbs) and 21119 (hbbr), are WebSocket
// listeners that take a client's address from an unvalidated X-Real-IP header,
// so they stay unexported: upstream requires a proxy that sets it in front.
export const natTestPort = 21115 // hbbs, TCP: NAT type test
export const idServerPort = 21116 // hbbs, TCP + UDP: registration, hole punching
export const relayPort = 21117 // hbbr, TCP: relayed sessions
export const firstPort = natTestPort
export const numberOfPorts = 3

export const hostId = 'rustdesk'
export const rangeInterfaceId = 'rustdesk'

// The image's WORKDIR and HOME. Both binaries read and write their working
// directory: the key pair, the peer database, and the relay's block lists.
export const dataMountpoint = '/root'
export const publicKeyFile = 'id_ed25519.pub'

// A comma-separated list of host or host:port entries, as `hbbs -r` takes it.
export const relayServersPattern =
  '^[A-Za-z0-9.-]+(:[0-9]{1,5})?(,[A-Za-z0-9.-]+(:[0-9]{1,5})?)*$'
