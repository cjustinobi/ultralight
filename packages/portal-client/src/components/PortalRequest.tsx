import { useState, useEffect } from 'react'
import { TauriPortalClient } from '../utils/portalClient'
import { portalRequest } from '../utils/portalApi'

export default function QueryPortal() {
  const [method, setMethod] = useState('eth_getBalance')
  const [params, setParams] = useState('["0xAddress", "latest"]')
  const [result, setResult] = useState<any>(null)
  const [status, setStatus] = useState('Starting')
  const [error, setError] = useState('')
  const [portalClient, setPortalClient] = useState<TauriPortalClient | null>(null)

  const handleQuery = async () => {
    const parsedParams = params ? JSON.parse('["0xAddress", "latest"]') : []
    const response = await portalRequest(method, parsedParams)
    console.log('Response from portal:', response)
    setResult(response)
  }

  useEffect(() => {
      const initializeClient = async () => {
        try {
          setStatus('Initializing client...')
          const client = new TauriPortalClient()
          await client.initialize()
          setPortalClient(client)
          console.log('portalclient ', client)
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

    // const balanceWei = await portalClient.getBalance(address)
    // return console.log('Balance:', balanceWei)
    // const balanceEth = Number(balanceWei) / 1e18
    // setBalance(balanceEth.toFixed(6))

  return (
    <div>
      <h2>Query Ethereum Data</h2>
      <p>Current Status: {status}</p>
      <select value={method} onChange={e => setMethod(e.target.value)}>
        <option value="eth_getBalance">eth_getBalance</option>
        <option value="eth_getBlockByNumber">eth_getBlockByNumber</option>
        <option value="eth_getBlockByHash">eth_getBlockByHash</option>
        <option value="eth_getTransactionCount">eth_getTransactionCount</option>
        <option value="eth_getCode">eth_getCode</option>
        <option value="eth_getStorageAt">eth_getStorageAt</option>
        <option value="eth_call">eth_call</option>
      </select>
      <input
        type="text"
        placeholder="Params (JSON format)"
        value={params}
        onChange={e => setParams(e.target.value)}
      />
      <button onClick={handleQuery}>Send Query</button>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
      {error && <div style={{ color: 'grey', padding: '10px 0' }}>{error}</div>}
    </div>
  )
}
