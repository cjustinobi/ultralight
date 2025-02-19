import { SignableENR } from '@chainsafe/enr'
import { keys } from '@libp2p/crypto'
import { multiaddr } from '@multiformats/multiaddr'
import { PortalNetwork, NetworkId, TransportLayer, BaseNetwork } from 'portalnetwork'
import debug from 'debug'
import { DEFAULT_BOOTNODES } from 'portalnetwork/dist/util/bootnodes'
import http from 'http'
import jayson from 'jayson/promise/index.js'
import { EventEmitter } from 'eventemitter3'

const log = debug('portal-client')

export class PortalClient extends EventEmitter {
  private node?: PortalNetwork
  private historyNetwork?: BaseNetwork
  private stateNetwork?: BaseNetwork
  private enr?: SignableENR
  private rpcServer?: http.Server
  private methods: Record<string, jayson.Method> = {}

  constructor() {
    super()
    this.registerRPCMethods()
  }

  private registerRPCMethods() {
    this.methods = {
      'portal_ping': new jayson.Method(async () => 'pong'),
      
      'portal_getNetworkStatus': new jayson.Method(async () => {
        if (!this.node) {
          throw new Error('Node not initialized')
        }
        return {
          historyNetwork: !!this.historyNetwork,
          stateNetwork: !!this.stateNetwork,
          nodeId: this.node.discv5.enr.nodeId.toString()
        }
      }),
      
      'portal_bootstrapNetwork': new jayson.Method(async () => {
        await this.bootstrap()
        return { success: true }
      }),
      
      'portal_findNodes': new jayson.Method(async (nodeId: any) => {
        if (!nodeId) {
          throw new Error('Missing nodeId parameter')
        }
        
        if (!this.node) {
          throw new Error('Node not initialized')
        }
        
        const nodes = await this.node.discv5.findNode(nodeId)
        return nodes.map((node: any) => {
          return {
            nodeId: node.nodeId,
            multiaddr: node.getLocationMultiaddr('udp')?.toString(),
          }
        })
      }),
      
      'portal_sendHistoryPing': new jayson.Method(async () => {
        if (!this.historyNetwork) {
          throw new Error('History Network not initialized')
        }
        const enr = this.historyNetwork.enr.toENR()
        return await this.historyNetwork.sendPing(enr)
      }),
      
      'portal_sendStatePing': new jayson.Method(async () => {
        if (!this.stateNetwork) {
          throw new Error('State Network not initialized')
        }
        const enr = this.stateNetwork.enr.toENR()
        return await this.stateNetwork.sendPing(enr)
      }),
      
      'portal_findHistoryNodes': new jayson.Method(async (distances: any) => {
        if (!distances || !Array.isArray(distances)) {
          throw new Error('Missing distances array parameter')
        }
        
        if (!this.historyNetwork) {
          throw new Error('History Network not initialized')
        }
        
        const enr = this.historyNetwork.enr.toENR()
        return await this.historyNetwork.sendFindNodes(enr, distances)
      }),
      
      'portal_findStateNodes': new jayson.Method(async (distances: any) => {
        if (!distances || !Array.isArray(distances)) {
          throw new Error('Missing distances array parameter')
        }
        
        if (!this.stateNetwork) {
          throw new Error('State Network not initialized')
        }
        
        const enr = this.stateNetwork.enr.toENR()
        return await this.stateNetwork.sendFindNodes(enr, distances)
      }),
    }
  }

  async init(bindPort: number = 9090, rpcPort: number = 8545): Promise<void> {
    try {
      const privateKey = await keys.generateKeyPair('secp256k1')
      this.enr = SignableENR.createFromPrivateKey(privateKey)

      const nodeAddr = multiaddr(`/ip4/0.0.0.0/udp/${bindPort}`)
      this.enr.setLocationMultiaddr(nodeAddr)

      this.node = await PortalNetwork.create({
        transport: TransportLayer.NODE,
        supportedNetworks: [
          { networkId: NetworkId.HistoryNetwork },
          { networkId: NetworkId.StateNetwork },
        ],
        config: {
          enr: this.enr,
          bindAddrs: { ip4: nodeAddr },
          privateKey,
        },
        bootnodes: DEFAULT_BOOTNODES.mainnet,
      })

      this.historyNetwork = this.node.network()['0x500b']!
      this.stateNetwork = this.node.network()['0x500a']!

      // Initialize JSON-RPC server
      const server = new jayson.Server(this.methods, {
        router(method, params) {
          log(`Received ${method} with params: ${JSON.stringify(params)}`)
          return this.getMethod(method)
        }
      })
      
      this.rpcServer = server.http().listen(rpcPort, '127.0.0.1')
      log(`Started JSON RPC Server address=http://127.0.0.1:${rpcPort}`)

      await this.node.start()
      this.node.enableLog('portal-network')

      log('Portal Network initialized successfully')
      log('History Network status:', !!this.historyNetwork)
      log('State Network status:', !!this.stateNetwork)
    } catch (error) {
      console.error('Portal Network initialization failed:', error)
      throw error
    }

    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err)
    })

    process.on('SIGINT', async () => {
      await this.shutdown()
    })
  }

  async shutdown(): Promise<void> {
    console.log('Shutting down Portal Network node...')
    if (this.rpcServer?.listening) {
      await new Promise<void>((resolve) => {
        this.rpcServer?.close(() => resolve())
      })
    }
    await this.node?.stop()
  }

  async bootstrap(): Promise<void> {
    await this.node?.bootstrap()
  }

  getHistoryNetwork(): BaseNetwork | undefined {
    return this.historyNetwork
  }

  getStateNetwork(): BaseNetwork | undefined {
    return this.stateNetwork
  }

  getNode(): PortalNetwork | undefined {
    return this.node
  }
}

async function initializePortalNetwork(
  bindPort: number = 9090,
  rpcPort: number = 8545,
): Promise<PortalClient> {
  const node = new PortalClient()
  await node.init(bindPort, rpcPort)
  return node
}

async function main() {
  try {
    await initializePortalNetwork()
  } catch (error) {
    console.error('Error initializing Portal Network:', error)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Encountered an error', err)
  console.error('Shutting down...')
})