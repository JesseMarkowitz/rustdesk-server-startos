import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { dataMountpoint, idServerPort, relayPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting RustDesk Server!'))

  const alwaysUseRelay =
    (await storeJson.read((s) => s.alwaysUseRelay).const(effects)) ?? false
  const relayServers =
    (await storeJson.read((s) => s.relayServers).const(effects)) ?? ''

  // Both binaries work out of the same directory: hbbs writes the key pair
  // there and hbbr loads it, so the relay validates the same key.
  const dataMounts = sdk.Mounts.of().mountVolume({
    volumeId: 'main',
    subpath: null,
    mountpoint: dataMountpoint,
    readonly: false,
  })

  return sdk.Daemons.of(effects)
    .addDaemon('hbbs', {
      subcontainer: sdk.SubContainer.of(
        effects,
        { imageId: 'rustdesk-server' },
        dataMounts,
        'hbbs',
      ),
      exec: {
        // `-k` defaults to `-`: load the key pair from the working directory,
        // generating it on first start.
        command: ['hbbs', ...(relayServers ? ['-r', relayServers] : [])],
        cwd: dataMountpoint,
        env: {
          ALWAYS_USE_RELAY: alwaysUseRelay ? 'Y' : 'N',
          RUST_LOG: 'info',
        },
      },
      ready: {
        display: i18n('ID Server'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, idServerPort, {
            successMessage: i18n('The ID server is accepting clients'),
            errorMessage: i18n('The ID server is not listening yet'),
          }),
      },
      requires: [],
    })
    .addDaemon('hbbr', {
      subcontainer: sdk.SubContainer.of(
        effects,
        { imageId: 'rustdesk-server' },
        dataMounts,
        'hbbr',
      ),
      exec: {
        // `-k -` makes the relay require the same key as the ID server. It
        // starts after hbbs so the key pair already exists.
        command: ['hbbr', '-k', '-'],
        cwd: dataMountpoint,
        env: { RUST_LOG: 'info' },
      },
      ready: {
        display: i18n('Relay Server'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, relayPort, {
            successMessage: i18n('The relay is accepting sessions'),
            errorMessage: i18n('The relay is not listening yet'),
          }),
      },
      requires: ['hbbs'],
    })
})
