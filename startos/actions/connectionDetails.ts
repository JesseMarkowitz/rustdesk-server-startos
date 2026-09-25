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

// The addresses a client off this server can use, applying the same
// enabled/disabled rules the Interfaces page applies to the range: loopback
// and the container bridge are dropped, a public IP counts only once the
// user has enabled it on the interface, and everything else counts unless
// the user disabled it there.
function clientHostnames(range: T.RangeBindInfo): string[] {
  const enabled = new Set(range.addresses.enabled)
  const disabled = new Set(
    range.addresses.disabled.map(([hostname, port]) => `${hostname}:${port}`),
  )
  const port = range.externalStartPort
  const usable = (h: T.HostnameInfo) => {
    const kind = h.metadata.kind
    if (kind === 'ipv4' && h.metadata.gateway === 'lxcbr0') return false
    if (kind === 'ipv4' && h.hostname === '127.0.0.1') return false
    if (kind === 'ipv4' && h.public) return enabled.has(`${h.hostname}:${port}`)
    if (kind === 'ipv4' || kind === 'mdns') return true
    if (kind === 'private-domain' || kind === 'public-domain') return true
    return false
  }
  return range.addresses.available
    .filter(usable)
    .filter((h) => !disabled.has(`${h.hostname}:${h.port ?? port}`))
    .map((h) => h.hostname)
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
    const hostnames = range ? clientHostnames(range) : []
    if (!hostnames.length) {
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
    const withPort = (port: number) =>
      hostnames.map((h) => (standardPorts ? h : `${h}:${port}`)).join('\n')

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
            type: 'single',
            name: i18n('ID server'),
            description: null,
            value: withPort(externalIdPort),
            masked: false,
            copyable: true,
            qr: false,
          },
          {
            type: 'single',
            name: i18n('Relay server'),
            description: standardPorts
              ? i18n('Optional: clients derive it from the ID server address.')
              : null,
            value: withPort(externalRelayPort),
            masked: false,
            copyable: true,
            qr: false,
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
          },
        ],
      },
    }
  },
)
