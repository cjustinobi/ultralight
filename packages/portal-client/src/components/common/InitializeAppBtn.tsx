import { Power } from 'lucide-react'
import { usePortal } from '@/contexts/PortalContext'

const InitializeAppBtn = () => {
  const { isInitialized, setIsInitialized, commands } = usePortal()

  const handleInitialize = async () => {
    if (isInitialized) {
      await commands.shutdown()
      return setIsInitialized(false)
    }
      await commands.initialize()
      setIsInitialized(true)
  }

  return (
    <div
      onClick={handleInitialize}
      className={`p-2 rounded-full cursor-pointer transition-colors ${
        isInitialized ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
      }`}
    >
      <Power
        size={18}
        strokeWidth={4}
        absoluteStrokeWidth
        className={`w-2 h-2 ${isInitialized ? 'text-white' : 'text-white'}`}
      />
    </div>
  )
}

export default InitializeAppBtn