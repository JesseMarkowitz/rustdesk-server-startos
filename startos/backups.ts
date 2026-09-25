import { sdk } from './sdk'

// `main` holds the key pair, the peer database, and the relay's block lists;
// `startos` holds the package's own settings. Both are plain files, and StartOS
// stops the service before copying, so a volume copy is consistent.
export const { createBackup, restoreInit } = sdk.setupBackups(
  async ({ effects }) => sdk.Backups.ofVolumes('main', 'startos'),
)
