import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ClipboardList, Loader2, MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { api, errorMessage, queryKeys } from "@/api";
import { EmptyState, ErrorState, PageHeader, StatusBadge, TableSkeleton } from "@/components/common/ui-states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Exam } from "@/types";

export const Route = createFileRoute("/_admin/admin/examinations")({
  component: ExamsPage,
});

const schema = z.object({
  name: z.string().min(3, "Examination name is required"),
  academicYear: z.string().min(4, "Academic year is required"),
  term: z.string().min(2, "Term is required"),
  examDate: z.string().min(1, "Examination date is required"),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "PUBLISHED"]),
});
type FormValues = z.infer<typeof schema>;

const defaults: FormValues = {
  name: "",
  academicYear: "2083",
  term: "First Term",
  examDate: "",
  description: "",
  status: "DRAFT",
};

function ExamsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Exam | null>(null);
  const [deleting, setDeleting] = useState<Exam | null>(null);

  const examsQuery = useQuery({ queryKey: queryKeys.exams({ limit: 50 }), queryFn: () => api.exams.getAll({ limit: 50 }) });
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaults });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["exams"] });
    void qc.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const save = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = { ...values, description: values.description ?? "" };
      return editing ? api.exams.update(editing.id, payload) : api.exams.create(payload);
    },
    onSuccess: (res) => {
      toast.success(res.message ?? "Saved");
      setOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (e) => toast.error(errorMessage(e, "Something went wrong while saving this examination.")),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.exams.delete(id),
    onSuccess: () => {
      toast.success("Examination deleted");
      setDeleting(null);
      invalidate();
    },
    onError: (e) => toast.error(errorMessage(e, "Unable to delete this examination.")),
  });

  const rows = examsQuery.data?.data ?? [];

  return (
    <>
      <PageHeader
        title="Examinations"
        description="Schedule examinations and control their academic lifecycle."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              form.reset(defaults);
              setOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Examination
          </Button>
        }
      />

      <div className="rounded-xl border border-border bg-card">
        {examsQuery.isError ? (
          <div className="p-4">
            <ErrorState message={errorMessage(examsQuery.error, "Unable to load examinations.")} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Examination</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Exam Date</TableHead>
                  <TableHead className="text-right">Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {examsQuery.isPending ? (
                  <TableSkeleton rows={4} columns={7} />
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="p-0">
                      <EmptyState icon={ClipboardList} title="No examinations available" description="Create an examination to start entering marks." />
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium text-foreground">{e.name}</TableCell>
                      <TableCell className="text-muted-foreground">{e.academicYear}</TableCell>
                      <TableCell className="text-muted-foreground">{e.term}</TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">{e.examDate}</TableCell>
                      <TableCell className="text-right tabular-nums">{e.studentCount}</TableCell>
                      <TableCell>
                        <StatusBadge status={e.status} />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label={`Actions for ${e.name}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditing(e);
                                form.reset({
                                  name: e.name,
                                  academicYear: e.academicYear,
                                  term: e.term,
                                  examDate: e.examDate,
                                  description: e.description ?? "",
                                  status: e.status,
                                });
                                setOpen(true);
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => setDeleting(e)}>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Examination" : "Add Examination"}</DialogTitle>
            <DialogDescription>Examinations group marks and generated results.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => save.mutate(v))} className="grid gap-4 sm:grid-cols-2" noValidate>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Examination Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Third Terminal Examination" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="academicYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Year</FormLabel>
                    <FormControl>
                      <Input placeholder="2083" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="term"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Term</FormLabel>
                    <FormControl>
                      <Input placeholder="Final Term" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="examDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exam Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder="Optional notes about this examination" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="sm:col-span-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={save.isPending}>
                  {save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Examination
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this examination?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(ev) => {
                ev.preventDefault();
                if (deleting) remove.mutate(deleting.id);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
