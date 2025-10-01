import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { recommendProducts, getProfile, upsertProfile } from "@/lib/api";
import { Sparkles, Flame, Droplets, Sun, Activity } from "lucide-react";
import BackButton from "@/components/BackButton";

const MCQ_QUESTIONS = [
  { id: "skin_type", q: "What best describes your skin type?", options: ["dry", "oily", "combination", "normal", "sensitive"] },
  { id: "primary_concern", q: "What's your primary skin concern?", options: ["acne", "wrinkles", "dark-spots", "dryness", "redness", "pores"] },
  { id: "age_range", q: "What's your age range?", options: ["18-24", "25-34", "35-44", "45-54", "55+"] },
  { id: "routine", q: "How often do you follow a skincare routine?", options: ["daily", "few-times-a-week", "rarely"] },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const userId = user?.id || "guest";

  useEffect(() => {
    if (!userId) return;
    getProfile(userId).then((p) => {
      if (p?.mcqAnswers) {
        const mapped: Record<string, string> = {};
        for (const a of p.mcqAnswers) mapped[a.questionId] = a.answer;
        setAnswers(mapped);
      }
    }).catch(() => {});
  }, [userId]);

  const canRecommend = useMemo(() => !!answers.skin_type && !!answers.primary_concern && !!answers.age_range, [answers]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const mcqAnswers = MCQ_QUESTIONS.map((q) => ({ questionId: q.id, question: q.q, answer: answers[q.id] || "" }));
      await upsertProfile(userId, { userId, skinType: answers.skin_type, mcqAnswers });
    } finally {
      setSaving(false);
    }
  };

  const handleRecommend = async () => {
    if (!canRecommend) return;
    const rec = await recommendProducts({ skinType: answers.skin_type, concern: answers.primary_concern, ageRange: answers.age_range });
    setProducts(rec);
  };

  return (
    <div className="min-h-screen bg-background">
      <BackButton />
      {/* Hero header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/20 animate-pulse" />
        <section className="container mx-auto px-4 py-10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs">
                <Sparkles className="w-3 h-3" /> Real-time personalized skincare
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">Your Health & Beauty Dashboard</h1>
              <p className="text-muted-foreground">Keep track of your profile, complete quick health questions, and explore curated product picks tailored to you.</p>
              <div className="flex gap-3">
                <Button onClick={() => document.getElementById('mcq')?.scrollIntoView({ behavior: 'smooth' })} className="bg-gradient-primary">Start MCQs</Button>
                <Button variant="outline" onClick={() => document.getElementById('recommend')?.scrollIntoView({ behavior: 'smooth' })}>See Recommendations</Button>
              </div>
            </div>
            <div className="flex-1">
              <div className="relative w-full h-56 md:h-64 rounded-2xl overflow-hidden border border-border shadow-professional">
                <img src="/placeholder.svg" alt="Skincare" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 p-4 backdrop-blur bg-background/40">
                  <div className="flex items-center gap-3 text-sm">
                    <Droplets className="w-4 h-4 text-blue-500" /> Hydration
                    <Sun className="w-4 h-4 text-orange-500" /> UV
                    <Activity className="w-4 h-4 text-green-500" /> Wellness
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[{label:'Hydration',icon:Droplets,color:'text-blue-500'},{label:'Elasticity',icon:Activity,color:'text-green-500'},{label:'Protection',icon:Sun,color:'text-orange-500'},{label:'Glow',icon:Flame,color:'text-pink-500'}].map((s) => (
              <Card key={s.label} className="border-0 shadow-card-hover animate-in fade-in slide-in-from-bottom-2">
                <CardContent className="p-4 flex items-center gap-3">
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                  <div className="text-sm font-medium">{s.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>

      <section className="py-16 container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">Your Health Dashboard</h2>
            <p className="text-muted-foreground">View profile info, complete MCQs, and get product recommendations.</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-8">
            <TabsList>
              <TabsTrigger value="profile">User Info</TabsTrigger>
              <TabsTrigger value="mcq">Medical History MCQs</TabsTrigger>
              <TabsTrigger value="recommend">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card className="bg-gradient-card border-0 shadow-card-hover">
                <CardHeader>
                  <CardTitle>User Information</CardTitle>
                  <CardDescription>Basic details for your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div className="font-medium">{user?.email || "guest@local"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">User ID</div>
                      <div className="font-mono text-xs">{userId}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mcq" id="mcq">
              <Card className="bg-gradient-card border-0 shadow-card-hover">
                <CardHeader>
                  <CardTitle>Medical History</CardTitle>
                  <CardDescription>Answer a few questions to tailor recommendations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {MCQ_QUESTIONS.map((q) => (
                    <div key={q.id} className="space-y-2">
                      <div className="font-medium">{q.q}</div>
                      <div className="flex flex-wrap gap-2">
                        {q.options.map((opt) => (
                          <Button
                            key={opt}
                            type="button"
                            variant={answers[q.id] === opt ? "default" : "outline"}
                            onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                          >
                            {opt}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-3">
                    <Button onClick={handleSave} disabled={saving} className="bg-gradient-primary">Save Answers</Button>
                    <Button onClick={handleRecommend} disabled={!canRecommend}>Get Recommendations</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommend" id="recommend">
              <Card className="bg-gradient-card border-0 shadow-card-hover">
                <CardHeader>
                  <CardTitle>Recommended Products</CardTitle>
                  <CardDescription>Based on your profile and analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  {products.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No recommendations yet. Fill MCQs and click Get Recommendations.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products.map((p) => (
                        <Card key={p._id} className="border-0 shadow-card-hover">
                          <CardContent className="p-4 space-y-3">
                            {p.imageUrl && (
                              <img src={p.imageUrl} alt={p.name} className="w-full h-40 object-cover rounded-lg" />
                            )}
                            <div className="flex items-center justify-between">
                              <div className="font-medium">{p.name}</div>
                              <Badge>{p.brand}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">{p.category} · ⭐ {p.rating?.toFixed?.(1) ?? p.rating}</div>
                            <div className="font-semibold">${p.price?.toFixed?.(2) ?? p.price}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;


