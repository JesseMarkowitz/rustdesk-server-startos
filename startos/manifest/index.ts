import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'rustdesk-server',
  title: 'RustDesk Server',
  license: 'AGPL-3.0',
  packageRepo: 'https://github.com/JesseMarkowitz/rustdesk-server-startos',
  upstreamRepo: 'https://github.com/rustdesk/rustdesk-server',
  marketingUrl: 'https://rustdesk.com/',
  donationUrl: null,
  description: { short, long },
  volumes: ['main', 'startos'],
  images: {
    // Upstream's "classic" image (hbbs and hbbr on a scratch base, no shell)
    // plus a CMD, which the pack step needs; see ./Dockerfile for the pin.
    'rustdesk-server': {
      source: { dockerBuild: {} },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {},
})
