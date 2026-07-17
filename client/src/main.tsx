import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

console.log('🚀 main.tsx starting...')

try {
  const root = document.getElementById('root')
  
  if (!root) {
    throw new Error('Root element not found!')
  }
  
  console.log('✅ Mounting React app...')
  
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <HashRouter>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </HashRouter>
    </React.StrictMode>
  )
  
  console.log('✅ React app mounted successfully')
} catch (error) {
  console.error('❌ Failed to mount React app:', error)
}
