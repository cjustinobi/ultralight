// import PowerOnIcon from '@/components/icons/PowerOnIcon'
// import PowerOffIcon from '@/components/icons/PowerOffIcon'
import { usePortalClient } from '@/contexts/PortalClientContext'

const InitializeAppBtn = () => {
//  const { isInitialized, handleInitialize } = useInitializeApp()
 const { isInitialized, initializePortalClient, resetPortalClient } = usePortalClient()

  return (
    <div
      onClick={isInitialized ? () => resetPortalClient() : () => initializePortalClient()}
      className="cursor-pointer"
    >
      {/* <input type="checkbox" className="toggle-primary" /> */}
      {isInitialized ? 'Off' : 'On'}
      {/* <PowerOffIcon />
      <PowerOnIcon /> */}
    </div>
  )
}

export default InitializeAppBtn