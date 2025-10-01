import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertProfile } from "@/lib/api";
import BackButton from "@/components/BackButton";

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [skinType, setSkinType] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) navigate("/auth");
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await upsertProfile(user.id, {
        userId: user.id,
        fullName,
        age: age ? Number(age) : undefined,
        gender,
        skinType,
      });
      navigate("/dashboard");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <BackButton />
      <Card className="w-full max-w-xl border-0 shadow-professional bg-gradient-card">
        <CardHeader>
          <CardTitle>Tell us about yourself</CardTitle>
          <CardDescription>Complete your profile to personalize your experience</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="28" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Input id="gender" value={gender} onChange={(e) => setGender(e.target.value)} placeholder="female / male / other" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="skinType">Skin Type</Label>
              <Input id="skinType" value={skinType} onChange={(e) => setSkinType(e.target.value)} placeholder="oily / dry / combination / sensitive" />
            </div>
            <div className="pt-2">
              <Button type="submit" className="w-full bg-gradient-primary" disabled={saving}>
                {saving ? "Saving..." : "Continue"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;


