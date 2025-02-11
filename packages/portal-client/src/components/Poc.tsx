import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'

const PortalComponent = () => {
  const [message, setMessage] = useState('')
  const [targetAddr, setTargetAddr] = useState('127.0.0.1:9090')
  const [receivedMessage, setReceivedMessage] = useState('')
  const [error, setError] = useState('')

  const initializeSocket = async () => {
    try {
      await invoke('initialize_socket')
      setError('')
      alert('Socket initialized successfully!')
    } catch (err) {
      setError(`Failed to initialize socket: ${err}`)
    }
  }

  const sendMessage = async () => {
    try {
      const encoder = new TextEncoder()
      const messageBytes = encoder.encode(message)
      await invoke('send_portal_message', {
        message: Array.from(messageBytes),
        targetAddr: targetAddr,
      })
      setError('')
      alert('Message sent successfully!')
    } catch (err) {
      setError(`Failed to send message: ${err}`)
    }
  }

  const receiveMessage = async () => {
    try {
      console.log('Calling receive_portal_message...')
      const result = await invoke('receive_portal_message')
      console.log('Received result:', result)

      const decoder = new TextDecoder()
      const [messageBytes, senderAddr] = result as [number[], string]
      const receivedText = decoder.decode(new Uint8Array(messageBytes))
      setReceivedMessage(`Received: "${receivedText}" from ${senderAddr}`)
      setError('')
    } catch (err) {
      console.error('Error receiving message:', err)
      setError(`Failed to receive message: ${err}`)
    }
  }

  return (
    <div>
      <h1>Portal Messaging</h1>
      <div>
        <h2>Initialize Socket</h2>
        <button onClick={initializeSocket}>Initialize Socket</button>
      </div>
      <div>
        <h2>Send Message</h2>
        <input
          type="text"
          placeholder="Enter message"
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter target address (e.g., 127.0.0.1:12345)"
          value={targetAddr}
          onChange={e => setTargetAddr(e.target.value)}
        />
        <button onClick={sendMessage}>Send Message</button>
      </div>
      <div>
        <h2>Receive Message</h2>
        <button onClick={receiveMessage}>Receive Message</button>
        {receivedMessage && <p>{receivedMessage}</p>}
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}

export default PortalComponent
