import { gradeFor, remarksFor, round } from "@/lib/grading";
import type {
  Admin,
  Exam,
  Mark,
  Result,
  SchoolClass,
  Student,
  Subject,
} from "@/types";

/**
 * Centralized mock dataset. This is the ONLY place static records live.
 * Replaced entirely by the PHP backend once USE_MOCK_API is false.
 */

export const INSTITUTION = {
  name: "Reliance College",
  system: "Student Result Management System",
  short: "RC",
  subtitle: "Saraswatinagar, Chabahil, Kathmandu",
  address: "Saraswatinagar, Chabahil, Kathmandu, Nepal",
  website: "https://riacollege.edu.np/",
  email: "info@riacollege.edu.np",
  phone: "977-1-4822336",
  established: "2050 BS",
  affiliation: "Tribhuvan University (TU)",
};

export const DEMO_ADMIN = {
  email: "admin@srms.edu.np",
  password: "Admin@123",
};

export const mockAdmin: Admin = {
  id: "ADM001",
  name: "Administrator",
  email: DEMO_ADMIN.email,
  role: "ADMIN",
};

export const mockClasses: SchoolClass[] = [
  { id: "CLS01", name: "BCA I Semester", section: "A", studentCount: 0, subjectCount: 0, status: "ACTIVE" },
  { id: "CLS02", name: "BCA II Semester", section: "A", studentCount: 0, subjectCount: 0, status: "ACTIVE" },
  { id: "CLS03", name: "BCA III Semester", section: "A", studentCount: 0, subjectCount: 0, status: "ACTIVE" },
  { id: "CLS04", name: "BCA IV Semester", section: "B", studentCount: 0, subjectCount: 0, status: "ACTIVE" },
  { id: "CLS05", name: "BCA V Semester", section: "A", studentCount: 0, subjectCount: 0, status: "INACTIVE" },
];

const subjectSeed: Array<[string, string, string]> = [
  ["CS101", "Computer Fundamentals", "CLS01"],
  ["MTH101", "Mathematics I", "CLS01"],
  ["ENG101", "English Composition", "CLS01"],
  ["CS102", "Programming in C", "CLS01"],
  ["ACC101", "Financial Accounting", "CLS01"],
  ["CS201", "Object Oriented Programming", "CLS02"],
  ["CS202", "Web Technology", "CLS02"],
  ["MTH201", "Discrete Mathematics", "CLS02"],
  ["STA201", "Statistics I", "CLS02"],
  ["MGT201", "Principles of Management", "CLS02"],
  ["CS301", "Data Structures & Algorithms", "CLS03"],
  ["CS302", "Database Management System", "CLS03"],
  ["CS303", "Operating Systems", "CLS03"],
  ["CS304", "Numerical Methods", "CLS03"],
  ["MGT301", "Organizational Behaviour", "CLS03"],
  ["CS401", "Software Engineering", "CLS04"],
  ["CS402", "Computer Networks", "CLS04"],
  ["CS403", "Web Technology II", "CLS04"],
  ["CS404", "Applied Economics", "CLS04"],
];

export const mockSubjects: Subject[] = subjectSeed.map(([code, name, classId], i) => ({
  id: `SUB${String(i + 1).padStart(3, "0")}`,
  code,
  name,
  classId,
  className: mockClasses.find((c) => c.id === classId)!.name,
  fullMarks: 100,
  passMarks: 40,
  status: "ACTIVE",
}));

const studentSeed: Array<[string, string, string, string]> = [
  ["Aayusha Shrestha", "CLS01", "9841234501", "aayusha.shrestha@srms.edu.np"],
  ["Sampada Karki", "CLS01", "9841234502", "sampada.karki@srms.edu.np"],
  ["Aarav Adhikari", "CLS01", "9841234503", "aarav.adhikari@srms.edu.np"],
  ["Nisha Karki", "CLS01", "9841234504", "nisha.karki@srms.edu.np"],
  ["Rohan Shrestha", "CLS02", "9841234505", "rohan.shrestha@srms.edu.np"],
  ["Sujal Thapa", "CLS02", "9841234506", "sujal.thapa@srms.edu.np"],
  ["Pratiksha Rai", "CLS02", "9841234507", "pratiksha.rai@srms.edu.np"],
  ["Sagar Gautam", "CLS02", "9841234508", "sagar.gautam@srms.edu.np"],
  ["Bibek Lamichhane", "CLS03", "9841234509", "bibek.lamichhane@srms.edu.np"],
  ["Anisha Maharjan", "CLS03", "9841234510", "anisha.maharjan@srms.edu.np"],
  ["Kritika Bhandari", "CLS03", "9841234511", "kritika.bhandari@srms.edu.np"],
  ["Manish Poudel", "CLS03", "9841234512", "manish.poudel@srms.edu.np"],
  ["Sneha Tamang", "CLS03", "9841234513", "sneha.tamang@srms.edu.np"],
  ["Prashant Basnet", "CLS04", "9841234514", "prashant.basnet@srms.edu.np"],
  ["Riya Joshi", "CLS04", "9841234515", "riya.joshi@srms.edu.np"],
  ["Dipesh Khadka", "CLS04", "9841234516", "dipesh.khadka@srms.edu.np"],
  ["Sarita Chaudhary", "CLS04", "9841234517", "sarita.chaudhary@srms.edu.np"],
  ["Nabin Ghimire", "CLS05", "9841234518", "nabin.ghimire@srms.edu.np"],
  ["Ashmita Dahal", "CLS05", "9841234519", "ashmita.dahal@srms.edu.np"],
  ["Kiran Magar", "CLS05", "9841234520", "kiran.magar@srms.edu.np"],
];

