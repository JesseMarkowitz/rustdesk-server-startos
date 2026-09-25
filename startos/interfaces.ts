import { i18n } from './i18n'
import { sdk } from './sdk'
import { firstPort, hostId, numberOfPorts, rangeInterfaceId } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  // One contiguous block: 21115-21117. A range binds TCP and UDP together,
  // which the ID server's port needs, and forwards the whole block by offset
  // when the user enables a public address.
  const range = await sdk.MultiHost.of(effects, hostId).bindPortRange({
    internalStartPort: firstPort,
    externalStartPort: firstPort,
    numberOfPorts,
  })
  await range.export(
    sdk.createRangeInterface(effects, {
      id: rangeInterfaceId,
      name: i18n('RustDesk'),
      description: i18n(
        'The ID server and relay ports RustDesk clients connect to. Run Connection Details for what to enter in a client.',
      ),
    }),
  )
  return []
})
