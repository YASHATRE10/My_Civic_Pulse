import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Loader from './components/Loader';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import LandingPage from './pages/LandingPage';
import CitizenDashboard from './pages/CitizenDashboard';
import SubmitComplaint from './pages/SubmitComplaint';
import MyComplaints from './pages/MyComplaints';
import AdminDashboard from './pages/AdminDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import ComplaintDetails from './pages/ComplaintDetails';
import FeedbackPage from './pages/FeedbackPage';

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }
  if (user.role === 'OFFICER') {
    return <Navigate to="/officer" replace />;
  }
  return <Navigate to="/citizen" replace />;
}

function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function Layout({ children }) {
  const { user } = useAuth();
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4">
      <Navbar />
      <div className="grid grid-cols-1 md:grid-cols-[230px_1fr] gap-4">
        <Sidebar role={user?.role} />
        <main>{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<RoleRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/citizen"
        element={
          <ProtectedRoute roles={['CITIZEN']}>
            <Layout>
              <CitizenDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/submit"
        element={
          <ProtectedRoute roles={['CITIZEN']}>
            <Layout>
              <SubmitComplaint />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-complaints"
        element={
          <ProtectedRoute roles={['CITIZEN']}>
            <Layout>
              <MyComplaints />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <Layout>
              <AdminDashboard chartOnly />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/officer"
        element={
          <ProtectedRoute roles={['OFFICER']}>
            <Layout>
              <OfficerDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/complaints/:id"
        element={
          <ProtectedRoute roles={['CITIZEN', 'ADMIN', 'OFFICER']}>
            <Layout>
              <ComplaintDetails />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/feedback/:id"
        element={
          <ProtectedRoute roles={['CITIZEN']}>
            <Layout>
              <FeedbackPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