const rollCounter: Record<string, number> = {};

export const mockStudents: Student[] = studentSeed.map(([name, classId, phone, email], i) => {
  rollCounter[classId] = (rollCounter[classId] ?? 0) + 1;
  return {
    id: `STD${String(i + 1).padStart(3, "0")}`,
    studentNumber: `STU-2083-${String(i + 1).padStart(3, "0")}`,
    name,
    rollNumber: String(rollCounter[classId]).padStart(2, "0"),
    classId,
    className: mockClasses.find((c) => c.id === classId)!.name,
    dateOfBirth: `200${(i % 5) + 2}-0${(i % 9) + 1}-1${i % 9}`,
    gender: i % 2 === 0 ? "FEMALE" : "MALE",
    email,
    phone,
    address: (["Lalitpur", "Kathmandu", "Bhaktapur", "Pokhara", "Chitwan"][i % 5] as string),
    status: i % 11 === 10 ? "INACTIVE" : "ACTIVE",
  };
});

export const mockExams: Exam[] = [
  {
    id: "EXAM001",
    name: "First Terminal Examination",
    academicYear: "2083",
    term: "First Term",
    examDate: "2026-03-12",
    studentCount: 20,
    description: "Internal terminal examination for all running semesters.",
    status: "PUBLISHED",
  },
  {
    id: "EXAM002",
    name: "Second Terminal Examination",
    academicYear: "2083",
    term: "Second Term",
    examDate: "2026-06-18",
    studentCount: 20,
    description: "Mid-year assessment across all subjects.",
    status: "COMPLETED",
  },
  {
    id: "EXAM003",
    name: "Final Examination",
    academicYear: "2083",
    term: "Final Term",
    examDate: "2026-09-24",
    studentCount: 20,
    description: "Board-standard final examination.",
    status: "ACTIVE",
  },
  {
    id: "EXAM004",
    name: "Pre-Board Examination",
    academicYear: "2082",
    term: "Final Term",
    examDate: "2025-11-08",
    studentCount: 18,
    description: "Preparation examination held before the board exam.",
    status: "DRAFT",
  },
];

/* ---------- derived marks + results ---------- */

function pseudoScore(seed: string, full: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 9973;
  const base = 42 + (h % 52); // 42..93
  return Math.min(full, base);
}

export const mockMarks: Mark[] = [];
export const mockResults: Result[] = [];

const resultExams = mockExams.filter((e) => e.id === "EXAM001" || e.id === "EXAM002" || e.id === "EXAM003");

mockStudents.forEach((student) => {
  const subjects = mockSubjects.filter((s) => s.classId === student.classId);
  resultExams.forEach((exam) => {
    const rows = subjects.map((subject) => {
      const obtained = pseudoScore(`${student.id}${exam.id}${subject.id}`, subject.fullMarks);
      mockMarks.push({
        id: `MRK-${exam.id}-${student.id}-${subject.id}`,
        examId: exam.id,
        studentId: student.id,
        subjectId: subject.id,
        subjectName: subject.name,
        fullMarks: subject.fullMarks,
        passMarks: subject.passMarks,
        obtainedMarks: obtained,
      });
      return {
        subjectId: subject.id,
        subjectName: subject.name,
        fullMarks: subject.fullMarks,
        passMarks: subject.passMarks,
        obtainedMarks: obtained,
        grade: gradeFor((obtained / subject.fullMarks) * 100).grade,
      };
    });

    if (!rows.length) return;

    const totalMarks = rows.reduce((a, r) => a + r.fullMarks, 0);
    const obtainedMarks = rows.reduce((a, r) => a + r.obtainedMarks, 0);
    const percentage = round((obtainedMarks / totalMarks) * 100, 2);
    const g = gradeFor(percentage);
    const status: Result["status"] =
      exam.id === "EXAM001" ? "PUBLISHED" : exam.id === "EXAM002" ? "READY" : "DRAFT";

    mockResults.push({
      id: `RES-${exam.id}-${student.id}`,
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
      publishedAt: status === "PUBLISHED" ? "2026-04-02T09:30:00Z" : null,
    });
  });
});

mockClasses.forEach((c) => {
  c.studentCount = mockStudents.filter((s) => s.classId === c.id).length;
  c.subjectCount = mockSubjects.filter((s) => s.classId === c.id).length;
});
