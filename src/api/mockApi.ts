import { gradeFor, remarksFor, round } from "@/lib/grading";
import {
  DEMO_ADMIN,
  mockAdmin,
  mockClasses,
  mockExams,
  mockMarks,
  mockResults,
  mockStudents,
  mockSubjects,
} from "./mockData";
import type {
  ApiResponse,
  AuthSession,
  DashboardStats,
  Exam,
  ExamPayload,
  ListQuery,
  Mark,
  MarkEntryPayload,
  PaginatedResponse,
  Result,
  ResultStatus,
  SchoolClass,
  ClassPayload,
  Student,
  StudentPayload,
  Subject,
  SubjectPayload,
  PublicResultQuery,
} from "@/types";

/** In-memory store so the prototype behaves like a real backend during a session. */
const db = {
  students: structuredClone(mockStudents) as Student[],
  classes: structuredClone(mockClasses) as SchoolClass[],
  subjects: structuredClone(mockSubjects) as Subject[],
  exams: structuredClone(mockExams) as Exam[],
  marks: structuredClone(mockMarks) as Mark[],
  results: structuredClone(mockResults) as Result[],
};

const delay = (ms = 420) => new Promise((r) => setTimeout(r, ms));
const ok = <T>(data: T, message = "Operation successful"): ApiResponse<T> => ({
  success: true,
  message,
  data,
});

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function paginate<T>(rows: T[], query?: ListQuery): PaginatedResponse<T> {
  const page = query?.page ?? 1;
  const limit = query?.limit ?? 10;
  const total = rows.length;
  return {
    success: true,
    data: rows.slice((page - 1) * limit, page * limit),
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

const nextId = (prefix: string, rows: Array<{ id: string }>) =>
  `${prefix}${String(rows.length + 1).padStart(3, "0")}-${Math.floor(Math.random() * 900 + 100)}`;

const className = (classId: string) => db.classes.find((c) => c.id === classId)?.name ?? "—";

function syncClassCounts() {
  db.classes.forEach((c) => {
    c.studentCount = db.students.filter((s) => s.classId === c.id).length;
    c.subjectCount = db.subjects.filter((s) => s.classId === c.id).length;
  });
}

function buildResult(examId: string, studentId: string, status: ResultStatus): Result {
  const student = db.students.find((s) => s.id === studentId);
  const exam = db.exams.find((e) => e.id === examId);
  if (!student || !exam) throw new ApiError("Student or examination not found", 404);

  const rows = db.marks
    .filter((m) => m.examId === examId && m.studentId === studentId && m.obtainedMarks !== null)
    .map((m) => ({
      subjectId: m.subjectId,
      subjectName: m.subjectName,
      fullMarks: m.fullMarks,
      passMarks: m.passMarks,
      obtainedMarks: m.obtainedMarks as number,
      grade: gradeFor(((m.obtainedMarks as number) / m.fullMarks) * 100).grade,
    }));

  if (!rows.length) throw new ApiError("No marks recorded for this student in this examination", 422);

  const totalMarks = rows.reduce((a, r) => a + r.fullMarks, 0);
  const obtainedMarks = rows.reduce((a, r) => a + r.obtainedMarks, 0);
  const percentage = round((obtainedMarks / totalMarks) * 100, 2);
  const g = gradeFor(percentage);

  return {
    id: `RES-${examId}-${studentId}`,
    student: {
      id: student.id,
      studentNumber: student.studentNumber,
      name: student.name,
      rollNumber: student.rollNumber,
      classId: student.classId,
      className: student.className,
    },
    examination: {
      id: exam.id,
      name: exam.name,
      academicYear: exam.academicYear,
      term: exam.term,
    },
    subjects: rows,
    totalMarks,
    obtainedMarks,
    percentage,
    gpa: round(g.point, 2),
    grade: g.grade,
    remarks: remarksFor(percentage),
    status,
    publishedAt: status === "PUBLISHED" ? new Date().toISOString() : null,
  };
}

export const mockApi = {
  auth: {
    async login(email: string, password: string): Promise<ApiResponse<AuthSession>> {
      await delay(600);
      if (email.trim().toLowerCase() !== DEMO_ADMIN.email || password !== DEMO_ADMIN.password) {
        throw new ApiError("Invalid email or password.", 401);
      }
      return ok({ token: `mock.${btoa(email)}.${Date.now()}`, user: mockAdmin }, "Signed in");
    },
    async logout(): Promise<ApiResponse<null>> {
      await delay(150);
      return ok(null, "Signed out");
    },
    async me(): Promise<ApiResponse<typeof mockAdmin>> {
      await delay(150);
      return ok(mockAdmin);
    },
  },

  dashboard: {
    async getStats(): Promise<ApiResponse<DashboardStats>> {
      await delay();
      const breakdown = {
        published: db.results.filter((r) => r.status === "PUBLISHED").length,
        ready: db.results.filter((r) => r.status === "READY").length,
        draft: db.results.filter((r) => r.status === "DRAFT").length,
      };
      return ok({
        students: db.students.length,
        classes: db.classes.length,
        subjects: db.subjects.length,
        examinations: db.exams.length,
        publishedResults: breakdown.published,
        resultBreakdown: breakdown,
      });
    },
    async getRecentResults(): Promise<ApiResponse<Result[]>> {
      await delay();
      return ok([...db.results].sort((a, b) => b.percentage - a.percentage).slice(0, 6));
    },
  },

  students: {
    async getAll(query?: ListQuery): Promise<PaginatedResponse<Student>> {
      await delay();
      const term = query?.search?.trim().toLowerCase();
      const rows = db.students.filter((s) => {
        if (term && !`${s.name} ${s.studentNumber} ${s.rollNumber}`.toLowerCase().includes(term)) return false;
        if (query?.classId && query.classId !== "ALL" && s.classId !== query.classId) return false;
        if (query?.status && query.status !== "ALL" && s.status !== query.status) return false;
        return true;
      });
      return paginate(rows, query);
    },
    async getById(id: string): Promise<ApiResponse<Student>> {
      await delay(250);
      const s = db.students.find((x) => x.id === id);
      if (!s) throw new ApiError("Student not found", 404);
      return ok(s);
    },
    async create(payload: StudentPayload): Promise<ApiResponse<Student>> {
      await delay(500);
      if (db.students.some((s) => s.studentNumber.toLowerCase() === payload.studentNumber.toLowerCase()))
        throw new ApiError("Student number already exists.", 422);
      const student: Student = { ...payload, id: nextId("STD", db.students), className: className(payload.classId) };
      db.students.unshift(student);
      syncClassCounts();
      return ok(student, "Student created");
    },
    async update(id: string, payload: StudentPayload): Promise<ApiResponse<Student>> {
      await delay(500);
      const idx = db.students.findIndex((s) => s.id === id);
      if (idx < 0) throw new ApiError("Student not found", 404);
      const updated: Student = { ...db.students[idx]!, ...payload, className: className(payload.classId) };
      db.students[idx] = updated;
      syncClassCounts();
      return ok(updated, "Student updated");
    },
    async delete(id: string): Promise<ApiResponse<null>> {
      await delay(400);
      db.students = db.students.filter((s) => s.id !== id);
      syncClassCounts();
      return ok(null, "Student deleted");
    },
  },

  classes: {
    async getAll(query?: ListQuery): Promise<PaginatedResponse<SchoolClass>> {
      await delay();
      const term = query?.search?.trim().toLowerCase();
      const rows = db.classes.filter((c) => (term ? c.name.toLowerCase().includes(term) : true));
      return paginate(rows, { ...query, limit: query?.limit ?? 20 });
    },
    async create(payload: ClassPayload): Promise<ApiResponse<SchoolClass>> {
      await delay(450);
      const row: SchoolClass = { ...payload, id: nextId("CLS", db.classes), studentCount: 0, subjectCount: 0 };
      db.classes.push(row);
      return ok(row, "Class created");
    },
    async update(id: string, payload: ClassPayload): Promise<ApiResponse<SchoolClass>> {
      await delay(450);
      const idx = db.classes.findIndex((c) => c.id === id);
      if (idx < 0) throw new ApiError("Class not found", 404);
      const updated = { ...db.classes[idx]!, ...payload };
      db.classes[idx] = updated;
      return ok(updated, "Class updated");
    },
    async delete(id: string): Promise<ApiResponse<null>> {
      await delay(400);
      db.classes = db.classes.filter((c) => c.id !== id);
      return ok(null, "Class deleted");
    },
  },

  subjects: {
    async getAll(query?: ListQuery): Promise<PaginatedResponse<Subject>> {
      await delay();
      const term = query?.search?.trim().toLowerCase();
      const rows = db.subjects.filter((s) => {
        if (term && !`${s.code} ${s.name}`.toLowerCase().includes(term)) return false;
        if (query?.classId && query.classId !== "ALL" && s.classId !== query.classId) return false;
        return true;
      });
      return paginate(rows, { ...query, limit: query?.limit ?? 10 });
    },
    async getByClass(classId: string): Promise<ApiResponse<Subject[]>> {
      await delay(300);
      return ok(db.subjects.filter((s) => s.classId === classId));
    },
    async create(payload: SubjectPayload): Promise<ApiResponse<Subject>> {
      await delay(450);
      const row: Subject = { ...payload, id: nextId("SUB", db.subjects), className: className(payload.classId) };
      db.subjects.push(row);
      syncClassCounts();
      return ok(row, "Subject created");
    },
    async update(id: string, payload: SubjectPayload): Promise<ApiResponse<Subject>> {
      await delay(450);
      const idx = db.subjects.findIndex((s) => s.id === id);
      if (idx < 0) throw new ApiError("Subject not found", 404);
      const updated: Subject = { ...db.subjects[idx]!, ...payload, className: className(payload.classId) };
      db.subjects[idx] = updated;
      syncClassCounts();
      return ok(updated, "Subject updated");
    },
    async delete(id: string): Promise<ApiResponse<null>> {
      await delay(400);
      db.subjects = db.subjects.filter((s) => s.id !== id);
      syncClassCounts();
      return ok(null, "Subject deleted");
    },
  },

  exams: {
    async getAll(query?: ListQuery): Promise<PaginatedResponse<Exam>> {
      await delay();
      const term = query?.search?.trim().toLowerCase();
      const rows = db.exams.filter((e) => {
        if (term && !`${e.name} ${e.academicYear}`.toLowerCase().includes(term)) return false;
        if (query?.status && query.status !== "ALL" && e.status !== query.status) return false;
        return true;
      });
      return paginate(rows, { ...query, limit: query?.limit ?? 20 });
    },
    async getById(id: string): Promise<ApiResponse<Exam>> {
      await delay(250);
      const e = db.exams.find((x) => x.id === id);
      if (!e) throw new ApiError("Examination not found", 404);
      return ok(e);
    },
    async create(payload: ExamPayload): Promise<ApiResponse<Exam>> {
      await delay(450);
      const row: Exam = { ...payload, id: nextId("EXAM", db.exams), studentCount: db.students.length };
      db.exams.push(row);
      return ok(row, "Examination created");
    },
    async update(id: string, payload: ExamPayload): Promise<ApiResponse<Exam>> {
      await delay(450);
      const idx = db.exams.findIndex((e) => e.id === id);
      if (idx < 0) throw new ApiError("Examination not found", 404);
      const updated = { ...db.exams[idx]!, ...payload };
      db.exams[idx] = updated;
      return ok(updated, "Examination updated");
    },
    async delete(id: string): Promise<ApiResponse<null>> {
      await delay(400);
      db.exams = db.exams.filter((e) => e.id !== id);
      return ok(null, "Examination deleted");
    },
  },

  marks: {
    async get(examId: string, studentId: string): Promise<ApiResponse<Mark[]>> {
      await delay(400);
      const student = db.students.find((s) => s.id === studentId);
      if (!student) throw new ApiError("Student not found", 404);
      const subjects = db.subjects.filter((s) => s.classId === student.classId);
      return ok(
        subjects.map((subject) => {
          const existing = db.marks.find(
            (m) => m.examId === examId && m.studentId === studentId && m.subjectId === subject.id,
          );
          return (
            existing ?? {
              id: `MRK-${examId}-${studentId}-${subject.id}`,
              examId,
              studentId,
              subjectId: subject.id,
              subjectName: subject.name,
              fullMarks: subject.fullMarks,
              passMarks: subject.passMarks,
              obtainedMarks: null,
            }
          );
        }),
      );
    },
    async save(payload: MarkEntryPayload): Promise<ApiResponse<null>> {
      await delay(600);
      payload.marks.forEach((entry) => {
        const idx = db.marks.findIndex(
          (m) => m.examId === payload.examId && m.studentId === payload.studentId && m.subjectId === entry.subjectId,
        );
        const subject = db.subjects.find((s) => s.id === entry.subjectId);
        if (!subject) return;
        if (idx >= 0) db.marks[idx]!.obtainedMarks = entry.obtainedMarks;
        else
          db.marks.push({
            id: `MRK-${payload.examId}-${payload.studentId}-${entry.subjectId}`,
            examId: payload.examId,
            studentId: payload.studentId,
            subjectId: subject.id,
            subjectName: subject.name,
            fullMarks: subject.fullMarks,
            passMarks: subject.passMarks,
            obtainedMarks: entry.obtainedMarks,
          });
      });
      return ok(null, payload.draft ? "Draft saved" : "Marks saved");
    },
  },

  results: {
    async getAll(query?: ListQuery): Promise<PaginatedResponse<Result>> {
      await delay();
      const term = query?.search?.trim().toLowerCase();
      const rows = db.results.filter((r) => {
        if (term && !`${r.student.name} ${r.student.studentNumber}`.toLowerCase().includes(term)) return false;
        if (query?.classId && query.classId !== "ALL" && r.student.classId !== query.classId) return false;
        if (query?.examId && query.examId !== "ALL" && r.examination.id !== query.examId) return false;
        if (query?.status && query.status !== "ALL" && r.status !== query.status) return false;
        return true;
      });
      return paginate(rows, query);
    },
    async getById(id: string): Promise<ApiResponse<Result>> {
      await delay(350);
      const r = db.results.find((x) => x.id === id);
      if (!r) throw new ApiError("Result not found", 404);
      return ok(r);
    },
    async generate(examId: string, studentId: string): Promise<ApiResponse<Result>> {
      await delay(700);
      const result = buildResult(examId, studentId, "READY");
      const idx = db.results.findIndex((r) => r.id === result.id);
      if (idx >= 0) db.results[idx] = { ...result, status: db.results[idx]!.status === "PUBLISHED" ? "PUBLISHED" : "READY" };
      else db.results.unshift(result);
      return ok(result, "Result generated");
    },
    async publish(id: string): Promise<ApiResponse<Result>> {
      await delay(600);
      const r = db.results.find((x) => x.id === id);
      if (!r) throw new ApiError("Result not found", 404);
      r.status = "PUBLISHED";
      r.publishedAt = new Date().toISOString();
      return ok(r, "Result published");
    },
    async unpublish(id: string): Promise<ApiResponse<Result>> {
      await delay(600);
      const r = db.results.find((x) => x.id === id);
      if (!r) throw new ApiError("Result not found", 404);
      r.status = "READY";
      r.publishedAt = null;
      return ok(r, "Result unpublished");
    },
    async search(query: PublicResultQuery): Promise<ApiResponse<Result>> {
      await delay(800);
      const student = db.students.find(
        (s) => s.studentNumber.toLowerCase() === query.studentNumber.trim().toLowerCase() && s.classId === query.classId,
      );
      if (!student) throw new ApiError("No student record matches the details provided.", 404);
      const matches = db.results.filter(
        (r) => r.student.id === student.id && (!query.examId || query.examId === "ALL" || r.examination.id === query.examId),
      );
      if (!matches.length) throw new ApiError("No examination result exists for these details.", 404);
      const published = matches.find((r) => r.status === "PUBLISHED");
      if (!published) throw new ApiError("This examination result has not been published yet.", 409);
      return ok(published);
    },
  },
};
