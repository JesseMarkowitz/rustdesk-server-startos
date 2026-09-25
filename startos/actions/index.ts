import { sdk } from '../sdk'
import { configure } from './configure'
import { connectionDetails } from './connectionDetails'

export const actions = sdk.Actions.of()
  .addAction(connectionDetails)
  .addAction(configure)
