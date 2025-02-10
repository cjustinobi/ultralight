import { UltralightProvider, TransportLayer, NetworkId } from 'portalnetwork'
import { SignableENR } from '@chainsafe/enr'

export class TauriPortalClient {
  private provider!: UltralightProvider
  private enr?: SignableENR

  async initialize(port = 9090) {
    try {
      const { keys } = await import('@libp2p/crypto')
      const { multiaddr } = await import('@multiformats/multiaddr')

      const keyPair = await keys.generateKeyPair('secp256k1', 256)
      const nodeAddr = multiaddr(`/ip4/0.0.0.0/udp/${port}`)

      this.provider = await UltralightProvider.create({
        transport: TransportLayer.NODE,
        supportedNetworks: [
          { networkId: NetworkId.HistoryNetwork },
          { networkId: NetworkId.StateNetwork }
        ],
        config: {
          enr: this.enr,
          bindAddrs: { ip4: nodeAddr },
          privateKey: keyPair
        }
      })
    } catch (error) {
      console.error('Failed to initialize Portal client:', error)
      throw new Error(
        `Portal client initialization failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  async getBalance(address: string, block: string = 'latest'): Promise<string> {
    try {
      const balance = await this.provider.request({
        method: 'eth_getBalance',
        params: [address, block],
      })
      return balance as string
    } catch (error) {
      console.error('Failed to get balance:', error)
      throw new Error(
        `Failed to get balance: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  async getBlockByNumber(
    blockNumber: string | number,
    includeTx: boolean = false
  ) {
    try {
      return await this.provider.request({
        method: 'eth_getBlockByNumber',
        params: [blockNumber, includeTx],
      })
    } catch (error) {
      console.error('Failed to get block:', error)
      throw new Error(
        `Failed to get block: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }
}