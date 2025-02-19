import React, { useState } from 'react'
import { useNodes } from '../hooks/useNodes'
import { toHex } from 'viem'
import logo from '/logo.svg'

const BlockExplorer: React.FC = () => {
  const [nodeId, setNodeId] = useState('')
  const { node, isLoading, error, sendRequestHandle } = useNodes()

  const handleFetch = () => {
    const nID = toHex(nodeId)
    sendRequestHandle('portal_findNodes', [nID])
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-4">
      <div>Block Explorer</div>
      <div className="space-y-4">
        <div className="flex space-x-2">
          <input
            value={nodeId}
            onChange={(e) => setNodeId(e.target.value)}
            placeholder="Enter nodeId"
          />
          <button onClick={handleFetch} disabled={isLoading}>
            {isLoading && <span>Loading...</span>}
            Get Node
          </button>
        </div>
        <img src={logo} alt="Description" className="" />

        {error && <div className="text-red-500">Error: {error.message}</div>}

        {node && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Node Details</h3>
            <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(node, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default BlockExplorer
