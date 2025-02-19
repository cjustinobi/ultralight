import Button from '@/components/ui/Button'
import { PortalClient } from '@/services/portalNetwork/client'
import logo from '/logo.svg'
import { useState } from 'react'

const Home = () => {
  const [portalClient, setPortalClient] = useState<PortalClient | null>(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState<string | null>(null)
  const [networkInfo, setNetworkInfo] = useState({
    historyNetwork: false,
    stateNetwork: false,
  })

  const startApp = async () => {
    try {
      const client = new PortalClient()
      await client.init()
      setPortalClient(client)
      setStatus('running')

      // Update network status
      setNetworkInfo({
        historyNetwork: !!client.getHistoryNetwork(),
        stateNetwork: !!client.getStateNetwork(),
      })
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError(String(err))
      }
      setStatus('error')
    }
  }

  const shutdownNetwork = async () => {
    // try {
      setStatus('shutting_down')
      await portalClient?.shutdown()
      setPortalClient(null)
      setStatus('idle')
    // } catch (err) {
    //   setError(err.message)
    //   setStatus('error')
    // }
  }
  return (
    <div className="w-full flex flex-col items-center">
      <span>Status: {status}</span>
      <span>Error: {error}</span>
      <span>History Network info: {networkInfo.historyNetwork}</span>
      <span>State Network info: {networkInfo.stateNetwork}</span>
      <img src={logo} alt="Description" className="max-w-full h-auto logo" />
      <h1 className="font-extrabold m-4 text-5xl">Ultrallight Client</h1>
      <p className="font-extrabold m-2">Ultrallight Decentralized Light Client</p>
      <Button onClick={startApp} children="Launch Ultralight" />
      <Button onClick={shutdownNetwork} children="Stop Ultralight" />
    </div>
  )
}

export default Home
