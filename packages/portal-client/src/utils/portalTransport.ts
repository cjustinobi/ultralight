import { invoke } from '@tauri-apps/api/core'

export class PortalTransport {
  constructor() {}

  async initialize(): Promise<void> {
    try {
      await invoke('initialize_socket')
      console.log('Portal Network transport initialized')
    } catch (error) {
      console.error('Failed to initialize Portal Network transport:', error)
      throw error
    }
  }

  async sendBytes(bytes: number[], target: string): Promise<void> {
    try {
      await invoke('send_bytes', { bytes, target })
    } catch (error) {
      console.error('Failed to send bytes:', error)
      throw error
    }
  }

  async receiveBytes(timeoutMs: number = 5000): Promise<{ bytes: number[], sender: string }> {
    try {
      const [bytes, sender] = await invoke('receive_bytes', { timeoutMs }) as [number[], string]
      return { bytes, sender }
    } catch (error) {
      console.error('Failed to receive bytes:', error)
      throw error
    }
  }

  async request(method: string, params: any[]): Promise<any> {
    try {
      return await invoke('portal_request', { method, params })
    } catch (error) {
      console.error('Portal request failed:', error)
      throw error
    }
  }
}