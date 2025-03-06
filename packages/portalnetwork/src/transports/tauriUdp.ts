import mockDgram from './dgram'
import { EventEmitter } from 'events'
import { ITransportService } from '@chainsafe/discv5'
import { listen } from '@tauri-apps/api/event'
import { multiaddr as ma } from '@multiformats/multiaddr'
import { decodePacket, encodePacket } from '@chainsafe/discv5/packet'
import { getSocketAddressOnENR } from '@chainsafe/discv5'

import type { Multiaddr } from '@multiformats/multiaddr'
import type { IPacket } from '@chainsafe/discv5/packet'
import type { IPMode, IRemoteInfo, TransportEventEmitter, SocketAddress } from '@chainsafe/discv5'
import type { ENR } from '@chainsafe/enr'

export class TauriUDPTransportService 
  extends (EventEmitter as { new (): TransportEventEmitter })
  implements ITransportService 
{
  private socketId: string
  private isListening = false
  private unlisten: (() => void) | null = null

  bindAddrs: Multiaddr[] = []
  ipMode: IPMode = {
    ip4: true,
    ip6: false,
  }

  private srcId: string

  constructor(multiaddr: Multiaddr, srcId: string) {
    super()
    this.bindAddrs = [multiaddr]
    this.srcId = srcId
    this.socketId = `portal-client-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
  }

  public async start(): Promise<void> {
    if (this.isListening) return

    const opts = this.bindAddrs[0].toOptions()
    console.log('Starting UDP transport:', opts)
    const port = Number.isInteger(opts.port) ? opts.port : 9090
    const address = opts.host || '0.0.0.0'

    try {
      const socket = mockDgram.createSocket('udp4')
      socket.bind(port, address, () => {
        console.log(`UDP Transport bound to ${address}:${port}`)
      })

      this.unlisten = await listen('plugin://udp', (event) => {
        console.log('Received event:', event)
        const payload = event.payload as {
          id: string
          remoteAddress: string
          remotePort: number
          buffer: string | Uint8Array
        }
        if (payload.id === this.socketId) {
          const { remoteAddress, remotePort, buffer } = payload

          let data: Uint8Array
          if (typeof buffer === 'string') {
            data = this.base64ToUint8Array(buffer)
          } else {
            data = new Uint8Array(buffer)
          }

          this.handleIncoming(data, {
            family: 'IPv4',
            address: remoteAddress,
            port: remotePort,
            size: data.length,
          })
        }
      })

      this.isListening = true
    } catch (error) {
      console.error('Failed to start UDP transport:', error)
      throw error
    }
  }

  public async stop(): Promise<void> {
    if (!this.isListening) return

    try {
      if (this.unlisten) {
        this.unlisten()
        this.unlisten = null
      }
      this.isListening = false
    } catch (error) {
      console.error('Failed to stop UDP transport:', error)
      throw error
    }
  }

  public async send(to: Multiaddr, toId: string, packet: IPacket): Promise<void> {

    if (!this.isListening) {
      throw new Error('Transport not started')
    }

    const nodeAddr = to.toOptions()
    const encodedPacket = encodePacket(toId, packet)

    try {
      const socket = mockDgram.createSocket('udp4')
      await socket.send(encodedPacket, 0, encodedPacket.length, nodeAddr.port, nodeAddr.host)
    } catch (error) {
      console.error('Failed to send packet:', error)
      throw error
    }
  }

  private handleIncoming = (data: Uint8Array, rinfo: IRemoteInfo): void => {
    console.log('Received packet from', rinfo)
    const multiaddr = ma(
      `/${rinfo.family === 'IPv4' ? 'ip4' : 'ip6'}/${rinfo.address}/udp/${rinfo.port}`,
    )

    try {
      const packet = decodePacket(this.srcId, data)
      console.log('Decoded packet:', packet)
      this.emit('packet', multiaddr, packet)
    } catch (e) {
      this.emit('decodeError', e as any, multiaddr)
    }
  }

  public getContactableAddr(enr: ENR): SocketAddress | undefined {
    return getSocketAddressOnENR(enr, this.ipMode)
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64)
    return new Uint8Array(Array.from(binaryString).map((char) => char.charCodeAt(0)))
  }
}