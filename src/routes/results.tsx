import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileQuestion, Loader2, Printer, Search } from "lucide-react";
import { api, errorMessage, queryKeys, ApiError } from "@/api";
import { PublicLayout } from "@/layouts/PublicLayout";
import { ResultSheet } from "@/components/results/ResultSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Result } from "@/types";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Reliance College | Check Examination Result" },
      {
        name: "description",
        content: "Enter your student number and class to view a published examination result.",
      },
      { property: "og:title", content: "Check Examination Result — SRMS" },
      { property: "og:description", content: "View and print your published academic mark sheet." },
    ],
  }),
  component: ResultSearchPage,
});

const schema = z.object({
  studentNumber: z
    .string()
    .min(4, "Enter your full student number, e.g. STU-2083-001")
    .max(32, "Student number is too long"),
  classId: z.string().min(1, "Select your class"),
  examId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function ResultSearchPage() {
  const [result, setResult] = useState<Result | null>(null);
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);

  const classesQuery = useQuery({
    queryKey: queryKeys.classes({ limit: 50 }),
    queryFn: () => api.classes.getAll({ limit: 50 }),
  });
  const examsQuery = useQuery({
    queryKey: queryKeys.exams({ limit: 50 }),
    queryFn: () => api.exams.getAll({ limit: 50 }),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { studentNumber: "", classId: "", examId: "ALL" },
  });

  const search = useMutation({
    mutationFn: (values: FormValues) =>
      api.results.search({
        studentNumber: values.studentNumber,
        classId: values.classId,
        ...(values.examId && values.examId !== "ALL" ? { examId: values.examId } : {}),
      }),
    onMutate: () => {
      setResult(null);
      setNotice(null);
    },
    onSuccess: (res) => setResult(res.data),
    onError: (error) => {
      const status = error instanceof ApiError ? error.status : 0;
      setNotice({
        title: status === 409 ? "Result not published" : "Result not found",
        message: errorMessage(error, "We could not find a result for the details provided."),
      });
    },
  });

  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="no-print text-center">
          <h1 className="text-[28px] font-semibold leading-tight text-foreground sm:text-[32px]">
            Check Examination Result
          </h1>
          <p className="mt-2 text-[15px] text-muted-foreground">
            Enter your academic details to view a published result.
          </p>
        </div>

        <section className="no-print mt-8 rounded-xl border border-border bg-card p-5 sm:p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => search.mutate(values))}
              className="grid gap-4 sm:grid-cols-2"
              noValidate
            >
              <FormField
                control={form.control}
                name="studentNumber"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Student Number</FormLabel>
                    <FormControl>
                      <Input placeholder="STU-2083-001" autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(classesQuery.data?.data ?? []).map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="examId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Examination <span className="text-subtle-foreground">(optional)</span>
                    </FormLabel>
                    <Select value={field.value ?? "ALL"} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Any examination" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ALL">Any examination</SelectItem>
                        {(examsQuery.data?.data ?? []).map((e) => (
                          <SelectItem key={e.id} value={e.id}>
                            {e.name} · {e.academicYear}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="sm:col-span-2">
                <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={search.isPending}>
                  {search.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching…
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" /> Search Result
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </section>

        {search.isPending ? (
          <div className="no-print mt-6 space-y-3 rounded-xl border border-border bg-card p-6">
            <Skeleton className="h-5 w-52" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-4 h-32 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : null}

        {notice ? (
          <Alert className="no-print mt-6 bg-card">
            <FileQuestion className="h-4 w-4" />
            <AlertTitle>{notice.title}</AlertTitle>
            <AlertDescription>{notice.message}</AlertDescription>
          </Alert>
        ) : null}

        {result ? (
          <div className="mt-8">
            <div className="no-print mb-3 flex justify-end">
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" /> Print Result
              </Button>
            </div>
            <ResultSheet result={result} />
          </div>
        ) : null}
      </div>
    </PublicLayout>
  );
}
