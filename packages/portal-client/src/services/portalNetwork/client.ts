import { SignableENR } from '@chainsafe/enr'
import { keys } from '@libp2p/crypto'
import { multiaddr } from '@multiformats/multiaddr'
import { NetworkId, PortalNetwork, TransportLayer } from 'portalnetwork'
import { DEFAULT_BOOTNODES } from 'portalnetwork/dist/util/bootnodes'

export async function createPortalClient(port = 9090) {
  const nodeAddr = multiaddr(`/ip4/0.0.0.0/udp/${port}`)
  console.log('Node address:', nodeAddr.toString())

  const privateKey = await keys.generateKeyPair('secp256k1')
  const enr = SignableENR.createFromPrivateKey(privateKey)

  enr.setLocationMultiaddr(nodeAddr)

  const node = await PortalNetwork.create({
    transport: TransportLayer.MOBILE,
    supportedNetworks: [
      { networkId: NetworkId.HistoryNetwork },
      { networkId: NetworkId.StateNetwork },
    ],
    config: {
      enr,
      bindAddrs: { ip4: nodeAddr },
      privateKey,
    },
    bootnodes: DEFAULT_BOOTNODES.mainnet,
  })

  await node.start()
  console.log('Node after start:', node)
  return node
}
