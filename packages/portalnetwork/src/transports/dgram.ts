
import { EventEmitter } from 'events'
import { bind, send } from '@kuyoonjo/tauri-plugin-udp'

class MockDgramSocket extends EventEmitter {
  private socketId: string
  //@ts-ignore
  private isListening = false
  private unlisten: (() => void) | null = null

  constructor(socketId: string) {
    super()
    this.socketId = socketId
  }

  bind(port: number, address: string, callback?: (error?: Error) => void) {
    try {
      // Simulate async bind operation
      bind(this.socketId, `${address}:${port}`).then(() => {
        this.isListening = true
        if (callback) callback()
      }).catch((error) => {
        if (callback) callback(error)
      })
    } catch (error) {
      if (callback) callback(error as Error)
    }
  }

  send(
    buffer: Buffer | Uint8Array,
    offset: number,
    length: number,
    port: number,
    address: string,
    callback?: (error?: Error) => void
  ) {
    try {
      const data = new Uint8Array(buffer.slice(offset, offset + length))
      send(this.socketId, `${address}:${port}`, this.uint8ArrayToBase64(data))
        .then(() => {
          if (callback) callback()
        })
        .catch((error) => {
          if (callback) callback(error)
        })
    } catch (error) {
      if (callback) callback(error as Error)
    }
  }

  close(callback?: (error?: Error) => void) {
    try {
      if (this.unlisten) {
        this.unlisten()
        this.unlisten = null
      }
      if (callback) callback()
    } catch (error) {
      if (callback) callback(error as Error)
    }
  }

  // Utility method for base64 conversion
  private uint8ArrayToBase64(array: Uint8Array): string {
    return btoa(
      Array.from(array)
        .map((val) => String.fromCharCode(val))
        .join(''),
    )
  }
}

// Mock dgram module to replace Node.js implementation
const mockDgram = {
  // @ts-ignore
  createSocket: (type: string) => {
    console.log('Creating socket with type:', type)
    const socketId = `portal-client-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
    return new MockDgramSocket(socketId)
  },
}

console.log('Applying dgram:', mockDgram)
if (typeof window !== 'undefined' && !(window as any).dgram) {
  (window as any).dgram = mockDgram
}
if (typeof global !== 'undefined' && !(global as any).dgram) {
  (global as any).dgram = mockDgram
}
export default mockDgram