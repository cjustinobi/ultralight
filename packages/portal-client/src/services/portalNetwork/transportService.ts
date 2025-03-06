import { EventEmitter } from 'events'
import { ITransportService } from '@chainsafe/discv5'
import { listen } from '@tauri-apps/api/event'
import { multiaddr as ma } from '@multiformats/multiaddr'
import { decodePacket, encodePacket } from '@chainsafe/discv5/packet'
import { getSocketAddressOnENR } from '@chainsafe/discv5'
import mockDgram from '@/utils/polyfills/dgram'

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
  private socket: any = null
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
    console.log('[UDP Transport] Starting:', opts)
    const port = Number.isInteger(opts.port) ? opts.port : 9090
    const address = opts.host || '0.0.0.0'

    try {
      this.socket = mockDgram.createSocket('udp4')

      this.unlisten = await listen('udp://message', (event) => {
        console.log('[UDP Transport] Received event:', event)
        const { id, address, port, data } = event.payload as {
          id: string
          address: string
          port: number
          data: string
        }

        if (id === this.socketId) {
          const buffer = this.base64ToUint8Array(data)
          
          this.handleIncoming(buffer, {
            family: 'IPv4',
            address: address,
            port: port,
            size: buffer.length,
          })
        }
      })

      this.socket.bind(port, address, () => {
        console.log(`[UDP Transport] Successfully bound to ${address}:${port}`)
        this.isListening = true
      })
    } catch (error) {
      console.error('[UDP Transport] Failed to start:', error)
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
      
      if (this.socket) {
        this.socket.close()
        this.socket = null
      }
      
      this.isListening = false
      console.log('[UDP Transport] Stopped')
    } catch (error) {
      console.error('[UDP Transport] Failed to stop:', error)
      throw error
    }
  }

  public async send(to: Multiaddr, toId: string, packet: IPacket): Promise<void> {
    console.log('[UDP Transport] Sending packet to', to.toString())
    
    if (!this.isListening || !this.socket) {
      throw new Error('Transport not started')
    }

    const nodeAddr = to.toOptions()
    const encodedPacket = encodePacket(toId, packet)

    try {
      await this.socket.send(
        encodedPacket, 
        0, 
        encodedPacket.length, 
        nodeAddr.port, 
        nodeAddr.host
      )
      console.log('[UDP Transport] Successfully sent packet')
    } catch (error) {
      console.error('[UDP Transport] Failed to send packet:', error)
      throw error
    }
  }

  private handleIncoming = (data: Uint8Array, rinfo: IRemoteInfo): void => {
    console.log('[UDP Transport] Processing incoming packet from', rinfo)
    
    const multiaddr = ma(
      `/${rinfo.family === 'IPv4' ? 'ip4' : 'ip6'}/${rinfo.address}/udp/${rinfo.port}`,
    )

    try {
      const packet = decodePacket(this.srcId, data)
      console.log('[UDP Transport] Successfully decoded packet')
      this.emit('packet', multiaddr, packet)
    } catch (e) {
      console.error('[UDP Transport] Failed to decode packet:', e)
      this.emit('decodeError', e as any, multiaddr)
    }
  }

  public getContactableAddr(enr: ENR): SocketAddress | undefined {
    return getSocketAddressOnENR(enr, this.ipMode)
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    try {
      const binaryString = atob(base64)
      return new Uint8Array(Array.from(binaryString).map((char) => char.charCodeAt(0)))
    } catch (error) {
      console.error('[UDP Transport] Failed to decode base64:', error)
      return new Uint8Array(0)
    }
  }
}