import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { recommendProducts, getProfile, upsertProfile, getUserAnalyses } from "@/lib/api";
import { Sparkles, Flame, Droplets, Sun, Activity, Youtube, Instagram, Users, BarChart3, Play } from "lucide-react";
import BackButton from "@/components/BackButton";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, AreaChart, Area } from "recharts";
import { Input } from "@/components/ui/input";
import { recommendProductsByAnalysis } from "@/lib/api";

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
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(true);
  const [infQuery, setInfQuery] = useState<string>("");
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
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

  // Load analytics from real analyses and influencer JSON
  useEffect(() => {
    const load = async () => {
      try {
        setAnalyticsLoading(true);
        if (userId) {
          const items = await getUserAnalyses(userId);
          setAnalyses(items || []);
        }
        // dynamic import JSON (works with Vite)
        const mod = await import("@/assets/influncer.json");
        setInfluencers(mod.default || []);
      } catch (e) {
        // no-op
      } finally {
        setAnalyticsLoading(false);
      }
    };
    load();
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
    let items: any[] = [];
    try {
      items = await recommendProducts({ skinType: answers.skin_type, concern: answers.primary_concern, ageRange: answers.age_range });
    } catch {}
    // Fallback to Python recommendation if none from Node
    if (!items || items.length === 0) {
      try {
        const latest = analyses?.[0];
        const payload = {
          metrics: latest?.metrics || { hydration: 60, elasticity: 60, uvProtection: 60, texture: 60, overallScore: 60 },
          concerns: latest?.concerns || [],
          topK: 12,
        };
        const py = await recommendProductsByAnalysis(payload);
        items = (py?.items || []).map((it: any, idx: number) => ({
          _id: it.id || it.product_url || String(idx),
          name: it.name,
          brand: it.brand || "",
          category: it.category || "Skincare",
          rating: it.rating || 4.5,
          price: typeof it.price === 'number' ? it.price : Number(it.price || 0),
          imageUrl: it.image || "/api/placeholder/400/300",
        }));
      } catch {}
    }
    setProducts(items || []);
  };

  // ------- Derived analytics from real data -------
  const analysesCount = analyses.length;
  const trendData = (analyses || []).slice().reverse().map((a: any, idx: number) => ({
    idx,
    date: new Date(a.createdAt || a.updatedAt || Date.now()).toLocaleDateString(),
    Hydration: a?.metrics?.hydration ?? 0,
    Elasticity: a?.metrics?.elasticity ?? 0,
    UV: a?.metrics?.uvProtection ?? 0,
    Texture: a?.metrics?.texture ?? 0,
  }));

  const avg = (key: keyof any) => {
    if (!analysesCount) return 0;
    const sum = analyses.reduce((acc: number, a: any) => acc + (a?.metrics?.[key] ?? 0), 0);
    return Math.round((sum / analysesCount) * 10) / 10;
  };
  const avgHyd = avg("hydration");
  const avgEla = avg("elasticity");
  const avgUV = avg("uvProtection");
  const avgTex = avg("texture");

  const concernFreq: Record<string, number> = {};
  for (const a of analyses) {
    for (const c of (a?.concerns || [])) {
      const k = (c?.type || "").toLowerCase();
      if (!k) continue;
      concernFreq[k] = (concernFreq[k] || 0) + 1;
    }
  }
  const topConcerns = Object.entries(concernFreq).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // ------- Influencer helpers -------
  const ytIdFromUrl = (url?: string) => {
    if (!url) return null;
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtube.com')) {
        const v = u.searchParams.get('v');
        if (v) return v;
        // If it's a playlist link, no single video id
        const path = u.pathname;
        const shorts = path.startsWith('/shorts/') ? path.split('/')[2] : null;
        if (shorts) return shorts;
      }
      if (u.hostname === 'youtu.be') {
        return u.pathname.slice(1);
      }
    } catch {}
    return null;
  };
  const filteredInfluencers = influencers.filter((inf: any) => {
    const q = infQuery.trim().toLowerCase();
    if (!q) return true;
    const inName = (inf.name || '').toLowerCase().includes(q);
    const inProducts = (inf.notable_products || []).some((p: string) => p.toLowerCase().includes(q));
    return inName || inProducts;
  });

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
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="influencers">Influencers</TabsTrigger>
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

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <Card className="bg-gradient-card border-0 shadow-card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Your Skin Analytics
                  </CardTitle>
                  <CardDescription>Computed from your actual analyses history</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-xs text-muted-foreground">Analyses</div>
                        <div className="text-2xl font-bold">{analysesCount}</div>
                      </CardContent>
                    </Card>
                    {[{label:'Avg Hydration',value:avgHyd,icon:Droplets,color:'text-blue-500'},
                      {label:'Avg Elasticity',value:avgEla,icon:Activity,color:'text-green-500'},
                      {label:'Avg UV Prot.',value:avgUV,icon:Sun,color:'text-orange-500'}].map((m) => (
                      <Card key={m.label}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs text-muted-foreground">{m.label}</div>
                            <m.icon className={`w-4 h-4 ${m.color}`} />
                          </div>
                          <div className="text-xl font-semibold">{m.value}%</div>
                          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${m.value}%` }} />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <div className="text-sm font-medium mb-2">Metric Trends</div>
                      <div className="h-64 bg-accent/50 rounded-lg p-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" hide={trendData.length > 12} />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="Hydration" stroke="#3b82f6" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="Elasticity" stroke="#22c55e" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="UV" stroke="#f59e0b" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="Texture" stroke="#a855f7" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">Top Concerns</div>
                      <div className="space-y-2">
                        {topConcerns.length === 0 && (
                          <div className="text-sm text-muted-foreground">No concerns recorded yet.</div>
                        )}
                        {topConcerns.map(([name, count]) => (
                          <div key={name} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                            <div className="capitalize">{name}</div>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Influencers Tab */}
            <TabsContent value="influencers">
              <Card className="bg-gradient-card border-0 shadow-card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Beauty Influencers
                  </CardTitle>
                  <CardDescription>Curated creators to learn routines, reviews and tips</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-muted-foreground">Discover trusted creators. Click to play their main video.</div>
                    <div className="w-64 hidden md:block">
                      <Input value={infQuery} onChange={(e) => setInfQuery(e.target.value)} placeholder="Search influencers" />
                    </div>
                  </div>
                  {analyticsLoading ? (
                    <div className="text-sm text-muted-foreground">Loading influencers...</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredInfluencers.map((inf: any, idx: number) => {
                        const vid = ytIdFromUrl(inf.main_video);
                        const displayIndex = String(idx + 1).padStart(2, '0');
                        const isPlaying = playingIdx === idx;
                        return (
                        <Card key={idx} className="overflow-hidden border-0 shadow-card-hover">
                          <CardContent className="p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-baseline gap-3">
                                <div className="text-xl font-bold text-primary">{displayIndex}</div>
                                <div className="text-lg font-semibold">{inf.name}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                {inf.youtube_channel && (
                                  <a href={inf.youtube_channel} target="_blank" rel="noreferrer" className="inline-flex p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100">
                                    <Youtube className="w-4 h-4" />
                                  </a>
                                )}
                                {inf.instagram && (
                                  <a href={inf.instagram} target="_blank" rel="noreferrer" className="inline-flex p-2 rounded-md bg-pink-50 text-pink-600 hover:bg-pink-100">
                                    <Instagram className="w-4 h-4" />
                                  </a>
                                )}
                              </div>
                            </div>
                            {/* Video / Thumbnail */}
                            <div className="relative w-full overflow-hidden rounded-xl aspect-video bg-black">
                              {vid && isPlaying ? (
                                <iframe
                                  src={`https://www.youtube.com/embed/${vid}?autoplay=1`}
                                  title={inf.name}
                                  className="w-full h-full"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                  allowFullScreen
                                  loading="lazy"
                                />
                              ) : (
                                <button className="w-full h-full relative group" onClick={() => setPlayingIdx(idx)}>
                                  <img src={vid ? `https://img.youtube.com/vi/${vid}/hqdefault.jpg` : "/placeholder.svg"} alt={inf.name} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                                      <Play className="w-8 h-8 text-white" />
                                    </div>
                                  </div>
                                </button>
                              )}
                            </div>
                            {inf.notable_products && inf.notable_products.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {inf.notable_products.map((p: string) => (
                                  <Badge key={p} variant="secondary">{p}</Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                        );
                      })}
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


