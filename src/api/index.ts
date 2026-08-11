import { mockApi, ApiError } from "./mockApi";
import type { ListQuery, PublicResultQuery } from "@/types";

/**
 * CENTRAL API LAYER.
 * Pages must never call fetch/axios directly — they call `api.<section>.<action>()`.
 * Switching to the real PHP backend = set VITE_USE_MOCK_API=false + VITE_API_BASE_URL.
 */

export const API_BASE_URL =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined) ?? "http://localhost/srms-api/api";

export const USE_MOCK_API =
  ((import.meta.env["VITE_USE_MOCK_API"] as string | undefined) ?? "true") !== "false";

export const TOKEN_STORAGE_KEY = "srms_admin_token";
export const USER_STORAGE_KEY = "srms_admin_user";

/** Planned PHP REST endpoints — the single source of truth for URLs. */
export const endpoints = {
  auth: { login: "/auth/login", logout: "/auth/logout", me: "/auth/me" },
  dashboard: { stats: "/dashboard/stats", recentResults: "/dashboard/recent-results" },
  students: { list: "/students", byId: (id: string) => `/students/${id}` },
  classes: {
    list: "/classes",
    byId: (id: string) => `/classes/${id}`,
    subjects: (classId: string) => `/classes/${classId}/subjects`,
  },
  subjects: { list: "/subjects", byId: (id: string) => `/subjects/${id}` },
  exams: { list: "/exams", byId: (id: string) => `/exams/${id}` },
  marks: {
    list: "/marks",
    byStudent: (studentId: string) => `/marks/student/${studentId}`,
    byExam: (examId: string) => `/marks/exam/${examId}`,
    byId: (id: string) => `/marks/${id}`,
  },
  results: {
    list: "/results",
    byId: (id: string) => `/results/${id}`,
    generate: "/results/generate",
    publish: (id: string) => `/results/${id}/publish`,
    unpublish: (id: string) => `/results/${id}/unpublish`,
  },
  publicResults: { search: "/public/results/search" },
} as const;

function authToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

function qs(params: Record<string, unknown> | undefined) {
  if (!params) return "";
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "" && v !== "ALL") search.append(k, String(v));
  });
  const s = search.toString();
  return s ? `?${s}` : "";
}

/** Thin HTTP client used once the PHP backend exists. */
async function request<T>(path: string, init?: RequestInit & { params?: Record<string, unknown> }): Promise<T> {
  const token = authToken();
  const res = await fetch(`${API_BASE_URL}${path}${qs(init?.params)}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  const payload = body as { success?: boolean; message?: string } | null;

  if (!res.ok || payload?.success === false) {
    throw new ApiError(payload?.message ?? "Something went wrong. Please try again.", res.status);
  }
  return body as T;
}

type Api = typeof mockApi;

const httpApi: Api = {
  auth: {
    login: (email, password) =>
      request(endpoints.auth.login, { method: "POST", body: JSON.stringify({ email, password }) }),
    logout: () => request(endpoints.auth.logout, { method: "POST" }),
    me: () => request(endpoints.auth.me),
  },
  dashboard: {
    getStats: () => request(endpoints.dashboard.stats),
    getRecentResults: () => request(endpoints.dashboard.recentResults),
  },
  students: {
    getAll: (query?: ListQuery) => request(endpoints.students.list, { params: query as Record<string, unknown> }),
    getById: (id) => request(endpoints.students.byId(id)),
    create: (data) => request(endpoints.students.list, { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => request(endpoints.students.byId(id), { method: "PUT", body: JSON.stringify(data) }),
    delete: (id) => request(endpoints.students.byId(id), { method: "DELETE" }),
  },
  classes: {
    getAll: (query?: ListQuery) => request(endpoints.classes.list, { params: query as Record<string, unknown> }),
    create: (data) => request(endpoints.classes.list, { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => request(endpoints.classes.byId(id), { method: "PUT", body: JSON.stringify(data) }),
    delete: (id) => request(endpoints.classes.byId(id), { method: "DELETE" }),
  },
  subjects: {
    getAll: (query?: ListQuery) => request(endpoints.subjects.list, { params: query as Record<string, unknown> }),
    getByClass: (classId) => request(endpoints.classes.subjects(classId)),
    create: (data) => request(endpoints.subjects.list, { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => request(endpoints.subjects.byId(id), { method: "PUT", body: JSON.stringify(data) }),
    delete: (id) => request(endpoints.subjects.byId(id), { method: "DELETE" }),
  },
  exams: {
    getAll: (query?: ListQuery) => request(endpoints.exams.list, { params: query as Record<string, unknown> }),
    getById: (id) => request(endpoints.exams.byId(id)),
    create: (data) => request(endpoints.exams.list, { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => request(endpoints.exams.byId(id), { method: "PUT", body: JSON.stringify(data) }),
    delete: (id) => request(endpoints.exams.byId(id), { method: "DELETE" }),
  },
  marks: {
    get: (examId, studentId) => request(endpoints.marks.list, { params: { examId, studentId } }),
    save: (payload) => request(endpoints.marks.list, { method: "POST", body: JSON.stringify(payload) }),
  },
  results: {
    getAll: (query?: ListQuery) => request(endpoints.results.list, { params: query as Record<string, unknown> }),
    getById: (id) => request(endpoints.results.byId(id)),
    generate: (examId, studentId) =>
      request(endpoints.results.generate, { method: "POST", body: JSON.stringify({ examId, studentId }) }),
    publish: (id) => request(endpoints.results.publish(id), { method: "POST" }),
    unpublish: (id) => request(endpoints.results.unpublish(id), { method: "POST" }),
    search: (query: PublicResultQuery) =>
      request(endpoints.publicResults.search, { params: query as unknown as Record<string, unknown> }),
  },
};

export const api: Api = USE_MOCK_API ? mockApi : httpApi;

export { ApiError };

/** Organised React Query keys. */
export const queryKeys = {
  dashboard: ["dashboard"] as const,
  recentResults: ["dashboard", "recent-results"] as const,
  students: (query?: ListQuery) => ["students", query ?? {}] as const,
  student: (id: string) => ["students", id] as const,
  classes: (query?: ListQuery) => ["classes", query ?? {}] as const,
  subjects: (query?: ListQuery) => ["subjects", query ?? {}] as const,
  subjectsByClass: (classId: string) => ["subjects", "class", classId] as const,
  exams: (query?: ListQuery) => ["exams", query ?? {}] as const,
  marks: (examId: string, studentId: string) => ["marks", examId, studentId] as const,
  results: (query?: ListQuery) => ["results", query ?? {}] as const,
  result: (id: string) => ["results", id] as const,
};

/** Friendly error message extraction — never surface raw technical errors. */
export function errorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message && error.message.length < 140) return error.message;
  return fallback;
}
