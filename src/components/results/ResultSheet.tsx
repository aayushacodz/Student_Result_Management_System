import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/common/ui-states";
import { INSTITUTION } from "@/api/mockData";
import { BrandMark } from "@/components/common/brand";
import type { Result } from "@/types";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[12px] uppercase tracking-wide text-subtle-foreground">{label}</p>
      <p className="mt-0.5 truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function Summary({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-4 py-3">
      <p className="text-[12px] uppercase tracking-wide text-subtle-foreground">{label}</p>
      <p className={strong ? "mt-1 text-xl font-semibold text-primary" : "mt-1 text-lg font-semibold text-foreground"}>
        {value}
      </p>
    </div>
  );
}

export function ResultSheet({ result }: { result: Result }) {
  return (
    <article className="print-area overflow-hidden rounded-xl border border-border bg-card">
      <header className="border-b border-border px-5 py-5 sm:px-7">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <BrandMark />
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-foreground sm:text-lg">{INSTITUTION.name}</h2>
              <p className="truncate text-[13px] text-muted-foreground">
                {INSTITUTION.system} · {INSTITUTION.address}
              </p>
            </div>
          </div>
          <StatusBadge status={result.status} />
        </div>
        <p className="mt-4 text-[13px] font-medium uppercase tracking-[0.14em] text-primary">
          Statement of Marks — {result.examination.name}
        </p>
      </header>

      <section className="grid gap-4 px-5 py-5 sm:grid-cols-3 sm:px-7" aria-label="Student information">
        <Field label="Student Name" value={result.student.name} />
        <Field label="Student Number" value={result.student.studentNumber} />
        <Field label="Roll Number" value={result.student.rollNumber} />
        <Field label="Class" value={result.student.className} />
        <Field label="Examination" value={result.examination.name} />
        <Field label="Academic Year" value={result.examination.academicYear} />
      </section>

      <Separator />

      <section className="px-1 py-2 sm:px-3" aria-label="Subject marks">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Subject</TableHead>
                <TableHead className="text-right">Full Marks</TableHead>
                <TableHead className="text-right">Pass Marks</TableHead>
                <TableHead className="text-right">Obtained</TableHead>
                <TableHead className="text-right">Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.subjects.map((s) => (
                <TableRow key={s.subjectId}>
                  <TableCell className="font-medium text-foreground">{s.subjectName}</TableCell>
                  <TableCell className="text-right tabular-nums">{s.fullMarks}</TableCell>
                  <TableCell className="text-right tabular-nums">{s.passMarks}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{s.obtainedMarks}</TableCell>
                  <TableCell className="text-right font-medium">{s.grade}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <Separator />

      <section className="grid gap-3 px-5 py-5 sm:grid-cols-3 sm:px-7 lg:grid-cols-5" aria-label="Result summary">
        <Summary label="Total Marks" value={`${result.obtainedMarks} / ${result.totalMarks}`} />
        <Summary label="Percentage" value={`${result.percentage}%`} />
        <Summary label="GPA" value={result.gpa.toFixed(2)} />
        <Summary label="Final Grade" value={result.grade} strong />
        <Summary label="Remarks" value={result.remarks} />
      </section>

      <footer className="border-t border-border px-5 py-4 text-[12px] text-subtle-foreground sm:px-7">
        This is a system-generated academic result statement. For corrections, contact the examination division.
      </footer>
    </article>
  );
}
