import { useState } from 'react'
import { usePortal } from '../contexts/PortalContext'

interface UseBlocksReturn {
  block: any | null
  isLoading: boolean
  error: Error | null
  fetchBlock: (height: number) => Promise<void>
}

export const useBlocks = (): UseBlocksReturn => {
  const { commands } = usePortal()
  const [block, setBlock] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchBlock = async (height: number) => {
    try {
      setIsLoading(true)
      setError(null)
      const blockData = await commands.sendRequest({
        method: 'eth_getBlockByNumber',
        params: [`0x${height.toString(16)}`, true],
      })
      setBlock(blockData)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  return { block, isLoading, error, fetchBlock }
}
