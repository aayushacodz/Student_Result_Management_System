import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Loader2, Printer, ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { api, errorMessage, queryKeys } from "@/api";
import {
  ErrorState,
  PageHeader,
  SectionCardTitle,
  StatusBadge,
} from "@/components/common/ui-states";
import { ResultSheet } from "@/components/results/ResultSheet";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_admin/admin/results/$id")({
  component: ResultReviewPage,
});

function ResultReviewPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const resultQuery = useQuery({
    queryKey: queryKeys.result(id),
    queryFn: () => api.results.getById(id),
  });

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["results"] });
    void qc.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const publish = useMutation({
    mutationFn: () => api.results.publish(id),
    onSuccess: (res) => {
      toast.success(res.message ?? "Result published");
      refresh();
    },
    onError: (e) => toast.error(errorMessage(e, "Unable to publish this result.")),
  });

  const unpublish = useMutation({
    mutationFn: () => api.results.unpublish(id),
    onSuccess: (res) => {
      toast.success(res.message ?? "Result unpublished");
      refresh();
    },
    onError: (e) => toast.error(errorMessage(e, "Unable to unpublish this result.")),
  });

  const result = resultQuery.data?.data;

  return (
    <>
      <PageHeader
        title="Result Review"
        description="Inspect the generated mark sheet, then publish or withdraw the result."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/admin/results">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Results
              </Link>
            </Button>
            {result ? (
              result.status === "PUBLISHED" ? (
                <Button
                  variant="secondary"
                  onClick={() => unpublish.mutate()}
                  disabled={unpublish.isPending}
                >
                  {unpublish.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldOff className="mr-2 h-4 w-4" />
                  )}
                  Unpublish
                </Button>
              ) : (
                <Button onClick={() => publish.mutate()} disabled={publish.isPending}>
                  {publish.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="mr-2 h-4 w-4" />
                  )}
                  Publish Result
                </Button>
              )
            ) : null}
          </>
        }
      />

      {resultQuery.isError ? (
        <ErrorState message={errorMessage(resultQuery.error, "Unable to load this result.")} />
      ) : resultQuery.isPending ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-3 h-4 w-72" />
          </div>
          <Skeleton className="h-[640px] w-full rounded-xl" />
        </div>
      ) : result ? (
        <div className="space-y-4">
          <section className="grid gap-4 rounded-xl border border-border bg-card p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <SectionCardTitle
              title={`${result.student.name} - ${result.examination.name}`}
              hint={`${result.student.studentNumber} · ${result.student.className}`}
            />
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={result.status} />
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" /> Print
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:col-span-2 lg:grid-cols-6">
              <div className="rounded-lg border border-border bg-surface p-4">
                <p className="text-[12px] uppercase tracking-wide text-subtle-foreground">
                  Percentage
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">{result.percentage}%</p>
              </div>
              <div className="rounded-lg border border-border bg-surface p-4">
                <p className="text-[12px] uppercase tracking-wide text-subtle-foreground">Grade</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{result.grade}</p>
              </div>
              <div className="rounded-lg border border-border bg-surface p-4">
                <p className="text-[12px] uppercase tracking-wide text-subtle-foreground">GPA</p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {result.gpa.toFixed(2)}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-surface p-4">
                <p className="text-[12px] uppercase tracking-wide text-subtle-foreground">Total</p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {result.obtainedMarks} / {result.totalMarks}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-surface p-4">
                <p className="text-[12px] uppercase tracking-wide text-subtle-foreground">Term</p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {result.examination.term}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-surface p-4">
                <p className="text-[12px] uppercase tracking-wide text-subtle-foreground">
                  Published
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {result.publishedAt ? new Date(result.publishedAt).toLocaleString() : "Not yet"}
                </p>
              </div>
            </div>
          </section>

          <Alert className="border-border bg-card">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Publication state</AlertTitle>
            <AlertDescription>
              {result.status === "PUBLISHED"
                ? "This mark sheet is visible to the public and can be withdrawn if needed."
                : "Review the mark sheet carefully before publishing it to the public result portal."}
            </AlertDescription>
          </Alert>

          <ResultSheet result={result} />
        </div>
      ) : null}
    </>
  );
}
