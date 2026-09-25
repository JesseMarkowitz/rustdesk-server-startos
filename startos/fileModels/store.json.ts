import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

// hbbs and hbbr are configured by flags and environment variables and keep no
// config file of their own, so the user's two settings live here and reach the
// daemons on every start.
const shape = z.object({
  // `ALWAYS_USE_RELAY=Y`: every session goes through the relay.
  alwaysUseRelay: z.boolean().catch(false),
  // `hbbs -r`: where clients should find the relay, when it is not the ID
  // server's own address on the standard relay port. Empty means derive it.
  relayServers: z.string().catch(''),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.startos, subpath: 'store.json' },
  shape,
)
