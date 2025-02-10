import { useState, useEffect } from 'react'
import { TauriPortalClient } from '../utils/portalClient'

const PortalComponent = () => {
  const [portalClient, setPortalClient] = useState<TauriPortalClient | null>(
    null
  )
  const [address, setAddress] = useState('')
  const [balance, setBalance] = useState('')
  const [status, setStatus] = useState('Starting')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const fetchBalance = async () => {
    if (!portalClient) {
      setError('TauriPortalClient is not initialized')
      return
    }
    if (!address) {
      setError('Please enter an Ethereum address')
      return
    }

    setIsLoading(true)
    try {
      const balanceWei = await portalClient.getBalance(address)
      const balanceEth = Number(balanceWei) / 1e18
      setBalance(balanceEth.toFixed(6))
      setError('')
    } catch (err) {
      console.error('Failed to fetch balance:', err)
      setError(
        `Failed to fetch balance: ${
          err instanceof Error ? err.message : String(err)
        }`
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const initializeClient = async () => {
      try {
        setStatus('Initializing client...')
        const client = new TauriPortalClient()
        await client.initialize()
        setPortalClient(client)
        setStatus('Client initialized successfully')
      } catch (err) {
        console.error('Failed to initialize TauriPortalClient:', err)
        setError(
          `Failed to initialize TauriPortalClient: ${
            err instanceof Error ? err.message : String(err)
          }`
        )
        setStatus('Initialization failed')
      }
    }

    initializeClient()

    return () => {
      if (portalClient) {
        setPortalClient(null)
      }
    }
  }, [])

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>Ethereum Balance Checker</h1>
      <p>Current Status: {status}</p>

      {error && <div style={{ color: 'red', padding: '10px 0' }}>{error}</div>}

      <div style={{ marginTop: '20px' }}>
        <h2>Check Balance</h2>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <input
            type="text"
            placeholder="Enter Ethereum address"
            value={address}
            onChange={e => setAddress(e.target.value)}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
          <button
            onClick={fetchBalance}
            disabled={isLoading || !portalClient}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: isLoading ? '#ccc' : '#007bff',
              color: 'white',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Loading...' : 'Get Balance'}
          </button>
        </div>
      </div>

      {balance && (
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px'
          }}
        >
          <p style={{ margin: 0, fontSize: '18px' }}>Balance: {balance} ETH</p>
        </div>
      )}
    </div>
  )
}

export default PortalComponent

