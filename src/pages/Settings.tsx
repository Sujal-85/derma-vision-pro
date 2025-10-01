import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/BackButton";

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <BackButton />
      <section className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="bg-gradient-card border-0 shadow-professional">
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your account and security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">Signed in as: <span className="font-medium">{user?.email || "guest@local"}</span></div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate('/profile')}>Edit Profile</Button>
                <Button variant="destructive" onClick={signOut}>Sign Out</Button>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0">
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Coming soon</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Settings;


