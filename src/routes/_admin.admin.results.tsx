import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileCheck2, Search, ArrowRight } from "lucide-react";
import { api, errorMessage, queryKeys } from "@/api";
import {
  EmptyState,
  ErrorState,
  PageHeader,
  StatusBadge,
  TableSkeleton,
} from "@/components/common/ui-states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const Route = createFileRoute("/_admin/admin/results")({
  component: ResultsPage,
});

function ResultsPage() {
  const [search, setSearch] = useState("");
  const [classId, setClassId] = useState("ALL");
  const [examId, setExamId] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);

  const query = { search, classId, examId, status, page, limit: 8 };
  const resultsQuery = useQuery({
    queryKey: queryKeys.results(query),
    queryFn: () => api.results.getAll(query),
  });
  const classesQuery = useQuery({
    queryKey: queryKeys.classes({ limit: 50 }),
    queryFn: () => api.classes.getAll({ limit: 50 }),
  });
  const examsQuery = useQuery({
    queryKey: queryKeys.exams({ limit: 50 }),
    queryFn: () => api.exams.getAll({ limit: 50 }),
  });

  const rows = resultsQuery.data?.data ?? [];
  const pagination = resultsQuery.data?.pagination;

  return (
    <>
      <PageHeader
        title="Results"
        description="Review generated results, filter by class or examination, and open a record for publishing."
      />

      <div className="rounded-xl border border-border bg-card">
        <div className="grid gap-3 border-b border-border p-4 lg:grid-cols-[minmax(0,1fr)_180px_180px_160px]">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by student name or number"
              className="pl-9"
              aria-label="Search results"
            />
          </div>
          <Select
            value={classId}
            onValueChange={(v) => {
              setClassId(v);
              setPage(1);
            }}
          >
            <SelectTrigger aria-label="Filter by class">
              <SelectValue placeholder="All classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All classes</SelectItem>
              {(classesQuery.data?.data ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={examId}
            onValueChange={(v) => {
              setExamId(v);
              setPage(1);
            }}
          >
            <SelectTrigger aria-label="Filter by examination">
              <SelectValue placeholder="All examinations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All examinations</SelectItem>
              {(examsQuery.data?.data ?? []).map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger aria-label="Filter by status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="READY">Ready</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {resultsQuery.isError ? (
          <div className="p-4">
            <ErrorState message={errorMessage(resultsQuery.error, "Unable to load results.")} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="min-w-[180px]">Examination</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                  <TableHead className="text-right">Grade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {resultsQuery.isPending ? (
                  <TableSkeleton rows={6} columns={8} />
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="p-0">
                      <EmptyState
                        icon={FileCheck2}
                        title="No results found"
                        description="Try adjusting the filters or generate a result from Marks Entry."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium text-foreground">
                        {result.student.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {result.student.className}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {result.examination.name}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {result.percentage}%
                      </TableCell>
                      <TableCell className="text-right font-medium">{result.grade}</TableCell>
                      <TableCell>
                        <StatusBadge status={result.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {result.publishedAt
                          ? new Date(result.publishedAt).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          aria-label={`Review ${result.student.name}`}
                        >
                          <Link to="/admin/results/$id" params={{ id: result.id }}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 ? (
          <div className="flex items-center justify-between gap-3 border-t border-border p-3">
            <p className="text-[13px] text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages} · {pagination.total} results
            </p>
            <Pagination className="mx-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.max(1, p - 1));
                    }}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive onClick={(e) => e.preventDefault()}>
                    {pagination.page}
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.min(pagination.totalPages, p + 1));
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        ) : null}
      </div>
    </>
  );
}
