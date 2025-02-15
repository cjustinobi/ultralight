import { useState } from 'react'
import { usePortal } from '../contexts/PortalContext'

interface UseBlocksReturn {
  block: any | null
  isLoading: boolean
  error: Error | null
  sendRequestHandle: (method: string, params: any[]) => Promise<void>
}

export const useBlocks = (): UseBlocksReturn => {
  const { commands } = usePortal()
  const [block, setBlock] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const sendRequestHandle = async (method: string, params: any[]) => {
    try {
      setIsLoading(true)
      setError(null)
      const blockData = await commands.sendRequest({ method, params })
      setBlock(blockData)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  return { block, isLoading, error, sendRequestHandle }
}
