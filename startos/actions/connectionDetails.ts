import { FileHelper, T } from '@start9labs/start-sdk'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import {
  firstPort,
  hostId,
  idServerPort,
  publicKeyFile,
  relayPort,
} from '../utils'

// Where a client reaches the server from, so the action can name each address
// by what it is instead of numbering them. Derived from the hostname's kind,
// its public flag, and whether its gateway is a WireGuard tunnel: StartOS
// names every tunnel gateway `wg<n>` (start-core, net/tunnel.rs), while a LAN
// gateway keeps its kernel name (`eth0`, `enp2s0`, `wlan0`).
type Reach =
  | 'lan'
  | 'mdns'
  | 'tunnel'
  | 'tunnel-public'
  | 'router-public'
  | 'public-domain'
  | 'private-domain'

type ClientAddress = { hostname: string; reach: Reach; gateway: string }

const reachOrder: Record<Reach, number> = {
  lan: 0,
  mdns: 1,
  tunnel: 2,
  'tunnel-public': 3,
  'router-public': 4,
  'public-domain': 5,
  'private-domain': 6,
}

const isTunnelGateway = (gateway: string) => /^wg\d+$/.test(gateway)

// The addresses a client off this server can use, applying the same
// enabled/disabled rules the Interfaces page applies to the range: loopback
// and the container bridge are dropped, a public IP counts only once the
// user has enabled it on the interface, and everything else counts unless
// the user disabled it there. IPv6 never appears (a range is IPv4-only) and
// a plugin address such as Tor is dropped: the ID server needs UDP.
function clientAddresses(range: T.RangeBindInfo): ClientAddress[] {
  const enabled = new Set(range.addresses.enabled)
  const disabled = new Set(
    range.addresses.disabled.map(([hostname, port]) => `${hostname}:${port}`),
  )
  const port = range.externalStartPort
  const classify = (h: T.HostnameInfo): ClientAddress | null => {
    const { hostname } = h
    const m = h.metadata
    switch (m.kind) {
      case 'ipv4': {
        if (m.gateway === 'lxcbr0' || m.gateway === 'lo') return null
        if (hostname === '127.0.0.1') return null
        const tunnel = isTunnelGateway(m.gateway)
        if (h.public) {
          if (!enabled.has(`${hostname}:${port}`)) return null
          return {
            hostname,
            reach: tunnel ? 'tunnel-public' : 'router-public',
            gateway: m.gateway,
          }
        }
        return {
          hostname,
          reach: tunnel ? 'tunnel' : 'lan',
          gateway: m.gateway,
        }
      }
      case 'mdns':
        return { hostname, reach: 'mdns', gateway: m.gateways.join(', ') }
      case 'private-domain':
        return {
          hostname,
          reach: 'private-domain',
          gateway: m.gateways.join(', '),
        }
      case 'public-domain':
        return { hostname, reach: 'public-domain', gateway: m.gateway }
      default:
        return null
    }
  }
  return range.addresses.available
    .filter((h) => !disabled.has(`${h.hostname}:${h.port ?? port}`))
    .map(classify)
    .filter((a): a is ClientAddress => a !== null)
    .sort((a, b) => reachOrder[a.reach] - reachOrder[b.reach])
}

// The field name and the one-line explanation shown under each address.
function describe({ reach, gateway }: ClientAddress): {
  name: string
  description: string
} {
  switch (reach) {
    case 'lan':
      return {
        name: i18n('LAN IPv4'),
        description: i18n(
          'This server’s address on your local network, on ${gateway}. Use it from devices on that network.',
          { gateway },
        ),
      }
    case 'mdns':
      return {
        name: i18n('Local name'),
        description: i18n(
          'This server’s .local name, on ${gateway}. Use it from devices on those networks that can resolve .local names.',
          { gateway },
        ),
      }
    case 'tunnel':
      return {
        name: i18n('Tunnel IPv4'),
        description: i18n(
          'This server’s address inside the WireGuard tunnel on ${gateway}. Use it only from devices connected to that tunnel.',
          { gateway },
        ),
      }
    case 'tunnel-public':
      return {
        name: i18n('Public IPv4 via tunnel'),
        description: i18n(
          'The public address of the tunnel server on ${gateway}. Use it from anywhere on the internet.',
          { gateway },
        ),
      }
    case 'router-public':
      return {
        name: i18n('Public IPv4 via router'),
        description: i18n(
          'Your router’s public address, on ${gateway}. Use it from the internet once the router forwards the RustDesk ports to this server.',
          { gateway },
        ),
      }
    case 'public-domain':
      return {
        name: i18n('Domain'),
        description: i18n(
          'A public name for this server, on ${gateway}. Use it from anywhere the name resolves.',
          { gateway },
        ),
      }
    case 'private-domain':
      return {
        name: i18n('Private domain'),
        description: i18n(
          'A private name for this server, on ${gateway}. Use it from networks where that name resolves.',
          { gateway },
        ),
      }
  }
}

export const connectionDetails = sdk.Action.withoutInput(
  'connection-details',

  async ({ effects }) => ({
    name: i18n('Connection Details'),
    description: i18n(
      'Show the ID server, relay server, and key to enter in each RustDesk client.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    // Written by hbbs on its first start, next to the peer database.
    const key = (
      (await FileHelper.string({
        base: sdk.volumes.main,
        subpath: publicKeyFile,
      })
        .read()
        .once()) ?? ''
    ).trim()
    if (!key) {
      throw new Error(
        i18n(
          'The server has not generated its key yet. Start the service, wait for the ID server to report healthy, and run this again.',
        ),
      )
    }

    const host = await sdk.host.getOwn(effects, hostId).once()
    const range = host?.bindingRanges[firstPort]
    const addresses = range ? clientAddresses(range) : []
    if (!addresses.length) {
      throw new Error(
        i18n(
          'No address is enabled on the RustDesk interface yet. Enable one there and run this again.',
        ),
      )
    }
    const externalIdPort =
      (range?.externalStartPort ?? firstPort) + (idServerPort - firstPort)
    const externalRelayPort =
      (range?.externalStartPort ?? firstPort) + (relayPort - firstPort)
    const standardPorts = externalIdPort === idServerPort
    const perAddress = (port: number) =>
      addresses.map((a) => ({
        type: 'single' as const,
        ...describe(a),
        value: standardPorts ? a.hostname : `${a.hostname}:${port}`,
        masked: false,
        copyable: true,
        qr: false,
        launchable: false,
      }))

    return {
      version: '1',
      title: i18n('Connection Details'),
      message: standardPorts
        ? i18n(
            'In each RustDesk client, open Settings, Network, ID/Relay server. Enter one of the addresses below as the ID server, leave the relay server blank, and paste the key. Pick the address the client can reach from where it is.',
          )
        : i18n(
            'In each RustDesk client, open Settings, Network, ID/Relay server. Enter the ID server and relay server with the ports shown below, and paste the key. This server was given non-standard ports, so the port is required.',
          ),
      result: {
        type: 'group',
        value: [
          {
            type: 'group',
            name: i18n('ID server'),
            description: null,
            value: perAddress(externalIdPort),
          },
          {
            type: 'group',
            name: i18n('Relay server'),
            description: standardPorts
              ? i18n('Optional: clients derive it from the ID server address.')
              : null,
            value: perAddress(externalRelayPort),
          },
          {
            type: 'single',
            name: i18n('Key'),
            description: i18n(
              'The server’s public key. Every client must present it; there is no password.',
            ),
            value: key,
            masked: false,
            copyable: true,
            qr: true,
            launchable: false,
          },
        ],
      },
    }
  },
)
