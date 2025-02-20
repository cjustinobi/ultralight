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
  private isRunning: boolean = false

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
      'eth_getBlockByHash': this.handleEthGetBlockByHash.bind(this),
      'eth_getBlockByNumber': this.handleEthGetBlockByNumber.bind(this),
    }
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.bind(this.udpPort, this.bindAddress, () => {
        this.isRunning = true
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

  
    } catch (error) {
      console.error('Error handling message:', error)
      const errorResponse = {
        error: error instanceof Error ? error.message : 'Unknown error',
        id: null,
      }
      throw new Error(JSON.stringify(errorResponse))
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

  private async handleEthGetBlockByHash(params: any[]): Promise<any> {
    console.log('here inside handler ...')
    if (!params || !params[0]) {
      throw new Error('Missing Block Hash parameter')
    }
    
    if (!this.portal) {
      throw new Error('Node not initialized')
    }
    const nodes = await this.portal.ETH.getBlockByHash(params[0], false)
    return nodes
  }

  private async handleEthGetBlockByNumber(params: any[]): Promise<any> {
    console.log('here inside handler ...', params)
    if (!params || !params[0]) {
      throw new Error('Missing Block Number parameter')
    }
    
    if (!this.portal) {
      throw new Error('Node not initialized')
    }
    const nodes = await this.portal.ETH.getBlockByNumber(params[0], false)
    return nodes
  }

  async stop(): Promise<void> {
  return new Promise<void>((resolve) => {
    if (!this.isRunning) {
      resolve()
      return
    }

    const onClose = () => {
      this.isRunning = false
      resolve()
    }

    // If the socket is already closed, resolve immediately
    if (!this.isRunning) {
      onClose()
      return
    }

    this.socket.once('close', onClose) // Ensure 'close' fires once

    try {
      this.socket.close()
      this.socket.unref() // Allows Node.js to exit if nothing else is running
    } catch (err) {
      console.warn('Error while closing UDP socket:', err)
      onClose() // Ensure we resolve even if an error occurs
    }
  })
}


  //  async stop(): Promise<void> {
  //   return new Promise<void>((resolve) => {
  //     if (!this.isRunning) {
  //       resolve()
  //       return
  //     }

  //     const onClose = () => {
  //       this.isRunning = false
  //       this.socket.removeListener('close', onClose)
  //       resolve()
  //     }

  //     this.socket.on('close', onClose)

  //     try {
  //       this.socket.close()
  //     } catch (err) {
  //       console.warn('Error while closing UDP socket:', err)
  //       this.isRunning = false
  //       resolve()
  //     }
  //   })
  // }
}