import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '../store/auth'

export function RequireAuth() {
  const credentials = useAuthStore((s) => s.credentials)
  return credentials ? <Outlet /> : <Navigate to="/login" replace />
}
