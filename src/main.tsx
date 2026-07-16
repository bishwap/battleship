import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SettingsProvider } from './contexts/SettingsContext.tsx'
import { PwaProvider } from './contexts/PwaContext.tsx'

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker
    .register('/battleship/sw.js', { scope: '/battleship/' })
    .catch((err) => console.error('Service worker registration failed:', err));
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PwaProvider>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </PwaProvider>
  </StrictMode>,
)
