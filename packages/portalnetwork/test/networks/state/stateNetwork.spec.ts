import { SignableENR } from '@chainsafe/enr'
import { keys } from '@libp2p/crypto'
import { describe, expect, it } from 'vitest'

import { NetworkId, createPortalNetwork } from '../../../src/index.js'

import type { StateNetwork } from '../../../src/index.js'

describe('StateNetwork', async () => {
  const pk = await keys.generateKeyPair('secp256k1')
  const enr1 = SignableENR.createFromPrivateKey(pk)
  const ultralight = await createPortalNetwork({
    bindAddress: '127.0.0.1',
    config: {
      enr: enr1,
      privateKey: pk,
    },
    supportedNetworks: [{ networkId: NetworkId.StateNetwork }],
  })
  const stateNetwork = ultralight.networks.get(NetworkId.StateNetwork) as StateNetwork
  it('should start with state network', () => {
    expect(stateNetwork).toBeDefined()
  })
})
