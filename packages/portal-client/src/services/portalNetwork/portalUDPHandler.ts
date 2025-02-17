import { createSocket, Socket } from 'dgram'
import { EventEmitter } from 'events'
import { PortalNetwork } from 'portalnetwork'

export class PortalUDPHandler extends EventEmitter {
  emit(event: string | symbol, ...args: any[]): boolean {
    return super.emit(event, ...args)
  }
  private socket: Socket
  private portal: PortalNetwork
  private bindAddress: string
  private udpPort: number

  constructor(portal: PortalNetwork, bindAddress: string, udpPort: number) {
    super()
    this.portal = portal
    this.bindAddress = bindAddress
    this.udpPort = udpPort
    this.socket = createSocket('udp4')

    this.socket.on('message', this.handleMessage.bind(this))
    this.socket.on('error', (error: Error) => {
      console.error('UDP Socket Error:', error)
      this.emit('error', error)
    })
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
    // private async handleMessage(msg: Buffer, rinfo: any) {
    try {
      const request = JSON.parse(msg.toString())
      console.log(`Received request from ${rinfo.address}:${rinfo.port}:`, request)

      if (!request.method) {
        throw new Error('Invalid request format - missing method')
      }

      let response
      switch (request.method) {
        case 'portal_ping':
          response = { result: 'pong', id: request.id }
          break

        case 'portal_findNodes':
          try {
            const nodes = await this.portal.discv5.findNode(request.params[0])
            const processedNodes = nodes.map((node: any) => {
              return {
                nodeId: node.nodeId,
                multiaddr: node.getLocationMultiaddr('udp')?.toString(),
              }
            })
            response = { result: processedNodes, id: request.id }
          } catch (err) {
            console.error('Error in findNode:', err)
            response = {
              error: `FindNode operation failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
              id: request.id,
            }
          }
          break

        default:
          response = {
            error: `Unknown method: ${request.method}`,
            id: request.id,
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

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.socket.close(() => resolve())
    })
  }
}
