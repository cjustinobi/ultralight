/// <reference types="@tauri-apps/api" />
import { TauriTransport, HTTPTransport } from './index'
import { PortalRequest, TransportProvider } from './types'

declare global {
  interface Window {
    __TAURI__?: any
  }
}
export class PortalCommands {
  private transport: TransportProvider

  constructor() {
    this.transport = window.__TAURI__
      ? new TauriTransport()
      : new HTTPTransport('http://127.0.0.1:8080')
  }

  async initialize(): Promise<void> {
    const res  =await this.transport.initialize()
    console.log('Portal Network transport initialized', res)
  }

  async sendRequest(request: PortalRequest): Promise<any> {
    const { method, params } = request
    if (window.__TAURI__) {
      return (this.transport as TauriTransport).send(method, params)
    } else {
      return (this.transport as HTTPTransport).send(method)
    }
  }
}