import logo from '/logo.svg'
import Button from '@/components/ui/Button'
import PortalNetwork from '@/components/PortalNetwork'
import { usePortalClient } from '@/contexts/PortalClientContext'

const Home = () => {
  const { isInitialized, initializePortalClient, resetPortalClient } = usePortalClient()
  return (
    <div className="w-full flex flex-col items-center">
      <PortalNetwork />
      <img src={logo} alt="Description" className="max-w-full h-auto logo" />
      <h1 className="font-extrabold m-4 text-5xl">Ultrallight Client</h1>
      <p className="font-extrabold m-2">Ultrallight Decentralized Light Client</p>
      <Button
        onClick={isInitialized ? () => resetPortalClient() : () => initializePortalClient()}
        children={`${isInitialized ? 'Shutdown' : 'Launch'} Ultralight`}
      />
    </div>
  )
}

export default Home
