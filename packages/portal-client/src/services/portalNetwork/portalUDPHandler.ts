import { createSocket, Socket } from 'dgram'
import { EventEmitter } from 'eventemitter3'
import { PortalNetwork } from 'portalnetwork'
import { MAX_PACKET_SIZE } from '../../utils/constants'

type RPCMethodHandler = (params: any[]) => Promise<any>
type RPCMethodRegistry = Record<string, RPCMethodHandler>

export class PortalUDPHandler extends EventEmitter {
  emit(event: string | symbol, ...args: any[]): boolean {
    return super.emit(event, ...args)
  }
  private socket: Socket
  private portal: PortalNetwork
  private bindAddress: string
  private udpPort: number
  private rpcMethodRegistry: RPCMethodRegistry = {}

  constructor(portal: PortalNetwork, bindAddress: string, udpPort: number) {
    super()
    this.portal = portal
    this.bindAddress = bindAddress
    this.udpPort = udpPort
    this.socket = createSocket({
      recvBufferSize: 16 * MAX_PACKET_SIZE,
      sendBufferSize: MAX_PACKET_SIZE,
      type: 'udp4',
    })
    this.registerRPCMethods()
    this.socket.on('message', this.handleMessage.bind(this))
    this.socket.on('error', (error: Error) => {
      console.error('UDP Socket Error:', error)
      this.emit('error', error)
    })
  }

  private registerRPCMethods() {
    this.rpcMethodRegistry = {
      'portal_ping': this.handlePing.bind(this),
      'portal_findNodes': this.handleFindNodes.bind(this),
    }
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.bind(this.udpPort, this.bindAddress, () => {
        console.log(`UDP Server listening on ${this.bindAddress}:${this.udpPort}`)
        resolve()
      })
      this.socket.on('error', reject)
    })
  }

  private async handleMessage(msg: any, rinfo: any) {
    try {
      const request = JSON.parse(msg.toString())
      console.log(`Received request from ${rinfo.address}:${rinfo.port}:`, request)

      if (!request.method) {
        throw new Error('Invalid request format - missing method')
      }
      let response

      if (this.rpcMethodRegistry[request.method]) {
        try {
          const result = await this.rpcMethodRegistry[request.method](request.params || [])
          response = {
            jsonrpc: '2.0',
            result,
            id: request.id
          }
        } catch (err) {
          response = {
            jsonrpc: '2.0',
            error: {
              code: -32000,
              message: err instanceof Error ? err.message : 'Unknown error'
            },
            id: request.id
          }
        }
      } else {
        response = {
          jsonrpc: '2.0',
          error: {
            code: -32601,
            message: `Method not found: ${request.method}`
          },
          id: request.id
        }
      }
      
      console.log('Response (before serialization):', response)

      const serializedResponse = JSON.stringify(response, (_, value) => {
        if (typeof value === 'bigint') return value.toString()
        return value
      })

      this.socket.send(serializedResponse, rinfo.port, rinfo.address, (error: Error | null) => {
        if (error) {
          console.error('Error sending response:', error)
        }
      })
    } catch (error) {
      console.error('Error handling message:', error)
      const errorResponse = {
        error: error instanceof Error ? error.message : 'Unknown error',
        id: null,
      }

      const serializedError = JSON.stringify(errorResponse, (_, value) => {
        if (typeof value === 'bigint') return value.toString()
        return value
      })

      this.socket.send(serializedError, rinfo.port, rinfo.address)
    }
  }

   private async handlePing(): Promise<any> {
    return 'pong'
  }

  private async handleFindNodes(params: any[]): Promise<any> {
    if (!params || !params[0]) {
      throw new Error('Missing nodeId parameter')
    }
    
    if (!this.portal) {
      throw new Error('Node not initialized')
    }

    const nodes = await this.portal.discv5.findNode(params[0])
    return nodes.map((node: any) => {
      console.log(node)
      return {
        nodeId: node.nodeId,
        multiaddr: node.getLocationMultiaddr('udp')?.toString(),
      }
    })
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.socket.close(() => resolve())
    })
  }
}