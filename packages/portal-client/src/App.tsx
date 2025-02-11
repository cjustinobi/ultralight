import React from 'react'
import './App.css'
import Poc from './components/Poc'
import PortalRequest from './components/PortalRequest'

const App: React.FC = () => {

  return (
    <main className="container">
      <Poc />
      <PortalRequest />
    </main>
  )
}

export default App

