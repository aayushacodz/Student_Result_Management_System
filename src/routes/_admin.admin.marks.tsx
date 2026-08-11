import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FilePenLine, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { api, errorMessage, queryKeys } from "@/api";
import {
  EmptyState,
  PageHeader,
  SectionCardTitle,
  StatusBadge,
  TableSkeleton,
} from "@/components/common/ui-states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_admin/admin/marks")({
  component: MarksPage,
});

function MarksPage() {
  const qc = useQueryClient();
  const [examId, setExamId] = useState("");
  const [classId, setClassId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);

  const examsQuery = useQuery({
    queryKey: queryKeys.exams({ limit: 50 }),
    queryFn: () => api.exams.getAll({ limit: 50 }),
  });
  const classesQuery = useQuery({
    queryKey: queryKeys.classes({ limit: 50 }),
    queryFn: () => api.classes.getAll({ limit: 50 }),
  });
  const studentsQuery = useQuery({
    queryKey: queryKeys.students({ classId, limit: 100 }),
    queryFn: () => api.students.getAll({ classId, limit: 100 }),
    enabled: Boolean(classId),
  });
  const marksQuery = useQuery({
    queryKey: queryKeys.marks(examId, studentId),
    queryFn: () => api.marks.get(examId, studentId),
    enabled: Boolean(examId && studentId),
  });

  useEffect(() => {
    if (marksQuery.data) {
      const next: Record<string, string> = {};
      marksQuery.data.data.forEach((m) => {
        next[m.subjectId] = m.obtainedMarks === null ? "" : String(m.obtainedMarks);
      });
      setValues(next);
      setDirty(false);
    }
  }, [marksQuery.data]);

  const save = useMutation({
    mutationFn: (draft: boolean) =>
      api.marks.save({
        examId,
        studentId,
        draft,
        marks: (marksQuery.data?.data ?? []).map((m) => ({
          subjectId: m.subjectId,
          obtainedMarks:
            values[m.subjectId] === "" || values[m.subjectId] === undefined
              ? null
              : Number(values[m.subjectId]),
        })),
      }),
    onSuccess: (res) => {
      toast.success(res.message ?? "Marks saved");
      setDirty(false);
      void qc.invalidateQueries({ queryKey: ["marks"] });
      void qc.invalidateQueries({ queryKey: ["results"] });
    },
    onError: (e) => toast.error(errorMessage(e, "Something went wrong while saving marks.")),
  });

  const marks = marksQuery.data?.data ?? [];
  const students = studentsQuery.data?.data ?? [];
  const selectedStudent = students.find((s) => s.id === studentId);
  const invalid = marks.some((m) => {
    const raw = values[m.subjectId];
    if (raw === "" || raw === undefined) return false;
    const n = Number(raw);
    return Number.isNaN(n) || n < 0 || n > m.fullMarks;
  });

  return (
    <>
      <PageHeader
        title="Marks Entry"
        description="Record subject-wise marks for a student in a selected examination."
      />

      <section className="rounded-xl border border-border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label className="mb-1.5 block text-[13px]">Examination</Label>
            <Select value={examId} onValueChange={setExamId}>
              <SelectTrigger>
                <SelectValue placeholder="Select examination" />
              </SelectTrigger>
              <SelectContent>
                {(examsQuery.data?.data ?? []).map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name} · {e.academicYear}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block text-[13px]">Class</Label>
            <Select
              value={classId}
              onValueChange={(v) => {
                setClassId(v);
                setStudentId("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {(classesQuery.data?.data ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block text-[13px]">Student</Label>
            <Select value={studentId} onValueChange={setStudentId} disabled={!classId}>
              <SelectTrigger>
                <SelectValue placeholder={classId ? "Select student" : "Select a class first"} />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} · {s.studentNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {!examId || !studentId ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            icon={FilePenLine}
            title="Select an examination and student"
            description="Subjects load automatically once a student is selected."
          />
        </div>
      ) : (
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border p-5">
            <SectionCardTitle
              title={selectedStudent?.name ?? "Student"}
              {...(selectedStudent
                ? { hint: `${selectedStudent.studentNumber} · ${selectedStudent.className}` }
                : {})}
            />
            {dirty ? <StatusBadge status="PENDING" /> : null}
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Subject</TableHead>
                  <TableHead className="text-right">Full Marks</TableHead>
                  <TableHead className="text-right">Pass Marks</TableHead>
                  <TableHead className="w-[140px] text-right">Obtained</TableHead>
                  <TableHead className="text-right">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marksQuery.isPending ? (
                  <TableSkeleton rows={5} columns={5} />
                ) : (
                  marks.map((m) => {
                    const raw = values[m.subjectId] ?? "";
                    const n = raw === "" ? null : Number(raw);
                    const outOfRange = n !== null && (Number.isNaN(n) || n < 0 || n > m.fullMarks);
                    return (
                      <TableRow key={m.subjectId}>
                        <TableCell className="font-medium text-foreground">
                          {m.subjectName}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{m.fullMarks}</TableCell>
                        <TableCell className="text-right tabular-nums">{m.passMarks}</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min={0}
                            max={m.fullMarks}
                            value={raw}
                            aria-label={`Obtained marks for ${m.subjectName}`}
                            aria-invalid={outOfRange}
                            className="ml-auto w-24 text-right"
                            onChange={(e) => {
                              setValues((v) => ({ ...v, [m.subjectId]: e.target.value }));
                              setDirty(true);
                            }}
                          />
                          {outOfRange ? (
                            <p className="mt-1 text-[12px] text-destructive">
                              0 – {m.fullMarks} only
                            </p>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-right">
                          {n === null || outOfRange ? (
                            <span className="text-[13px] text-subtle-foreground">—</span>
                          ) : (
                            <StatusBadge status={n >= m.passMarks ? "PASS" : "FAIL"} />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border p-4">
            {dirty ? (
              <p className="mr-auto text-[13px] text-muted-foreground">You have unsaved changes.</p>
            ) : null}
            <Button
              variant="outline"
              disabled={save.isPending || invalid}
              onClick={() => save.mutate(true)}
            >
              Save Draft
            </Button>
            <Button disabled={save.isPending || invalid} onClick={() => save.mutate(false)}>
              {save.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Marks
            </Button>
          </div>
        </section>
      )}
    </>
  );
}
