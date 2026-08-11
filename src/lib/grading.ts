import type { ResultStatus } from "@/types";

/** Grade + GPA computation shared by mock API and UI previews. */
export function gradeFor(percent: number): { grade: string; point: number } {
  if (percent >= 90) return { grade: "A+", point: 4.0 };
  if (percent >= 80) return { grade: "A", point: 3.6 };
  if (percent >= 70) return { grade: "B+", point: 3.2 };
  if (percent >= 60) return { grade: "B", point: 2.8 };
  if (percent >= 50) return { grade: "C+", point: 2.4 };
  if (percent >= 40) return { grade: "C", point: 2.0 };
  if (percent >= 35) return { grade: "D", point: 1.6 };
  return { grade: "NG", point: 0 };
}

export function remarksFor(percent: number): string {
  if (percent >= 85) return "Outstanding";
  if (percent >= 75) return "Excellent";
  if (percent >= 60) return "Very Good";
  if (percent >= 45) return "Satisfactory";
  if (percent >= 35) return "Needs Improvement";
  return "Unsatisfactory";
}

export const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

export const resultStatusTone: Record<ResultStatus, "success" | "info" | "muted"> = {
  PUBLISHED: "success",
  READY: "info",
  DRAFT: "muted",
};
