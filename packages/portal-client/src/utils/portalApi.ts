import { invoke } from '@tauri-apps/api/core';

export async function portalRequest(method: string, params: any[]) {
  try {
    const response = await invoke('portal_request', { method, params });
    return response;
  } catch (error) {
    console.error("Error calling portal_request:", error);
    return null;
  }
}
