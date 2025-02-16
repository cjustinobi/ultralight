import React, { useState } from 'react'
import { useBlocks } from '../hooks/useBlocks'
// import { toHex } from 'viem'


const BlockExplorer: React.FC = () => {
  const [blockHeight, setBlockHeight] = useState('')
  const { block, isLoading, error, sendRequestHandle } = useBlocks()

  const handleFetch = () => {
    // const height = toHex(blockHeight)
    sendRequestHandle('ping', [])
    // sendRequestHandle('getBlockByNumber', [height])
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-4">

      <div>Block Explorer</div>

      <div className="space-y-4">
        <div className="flex space-x-2">
          <input
            type="number"
            value={blockHeight}
            onChange={e => setBlockHeight(e.target.value)}
            placeholder="Enter block height"
          />
          <button onClick={handleFetch} disabled={isLoading}>
            {isLoading && <span>Loading...</span>}
            Fetch Block
          </button>
        </div>

        {error && <div className="text-red-500">Error: {error.message}</div>}

        {block && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Block Details</h3>
            <pre className="bg-gray-100 p-4 rounded">
              {JSON.stringify(block, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default BlockExplorer