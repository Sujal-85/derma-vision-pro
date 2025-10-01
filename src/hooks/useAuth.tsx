import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { API_BASE_URL, USE_LOCAL_AUTH } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    if (USE_LOCAL_AUTH) {
      // Local token-based auth: check token and fetch user
      const token = localStorage.getItem("local_token");
      if (token) {
        fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(async (r) => {
            if (r.ok) {
              const u = await r.json();
              setUser({ id: u.id, email: u.email } as unknown as User);
              setSession(null);
            }
          })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle auth events
        if (event === 'SIGNED_IN') {
          console.log('✅ User signed in:', session?.user?.email);
          // Check if there's a stored redirect path, otherwise go to home
          const redirectPath = sessionStorage.getItem('auth_redirect') || "/dashboard";
          sessionStorage.removeItem('auth_redirect');
          navigate(redirectPath);
        } else if (event === 'SIGNED_OUT') {
          console.log('❌ User signed out');
          // User signed out, show toast and redirect to auth
          toast({
            title: "Signed out",
            description: "You've been signed out successfully.",
          });
          navigate("/auth");
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signOut = async () => {
    try {
      if (USE_LOCAL_AUTH) {
        localStorage.removeItem("local_token");
        setUser(null);
        setSession(null);
        navigate("/auth");
      } else {
        const { error } = await supabase.auth.signOut();
        if (error) {
          toast({ title: "Error signing out", description: error.message, variant: "destructive" });
        }
        // Navigation will be handled by the auth state change listener
      }
    } catch (err) {
      toast({
        title: "Error signing out",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};