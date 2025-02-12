import { useState } from 'react'
import { usePortalNetwork } from '../hooks/usePortalNetwork'

export default function QueryPortal() {
  const { transport, isInitialized, error } = usePortalNetwork()

  const [method, setMethod] = useState('eth_getBalance')
  const [params, setParams] = useState(
    '["0x3DC00AaD844393c110b61aED5849b7c82104e748", "0x02"]'
  )
  const [result, setResult] = useState<any>(null)

  const handleQuery = async () => {
    if (!transport || !isInitialized) return

    try {

      const response = await transport.request('eth_getBalance', JSON.parse(params))
      setResult(response)
      console.log(response)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Query Ethereum Data</h2>
      <div className="mb-4">Status: {isInitialized ? 'Inititialized' : 'Not Initialized'}</div>

      <div className="space-y-4">
        <select
          value={method}
          onChange={e => setMethod(e.target.value)}
          className="block w-full p-2 border rounded"
          disabled={!isInitialized}
        >
          <option value="eth_getBalance">eth_getBalance</option>
          <option value="eth_getBlockByNumber">eth_getBlockByNumber</option>
          <option value="eth_getBlockByHash">eth_getBlockByHash</option>
          <option value="eth_getTransactionCount">
            eth_getTransactionCount
          </option>
          <option value="eth_getCode">eth_getCode</option>
          <option value="eth_getStorageAt">eth_getStorageAt</option>
          <option value="eth_call">eth_call</option>
        </select>

        <textarea
          placeholder="Params (JSON format)"
          value={params}
          onChange={e => setParams(e.target.value)}
          className="block w-full p-2 border rounded"
          rows={3}
          disabled={!isInitialized}
        />

        <button
          onClick={handleQuery}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={!isInitialized}
        >
          Send Query
        </button>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>
        )}

        {result && (
          <pre className="p-4 bg-gray-100 rounded overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}
