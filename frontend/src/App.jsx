import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useEffect } from 'react'
import { setTokenGetter } from './services/api'
import { useAuth } from './context/AuthContext'
import AppRouter from './router/AppRouter'

function TokenSync() {
  const { token } = useAuth()
  useEffect(() => {
    setTokenGetter(() => token)
  }, [token])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TokenSync />
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  )
}
