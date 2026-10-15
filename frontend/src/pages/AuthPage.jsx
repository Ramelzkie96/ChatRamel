import { Navigate } from "react-router-dom";
import BrandPanel from "../components/auth/BrandPanel";
import AuthCard from "../components/auth/AuthCard";
import useAuth from "../hooks/useAuth";


export default function AuthPage({ mode = "login" }) {
const { user, loading } = useAuth();

if (loading) return null;
if (user) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen w-full bg-app text-white">
      <BrandPanel />

      <div className="flex w-full items-center justify-center bg-app px-4 py-10 lg:w-1/2">
        <AuthCard mode={mode} />
      </div>
    </div>
  );
}
