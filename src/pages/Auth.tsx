import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { localSignin, localSignup, USE_LOCAL_AUTH } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import BackButton from "@/components/BackButton";
import { signInWithGoogle, signInWithMicrosoft } from "@/lib/oauth-service";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import Footer from "@/components/Footer";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Get the intended destination from location state
  const from = location.state?.from?.pathname || "/";

  // OAuth handlers
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError("");
      await signInWithGoogle();
    } catch (err) {
      setError("Failed to sign in with Google. Please try again.");
      console.error("Google sign-in error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftSignIn = async () => {
    try {
      setIsLoading(true);
      setError("");
      await signInWithMicrosoft();
    } catch (err) {
      setError("Failed to sign in with Microsoft. Please try again.");
      console.error("Microsoft sign-in error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (USE_LOCAL_AUTH) {
        const data = await localSignup(email, password);
        toast({ title: "Account created", description: `Welcome ${data.user.email}` });
        navigate(from, { replace: true });
      } else {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectUrl }
        });

        if (error) {
          if (error.message.includes("already registered")) {
            setError("This email is already registered. Please sign in instead.");
          } else {
            setError(error.message);
          }
        } else {
          toast({ title: "Check your email", description: "We've sent you a confirmation link to complete your signup." });
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (USE_LOCAL_AUTH) {
        const data = await localSignin(email, password);
        localStorage.setItem("local_token", data.token);
        toast({ title: "Welcome!", description: "Signed in with local auth." });
        navigate(from, { replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            setError("Invalid email or password. Please check your credentials and try again.");
          } else {
            setError(error.message);
          }
        } else {
          toast({ title: "Welcome back!", description: "You've been signed in successfully." });
          // Navigation will be handled by the auth state change listener
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-medical-50 to-background flex flex-col items-center justify-center p-4">
        {/* <BackButton /> */}
        <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">DA</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">DermaTech AI</h1>
          </div>
          <p className="text-muted-foreground">
            Access your personalized skincare analysis platform
          </p>
        </div>

        {/* Auth Form */}
        <Card className="border-medical-200 shadow-professional">
          <CardContent className="p-6">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <CardHeader className="p-0">
                  <CardTitle className="text-xl text-center">Welcome Back</CardTitle>
                  <CardDescription className="text-center">
                    Sign in to access your skincare analysis dashboard
                  </CardDescription>
                </CardHeader>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* OAuth Buttons */}
                <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      className="w-full"
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Google
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleMicrosoftSignIn}
                      disabled={isLoading}
                      className="w-full"
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="#f25022"
                          d="M1 1h10v10H1z"
                        />
                        <path
                          fill="#7fba00"
                          d="M13 1h10v10H13z"
                        />
                        <path
                          fill="#00a4ef"
                          d="M1 13h10v10H1z"
                        />
                        <path
                          fill="#ffb900"
                          d="M13 13h10v10H13z"
                        />
                      </svg>
                      Microsoft
                    </Button>
                  </div>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-primary hover:shadow-professional"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <CardHeader className="p-0">
                  <CardTitle className="text-xl text-center">Create Account</CardTitle>
                  <CardDescription className="text-center">
                    Join DermaTech AI for personalized skincare analysis
                  </CardDescription>
                </CardHeader>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* OAuth Buttons */}
                <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      className="w-full"
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Google
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleMicrosoftSignIn}
                      disabled={isLoading}
                      className="w-full"
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="#f25022"
                          d="M1 1h10v10H1z"
                        />
                        <path
                          fill="#7fba00"
                          d="M13 1h10v10H13z"
                        />
                        <path
                          fill="#00a4ef"
                          d="M1 13h10v10H1z"
                        />
                        <path
                          fill="#ffb900"
                          d="M13 13h10v10H13z"
                        />
                      </svg>
                      Microsoft
                    </Button>
                  </div>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      minLength={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 6 characters long
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-primary hover:shadow-professional"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Auth;