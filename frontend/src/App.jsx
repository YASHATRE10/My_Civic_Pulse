import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { CitizenSubmitPage } from './pages/CitizenSubmitPage'
import { CitizenComplaintsPage } from './pages/CitizenComplaintsPage'
import { AdminPage } from './pages/AdminPage'
import { OfficerPage } from './pages/OfficerPage'
import { AnalyticsPage } from './pages/AnalyticsPage'

function DefaultRedirect() {
  const { isAuthenticated } = useAuth()
  return <Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={['CITIZEN', 'ADMIN', 'OFFICER']}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/citizen/submit"
        element={
          <ProtectedRoute roles={['CITIZEN']}>
            <CitizenSubmitPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/my-complaints"
        element={
          <ProtectedRoute roles={['CITIZEN']}>
            <CitizenComplaintsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <AdminPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/officer"
        element={
          <ProtectedRoute roles={['OFFICER']}>
            <OfficerPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute roles={['CITIZEN', 'ADMIN', 'OFFICER']}>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<DefaultRedirect />} />
    </Routes>
  )
}
