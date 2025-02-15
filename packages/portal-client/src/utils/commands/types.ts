export interface TransportProvider {
  initialize(): Promise<void>
  send(message: any): Promise<any>
} 

export interface RequestOptions {
  method: string;
  params: any[];
}

export interface PortalRequest {
  method: string;
  params: any[];
}