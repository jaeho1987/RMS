import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import axios from '../api/axiosInstance'

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null)

  useEffect(() => {
    axios
      .get('/api/auth/me')
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false))
  }, [])

  if (isAuthenticated === null) {
    return <div>로딩 중...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
