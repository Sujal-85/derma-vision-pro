export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
export const USE_LOCAL_AUTH = (import.meta.env.VITE_USE_LOCAL_AUTH as string | undefined) === "true";

export type CreateAnalysisPayload = {
  userId?: string | null;
  imageDataUrl?: string | null;
  metrics: {
    hydration: number;
    elasticity: number;
    uvProtection: number;
    texture: number;
    overallScore: number;
  };
  concerns: Array<{
    type: string;
    severity: string;
    area: string;
    trend: string;
    confidence: number;
  }>;
  recommendations: Array<{
    category: string;
    items: string[];
  }>;
};

export async function createAnalysis(payload: CreateAnalysisPayload) {
  const res = await fetch(`${API_BASE_URL}/api/analyses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to create analysis: ${res.status}`);
  }
  return res.json();
}

// CSV-based product recommendations via Python service
export async function recommendProductsByAnalysis(payload: {
  metrics: {
    hydration: number;
    elasticity: number;
    uvProtection: number;
    texture: number;
    overallScore?: number;
  };
  concerns: Array<{ type: string; severity?: string; area?: string; trend?: string; confidence?: number }>;
  topK?: number;
}) {
  const res = await fetch(`${API_BASE_URL}/api/skin/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch Python recommendations: ${res.status}`);
  }
  return res.json();
}

export async function getUserAnalyses(userId: string) {
  const res = await fetch(`${API_BASE_URL}/api/analyses/user/${userId}`);
  if (!res.ok) throw new Error(`Failed to fetch analyses: ${res.status}`);
  return res.json();
}

export async function localSignup(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Signup failed: ${res.status}`);
  }
  return res.json();
}

export async function localSignin(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/api/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Signin failed: ${res.status}`);
  }
  return res.json();
}

// Products
export async function getProducts() {
  const res = await fetch(`${API_BASE_URL}/api/products`);
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
  return res.json();
}

export async function recommendProducts(params: { skinType?: string; concern?: string; ageRange?: string }) {
  const q = new URLSearchParams(params as Record<string, string>);
  const res = await fetch(`${API_BASE_URL}/api/products/recommend?${q.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch recommendations: ${res.status}`);
  return res.json();
}

// User Profile
export async function getProfile(userId: string) {
  const res = await fetch(`${API_BASE_URL}/api/profile/${userId}`);
  if (!res.ok) throw new Error(`Failed to fetch profile: ${res.status}`);
  return res.json();
}

export async function upsertProfile(userId: string, data: any) {
  const res = await fetch(`${API_BASE_URL}/api/profile/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to save profile: ${res.status}`);
  return res.json();
}

export async function analyzeSkin(params: { imageDataUrl: string; age?: number; location?: string; symptoms?: string; history?: string }) {
  const res = await fetch(`${API_BASE_URL}/api/skin/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Skin analysis failed: ${res.status}`);
  }
  return res.json();
}

// Advanced skin analysis using Python backend
export async function analyzeSkinAdvanced(formData: FormData) {
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('Calling:', `${API_BASE_URL}/api/skin/analyze-advanced`);
  
  const res = await fetch(`${API_BASE_URL}/api/skin/analyze-advanced`, {
    method: "POST",
    body: formData, // FormData will set Content-Type with boundary automatically
  });
  
  console.log('Response status:', res.status);
  console.log('Response ok:', res.ok);
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('API Error:', err);
    throw new Error(err.error || `Advanced skin analysis failed: ${res.status}`);
  }
  
  const result = await res.json();
  console.log('API Result:', result);
  return result;
}

// Questionnaire API functions
export async function saveQuestionnaireAnswers(userId: string, type: 'skincare' | 'onboarding', answers: any) {
  const res = await fetch(`${API_BASE_URL}/api/profile/${userId}/questionnaire`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, answers }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to save questionnaire answers: ${res.status}`);
  }
  return res.json();
}

export async function getQuestionnaireAnswers(userId: string, type?: 'skincare' | 'onboarding') {
  const url = type 
    ? `${API_BASE_URL}/api/profile/${userId}/questionnaire?type=${type}`
    : `${API_BASE_URL}/api/profile/${userId}/questionnaire`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch questionnaire answers: ${res.status}`);
  }
  return res.json();
}

// Routine API functions
export async function saveRoutine(userId: string, routine: any) {
  const res = await fetch(`${API_BASE_URL}/api/profile/${userId}/routines`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(routine),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to save routine: ${res.status}`);
  }
  return res.json();
}

export async function getSavedRoutines(userId: string) {
  const res = await fetch(`${API_BASE_URL}/api/profile/${userId}/routines`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch saved routines: ${res.status}`);
  }
  return res.json();
}

export async function setActiveRoutine(userId: string, routineId: string) {
  const res = await fetch(`${API_BASE_URL}/api/profile/${userId}/routines/${routineId}/activate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to set active routine: ${res.status}`);
  }
  return res.json();
}

// News API functions
export type NewsArticle = {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  publishedAt: string;
  source: string;
  author?: string;
};

export type NewsResponse = {
  success: boolean;
  articles: NewsArticle[];
  totalResults?: number;
  currentPage?: number;
  pageSize?: number;
  query?: string;
};

export async function getHealthSkincareNews(page: number = 1, pageSize: number = 10): Promise<NewsResponse> {
  const res = await fetch(`${API_BASE_URL}/api/news/health-skincare?page=${page}&pageSize=${pageSize}`);
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch health and skincare news: ${res.status}`);
  }
  
  return res.json();
}

export async function getTrendingNews(): Promise<NewsResponse> {
  const res = await fetch(`${API_BASE_URL}/api/news/trending`);
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch trending news: ${res.status}`);
  }
  
  return res.json();
}

export async function searchNews(query: string, page: number = 1, pageSize: number = 10): Promise<NewsResponse> {
  const res = await fetch(`${API_BASE_URL}/api/news/search?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`);
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to search news: ${res.status}`);
  }
  
  return res.json();
}


// Doctors & Appointments
export async function getDoctors(params: { q?: string; available?: boolean } = {}) {
  const q = new URLSearchParams();
  if (params.q) q.set('q', params.q);
  if (typeof params.available === 'boolean') q.set('available', String(params.available));
  const url = q.toString() ? `${API_BASE_URL}/api/doctors?${q.toString()}` : `${API_BASE_URL}/api/doctors`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch doctors: ${res.status}`);
  }
  return res.json();
}

export type BookAppointmentPayload = {
  doctorId: string;
  doctorName: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  appointmentDate: string | Date;
  appointmentTime: string;
  notes?: string;
};

export async function bookAppointment(payload: BookAppointmentPayload) {
  const res = await fetch(`${API_BASE_URL}/api/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to book appointment: ${res.status}`);
  }
  return res.json();
}

export async function getAppointments(filter: { patientEmail?: string; doctorId?: string } = {}) {
  const q = new URLSearchParams();
  if (filter.patientEmail) q.set('patientEmail', filter.patientEmail);
  if (filter.doctorId) q.set('doctorId', filter.doctorId);
  const url = q.toString() ? `${API_BASE_URL}/api/appointments?${q.toString()}` : `${API_BASE_URL}/api/appointments`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch appointments: ${res.status}`);
  }
  return res.json();
}


