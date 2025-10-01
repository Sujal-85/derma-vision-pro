import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
          <h2 className="text-xl font-bold mb-2">Loading...</h2>
          <p className="text-muted-foreground">
            Checking authentication status
          </p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to auth page
  if (!user) {
    // Save the attempted location to redirect back after login
    sessionStorage.setItem('auth_redirect', location.pathname);
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If user is authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
