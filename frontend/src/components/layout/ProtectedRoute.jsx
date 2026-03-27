import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
