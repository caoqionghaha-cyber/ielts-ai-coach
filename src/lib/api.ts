const API_BASE = "/api";
import type { User, Sentence, PracticeResult, UserError, ReviewItem, DashboardData, Vocabulary, Idea, Essay, EssayPractice, EssayScore } from "./types";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(options.headers as Record<string, string>) };
  if (token) headers["Authorization"] = "Bearer " + token;
  const res = await fetch(API_BASE + endpoint, { ...options, headers });
  if (!res.ok) { const e = await res.json().catch(() => ({ detail: "Request failed" })); throw new Error(e.detail || "Request failed"); }
  return res.json();
}

export const auth = {
  login: (username: string, password: string) => request<{ access_token: string; token_type: string }>("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  register: (email: string, username: string, password: string) => request("/auth/register", { method: "POST", body: JSON.stringify({ email, username, password }) }),
  me: () => request<User>("/auth/me"),
};

export const dashboard = { get: () => request<DashboardData>("/dashboard") };

export const sentences = {
  list: (params?: { topic?: string; search?: string; skip?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.topic) q.set("topic", params.topic);
    if (params?.search) q.set("search", params.search);
    if (params?.skip) q.set("skip", String(params.skip));
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return request<{ sentences: Sentence[]; total: number }>("/sentences" + (qs ? "?" + qs : ""));
  },
  get: (id: number) => request<Sentence>("/sentences/" + id),
  create: (data: { english: string; chinese: string; topic: string; band_level: string; tags: string; source: string }) => request<Sentence>("/sentences", { method: "POST", body: JSON.stringify(data) }),
  batchCreate: (sentences: Array<{ english: string; chinese: string; topic: string; band_level?: string }>) => request<{ message: string; count: number }>("/sentences/batch", { method: "POST", body: JSON.stringify(sentences) }),
  topics: () => request<string[]>("/sentences/topics/list"),
};

export const practice = {
  submit: (sentence_id: number, answer: string) => request<PracticeResult>("/practice/submit", { method: "POST", body: JSON.stringify({ sentence_id, answer }) }),
  history: (skip = 0, limit = 20) => request<PracticeResult[]>("/practice/history?skip=" + skip + "&limit=" + limit),
  stats: (days = 7) => request<{ total_practices: number; average_score: number; days: number }>("/practice/stats?days=" + days),
  errorTraining: (errorType: string | undefined, count: number) => request<{ sentences: Array<{ chinese: string; correct: string; error_type: string }> }>("/practice/error-training?error_type=" + errorType + "&count=" + count),
};

export const errors = {
  list: (error_type?: string) => request<UserError[]>("/errors" + (error_type ? "?error_type=" + error_type : "")),
  stats: () => request<{ total_errors: number; by_type: Record<string, number> }>("/errors/stats"),
  types: () => request<Array<{ type: string; count: number }>>("/errors/types"),
  delete: (id: number) => request<{ message: string }>("/errors/" + id, { method: "DELETE" }),
};

export const review = {
  today: () => request<ReviewItem[]>("/review/today"),
  complete: (id: number, score: number) => request<{ mastery: number; next_review_time: string; message: string }>("/review/" + id + "/complete?score=" + score, { method: "POST" }),
  stats: () => request<{ total_scheduled: number; pending_reviews: number }>("/review/stats"),
};

export const vocabulary = {
  list: (params?: { topic?: string; search?: string }) => { const q = new URLSearchParams(); if (params?.topic) q.set("topic", params.topic); if (params?.search) q.set("search", params.search); const qs = q.toString(); return request<{ vocabulary: Vocabulary[]; total: number }>("/vocabulary" + (qs ? "?" + qs : "")); },
  create: (data: { word: string; meaning: string; synonyms: string; collocations: string; example: string; topic: string; band_level: string }) => request<Vocabulary>("/vocabulary", { method: "POST", body: JSON.stringify(data) }),
  topics: () => request<string[]>("/vocabulary/topics"),
};

export const ideas = {
  list: (params?: { topic?: string; search?: string }) => { const q = new URLSearchParams(); if (params?.topic) q.set("topic", params.topic); if (params?.search) q.set("search", params.search); const qs = q.toString(); return request<{ ideas: Idea[]; total: number }>("/ideas" + (qs ? "?" + qs : "")); },
  create: (data: { topic: string; question: string; position: string; reason: string; explanation: string; example: string; related_words: string; band_level: string }) => request<{ id: number }>("/ideas", { method: "POST", body: JSON.stringify(data) }),
  topics: () => request<string[]>("/ideas/topics"),
};

export const essays = {
  list: (topic?: string) => request<{ essays: Essay[]; total: number }>("/essays" + (topic ? "?topic=" + topic : "")),
  get: (id: number) => request<Essay>("/essays/" + id),
};

export const essayPractice = {
  create: (question: string) => request<{ id: number; question: string }>("/essay-practice", { method: "POST", body: JSON.stringify({ question }) }),
  submit: (id: number, content: string) => request<EssayScore & { id: number; word_count: number }>("/essay-practice/submit", { method: "POST", body: JSON.stringify({ id, content }) }),
};

export const report = {
  get: () => request<{
    total_practices: number; average_score: number; total_errors: number;
    total_reviews: number; total_essays: number; weekly_practices: number;
    score_history: number[]; top_errors: Array<{ type: string; count: number }>;
    continuous_days: number;
  }>("/report"),
};
