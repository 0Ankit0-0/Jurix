import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './components/provider/themeProvider'
import { GoogleOAuthProvider } from "@react-oauth/google"
import { AuthProvider } from './context/AuthContext'
// import { Toaster } from 'react-hot-toast'

// Get Google Client ID from environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

if (!GOOGLE_CLIENT_ID) {
  console.error('❌ VITE_GOOGLE_CLIENT_ID is not configured in .env file')
}

// Development check
const isDevelopment =
  import.meta.env.VITE_ENVIRONMENT === 'development' || import.meta.env.DEV

// Log environment info only in development
if (isDevelopment) {
  console.log('🔧 JURIX Development Mode')
  console.log('📊 Environment Variables:')
  console.log('  - VITE_GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing')
  console.log('  - VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL || 'Using default')
  console.log('  - VITE_APP_NAME:', import.meta.env.VITE_APP_NAME || 'JURIX')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <ThemeProvider>
          {/* Toast Notifications */}
          {/* <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                fontSize: '14px',
                padding: '12px 16px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              },
              success: {
                duration: 3000,
                style: { background: '#10B981', color: '#fff' },
                iconTheme: { primary: '#fff', secondary: '#10B981' },
              },
              error: {
                duration: 5000,
                style: { background: '#EF4444', color: '#fff' },
                iconTheme: { primary: '#fff', secondary: '#EF4444' },
              },
              loading: {
                style: { background: '#3B82F6', color: '#fff' },
                iconTheme: { primary: '#fff', secondary: '#3B82F6' },
              },
            }}
          /> */}
          <App />
        </ThemeProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
