import { useEffect, useState } from 'react'
import { PortalTransport } from '../utils/portalTransport'

export function usePortalNetwork() {
  const [transport, setTransport] = useState<PortalTransport | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const newTransport = new PortalTransport()
        await newTransport.initialize()
        setTransport(newTransport)
        setIsInitialized(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      }
    }

    init()
  }, [])

  return { transport, isInitialized, setIsInitialized, error, setError }
}