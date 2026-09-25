import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { relayServersPattern } from '../utils'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  alwaysUseRelay: Value.toggle({
    name: i18n('Always use the relay'),
    description: i18n(
      'Send every session through the relay on this server instead of letting devices connect to each other directly. Slower; use it when direct connections fail or are unreliable.',
    ),
    default: false,
  }),
  relayServers: Value.text({
    name: i18n('Relay address'),
    description: i18n(
      'Leave blank: clients reach the relay at the ID server’s address on the standard relay port. Set this only if the relay is reachable somewhere else, as host or host:port, several separated by commas. Use an IP address or a public DNS name: the server drops any entry it cannot resolve when it starts, and .local names do not resolve inside it.',
    ),
    required: false,
    default: null,
    placeholder: 'relay.example.com:21117',
    patterns: [
      {
        regex: relayServersPattern,
        description: i18n(
          'Host names or addresses, optionally with :port, separated by commas',
        ),
      },
    ],
  }),
})

export const configure = sdk.Action.withInput(
  'configure',

  async ({ effects }) => ({
    name: i18n('Configure'),
    description: i18n(
      'Force sessions through the relay, or tell clients where the relay lives.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => {
    const store = await storeJson.read().once()
    return {
      alwaysUseRelay: store?.alwaysUseRelay,
      relayServers: store?.relayServers || undefined,
    }
  },

  async ({ effects, input }) => {
    await storeJson.merge(effects, {
      alwaysUseRelay: input.alwaysUseRelay,
      relayServers: input.relayServers?.trim() ?? '',
    })
  },
)
