import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  ClipboardList,
  FileCheck2,
  FilePenLine,
  GraduationCap,
  Plus,
  Users,
} from "lucide-react";
import { api, errorMessage, queryKeys } from "@/api";
import { CardSkeleton, ErrorState, PageHeader, SectionCardTitle, StatusBadge, TableSkeleton } from "@/components/common/ui-states";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_admin/admin/dashboard")({
  component: DashboardPage,
});

const quickActions = [
  { label: "Add Student", to: "/admin/students", icon: Users },
  { label: "Create Exam", to: "/admin/examinations", icon: ClipboardList },
  { label: "Enter Marks", to: "/admin/marks", icon: FilePenLine },
  { label: "Publish Results", to: "/admin/results", icon: FileCheck2 },
] as const;

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Users }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
      </div>
      <p className="mt-3 text-[26px] font-semibold leading-none text-foreground tabular-nums">{value}</p>
    </div>
  );
}

function DashboardPage() {
  const stats = useQuery({ queryKey: queryKeys.dashboard, queryFn: () => api.dashboard.getStats() });
  const recent = useQuery({ queryKey: queryKeys.recentResults, queryFn: () => api.dashboard.getRecentResults() });

  const s = stats.data?.data;
  const breakdown = s?.resultBreakdown;
  const totalResults = breakdown ? breakdown.published + breakdown.ready + breakdown.draft : 0;

  return (
    <>
      <PageHeader title="Dashboard" description="Overview of students, academic records and published results." />

      {stats.isError ? <ErrorState message={errorMessage(stats.error, "Unable to load dashboard statistics.")} /> : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.isPending
          ? Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
          : s && (
              <>
                <StatCard label="Total Students" value={s.students} icon={Users} />
                <StatCard label="Total Classes" value={s.classes} icon={GraduationCap} />
                <StatCard label="Total Subjects" value={s.subjects} icon={BookOpen} />
                <StatCard label="Examinations" value={s.examinations} icon={ClipboardList} />
                <StatCard label="Published Results" value={s.publishedResults} icon={FileCheck2} />
              </>
            )}
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <SectionCardTitle title="Results Overview" hint="Publication status across generated results." />
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {(
            [
              ["Published", breakdown?.published ?? 0, "bg-success"],
              ["Ready", breakdown?.ready ?? 0, "bg-info"],
              ["Draft", breakdown?.draft ?? 0, "bg-subtle-foreground"],
            ] as const
          ).map(([label, value, color]) => (
            <div key={label} className="rounded-lg border border-border bg-surface p-4">
              <div className="flex items-baseline justify-between">
                <p className="text-[13px] text-muted-foreground">{label}</p>
                <p className="text-lg font-semibold tabular-nums text-foreground">{value}</p>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${color}`}
                  style={{ width: `${totalResults ? (value / totalResults) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border p-5">
          <SectionCardTitle title="Recent Results" hint="Latest generated examination results." />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[160px]">Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Exam</TableHead>
                <TableHead className="text-right">Percentage</TableHead>
                <TableHead className="text-right">Grade</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.isPending ? (
                <TableSkeleton rows={5} columns={6} />
              ) : (
                (recent.data?.data ?? []).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium text-foreground">{r.student.name}</TableCell>
                    <TableCell className="text-muted-foreground">{r.student.className}</TableCell>
                    <TableCell className="text-muted-foreground">{r.examination.name}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.percentage}%</TableCell>
                    <TableCell className="text-right font-medium">{r.grade}</TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <SectionCardTitle title="Quick Actions" />
        <div className="mt-4 flex flex-wrap gap-2">
          {quickActions.map((a) => (
            <Button key={a.label} asChild variant="outline">
              <Link to={a.to}>
                <a.icon className="mr-2 h-4 w-4" /> {a.label}
              </Link>
            </Button>
          ))}
          <Button asChild>
            <Link to="/admin/students">
              <Plus className="mr-2 h-4 w-4" /> New Record
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
