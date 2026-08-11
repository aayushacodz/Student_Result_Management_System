/** Central domain types for SRMS. Mirrors the planned PHP REST API contract. */

export type Status = "ACTIVE" | "INACTIVE";
export type ExamStatus = "DRAFT" | "ACTIVE" | "COMPLETED" | "PUBLISHED";
export type ResultStatus = "DRAFT" | "READY" | "PUBLISHED";

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string[]>;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  pagination: Pagination;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: "ADMIN";
  avatarUrl?: string;
}

export interface AuthSession {
  token: string;
  user: Admin;
}

export interface Student {
  id: string;
  studentNumber: string;
  name: string;
  rollNumber: string;
  classId: string;
  className: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  email?: string;
  phone: string;
  address?: string;
  status: Status;
}

export type StudentPayload = Omit<Student, "id" | "className">;

export interface SchoolClass {
  id: string;
  name: string;
  section?: string;
  studentCount: number;
  subjectCount: number;
  status: Status;
}

export type ClassPayload = Pick<SchoolClass, "name" | "section" | "status">;

export interface Subject {
  id: string;
  code: string;
  name: string;
  classId: string;
  className: string;
  fullMarks: number;
  passMarks: number;
  status: Status;
}

export type SubjectPayload = Omit<Subject, "id" | "className">;

export interface Exam {
  id: string;
  name: string;
  academicYear: string;
  term: string;
  examDate: string;
  studentCount: number;
  description?: string;
  status: ExamStatus;
}

export type ExamPayload = Omit<Exam, "id" | "studentCount">;

export interface Mark {
  id: string;
  examId: string;
  studentId: string;
  subjectId: string;
  subjectName: string;
  fullMarks: number;
  passMarks: number;
  obtainedMarks: number | null;
}

export interface MarkEntryPayload {
  examId: string;
  studentId: string;
  marks: Array<{ subjectId: string; obtainedMarks: number | null }>;
  draft?: boolean;
}

export interface ResultSubject {
  subjectId: string;
  subjectName: string;
  fullMarks: number;
  passMarks: number;
  obtainedMarks: number;
  grade: string;
}

export interface Result {
  id: string;
  student: {
    id: string;
    studentNumber: string;
    name: string;
    rollNumber: string;
    classId: string;
    className: string;
  };
  examination: {
    id: string;
    name: string;
    academicYear: string;
    term: string;
  };
  subjects: ResultSubject[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  gpa: number;
  grade: string;
  remarks: string;
  status: ResultStatus;
  publishedAt?: string | null;
}

export interface DashboardStats {
  students: number;
  classes: number;
  subjects: number;
  examinations: number;
  publishedResults: number;
  resultBreakdown: { published: number; ready: number; draft: number };
}

export interface PublicResultQuery {
  studentNumber: string;
  classId: string;
  examId?: string;
}

export interface ListQuery {
  search?: string;
  classId?: string;
  examId?: string;
  status?: string;
  page?: number;
  limit?: number;
}
