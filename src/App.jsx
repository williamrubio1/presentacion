import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Config from './pages/Config.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/config" element={<Config />} />
    </Routes>
  )
}

export default App
