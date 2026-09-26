import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import 'sweetalert2/dist/sweetalert2.min.css'
import 'sonner/dist/styles.css'
import './styles/global.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root element missing')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
