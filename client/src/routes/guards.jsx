import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Spinner } from "../components/Feedback.jsx";

export function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner label="Checking session" />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function GuestRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner label="Checking session" />;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}
