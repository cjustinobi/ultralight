import React from 'react'
import './App.css'
import Poc from './components/Poc'
import PortalComponent from './components/PortalComponent'

const App: React.FC = () => {

  return (
    <main className="container">
      <Poc />
      <PortalComponent />
    </main>
  )
}

export default App

