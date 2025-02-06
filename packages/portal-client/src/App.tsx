console.log('[App] Module evaluation started')
import React from 'react'
import './App.css'
import Poc from './components/Poc'
import PortalComponent from './components/PortalComponent'

const App: React.FC = () => {

  return (
    <main className="container">helloxsxsa
      <Poc />
     <PortalComponent />
     Hello world
    </main>
  )
}

console.log('[App] Module evaluation complete')
export default App

// import { useEffect } from 'react'
// import './App.css'
// import Poc from './components/Poc'
// import PortalComponent from './components/PortalComponent'

// function App() {

//  console.log('App component rendering')

//  useEffect(() => {
//    console.log('App component mounted')
//  }, [])

//   return (
//     <main className="container">
//       Hello from App.tsx
//       <PortalComponent />
//       <Poc />
//     </main>
//   )
// }

// export default App
