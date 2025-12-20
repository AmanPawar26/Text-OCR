import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { OcrDashboard } from './components/Dashboard/Dashboard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <OcrDashboard />
  </StrictMode>,
)
