import { FC } from 'react'
import './App.css'
import BlockExplorer from './components/BlockExplorer'
import { PortalProvider } from './contexts/PortalContext'

const App: FC = () => {
  return (
    <main className="container">
      <PortalProvider>
        <div className="container mx-auto p-4">
          <BlockExplorer />
        </div>
      </PortalProvider>
    </main>
  )
}

export default App
