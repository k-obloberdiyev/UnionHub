import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading } = useAuth();
  const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL ?? "").toLowerCase();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const email = (user.email ?? "").toLowerCase();
  if (!adminEmail || email !== adminEmail) {
    // Not authorized — redirect to home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
