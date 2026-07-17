import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SettingsProvider } from './contexts/SettingsProvider.tsx'
import { PwaProvider } from './contexts/PwaProvider.tsx'

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/battleship/sw.js', { scope: '/battleship/' })
      .then(() => console.log('Service worker registered'))
      .catch((err) => console.error('Service worker registration failed:', err));
  });
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
