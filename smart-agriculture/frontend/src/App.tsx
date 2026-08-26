import { Navigate, Route, Routes } from 'react-router-dom'

import { Layout } from './components/Layout'
import { useAuth } from './context/AuthContext'
import { AdminPage } from './pages/AdminPage'
import { AuthPage } from './pages/AuthPage'
import { CropPage } from './pages/CropPage'
import { DashboardPage } from './pages/DashboardPage'
import { DiseasePage } from './pages/DiseasePage'
import { HomePage } from './pages/HomePage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="panel loading-panel">Loading session…</div>
  if (!user) return <Navigate to="/login" replace />

  return <>{children}</>
}

function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage mode="login" />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage mode="register" />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crops"
          element={
            <ProtectedRoute>
              <CropPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/disease"
          element={
            <ProtectedRoute>
              <DiseasePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  )
}

export default App
