import { TransportProvider } from './types'
import { invoke } from '@tauri-apps/api/core'

export class TauriTransport implements TransportProvider {
  async initializePortal(): Promise<void> {
    // const { invoke } = await import('@tauri-apps/api/core')
    return invoke('initialize_portal')
  }

  async shutdownPortal(): Promise<void> {
    return invoke('shutdown_portal')
  }

  async sendCommand(command: string, args?: any): Promise<any> {
    // const { invoke } = await import('@tauri-apps/api/core')
    return invoke(command, args as Record<string, any>)
  }
}
