import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the code from URL parameters
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          throw new Error(errorDescription || error);
        }

        let data: any = null;
        let authError: any = null;

        if (code) {
          // PKCE code flow: exchange code for session
          const result = await supabase.auth.exchangeCodeForSession(code);
          data = result.data;
          authError = result.error;
        } else {
          // Try implicit flow: tokens may be in URL hash
          const hash = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : '';
          const params = new URLSearchParams(hash);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            const result = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
            data = result.data as any;
            authError = result.error;
          } else {
            throw new Error('No authorization code received');
          }
        }

        if (authError) {
          throw authError;
        }

        if (data.user) {
          console.log('✅ Auth successful:', data.user);
          toast({
            title: "Welcome!",
            description: "You've been signed in successfully.",
          });
          
          // Redirect to intended destination or dashboard
          const redirectTo = sessionStorage.getItem('auth_redirect') || '/dashboard';
          sessionStorage.removeItem('auth_redirect');
          navigate(redirectTo, { replace: true });
        } else {
          console.log('❌ No user in auth data:', data);
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        toast({
          title: "Authentication Error",
          description: err instanceof Error ? err.message : 'Authentication failed',
          variant: "destructive",
        });
        
        // Redirect to auth page after error
        setTimeout(() => {
          navigate('/auth', { replace: true });
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
          <h2 className="text-xl font-bold mb-2">Completing sign in...</h2>
          <p className="text-muted-foreground">
            Please wait while we complete your authentication
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
            <span className="text-destructive text-2xl">!</span>
          </div>
          <h2 className="text-xl font-bold mb-2 text-destructive">Authentication Failed</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">
            Redirecting to sign in page...
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;
