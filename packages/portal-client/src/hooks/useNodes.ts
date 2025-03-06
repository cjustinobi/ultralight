import { useState, useCallback } from 'react'
import { usePortalClient } from '@/contexts/PortalClientContext'

interface RPCResponse {
  result?: any
  error?: {
    code: number
    message: string
  }
}

export const useNodes = () => {
  const { portalClient } = usePortalClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [node, setNode] = useState<RPCResponse | null>(null)

  const sendRequestHandle = useCallback(async (method: string, params: any[] = []) => {
    setIsLoading(true)
    setError(null)
    setNode(null)

    if (!portalClient) {
      setError(new Error('Portal Network client is not initialized'))
      setIsLoading(false)
      return null
    }

    try {

      let result
      switch (method) {
  
        case 'eth_getBlockByNumber':      
          result = await portalClient.ETH.getBlockByNumber(params[0], params[1] ?? false)
          break
        case 'eth_getBlockByHash':
          result = await portalClient.ETH.getBlockByHash(params[0], params[1] ?? false)
          break
        case 'eth_getCode':
          result = await portalClient.ETH.getCode(params[0], params[1])
          break
        case 'eth_getStorageAt':
          result = await portalClient.ETH.getStorageAt(params[0], params[1], params[2])
          break
        case 'eth_call':
          result = await portalClient.ETH.call(params[0], params[1])
          break
        case 'eth_getBalance':
          result = await portalClient.ETH.getBalance(params[0], params[1])
          break
        default:
          throw new Error(`Unsupported method: ${method}`)
      }

      console.log('Request Result:', result)
      setNode({ result })
      return result
    } catch (err) {

      const error = err instanceof Error 
        ? err 
        : new Error('An unknown error occurred')
      
      setError(error)
      setNode({ error: { 
        code: -32000, 
        message: error.message 
      }})
      
      return null
    } finally {
      setIsLoading(false)
    }
  }, [portalClient])

  return {
    node,
    isLoading,
    error,
    sendRequestHandle
  }
}