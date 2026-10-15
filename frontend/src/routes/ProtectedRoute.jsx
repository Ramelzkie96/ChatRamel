import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import useAuth from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-app text-muted">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}