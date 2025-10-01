import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, useIsFetching } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import RouteLoaderOverlay from "@/components/RouteLoader";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import Navigation from "@/components/Navigation";
import DraggableMedicalAssistant from "@/components/DraggableMedicalAssistant";
import Analyze from "./pages/Analyze";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Routine from "./pages/Routine";
import News from "./pages/News";
import AIAssistantPage from "./pages/AIAssistant";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthCallback from "./pages/AuthCallback";
import Appointments from "./pages/Appointments";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const { loading: authLoading } = useAuth();
  const isFetching = useIsFetching();
  const [routeChanging, setRouteChanging] = useState(false);

  useEffect(() => {
    setRouteChanging(true);
    const t = setTimeout(() => setRouteChanging(false), 400);
    return () => clearTimeout(t);
  }, [location.pathname]);

  const loading = authLoading || routeChanging || isFetching > 0;

  return (
    <>
      <Navigation />
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/news" element={<News />} />
          <Route path="/ai-assistant" element={<AIAssistantPage />} />
          
          {/* Protected Routes - Require Authentication */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/analyze" element={
            <ProtectedRoute>
              <Analyze />
            </ProtectedRoute>
          } />
          <Route path="/routine" element={
            <ProtectedRoute>
              <Routine />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/appointments" element={
            <ProtectedRoute>
              <Appointments />
            </ProtectedRoute>
          } />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <DraggableMedicalAssistant />
      <RouteLoaderOverlay loading={loading} text="Loading..." />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
