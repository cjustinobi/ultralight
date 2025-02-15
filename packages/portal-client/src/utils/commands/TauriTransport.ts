import { TransportProvider } from './types'

export class TauriTransport implements TransportProvider {
  async initialize(): Promise<void> {
    const { invoke } = await import('@tauri-apps/api/core')
    return invoke('initialize_socket')
  }

  async send(command: string, args?: any): Promise<any> {
    const { invoke } = await import('@tauri-apps/api/core')
    return invoke(command, args as Record<string, any>)
  }
}