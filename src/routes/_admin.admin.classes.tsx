import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GraduationCap, Loader2, MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { api, errorMessage, queryKeys } from "@/api";
import { EmptyState, ErrorState, PageHeader, StatusBadge, TableSkeleton } from "@/components/common/ui-states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { SchoolClass } from "@/types";

export const Route = createFileRoute("/_admin/admin/classes")({
  component: ClassesPage,
});

const schema = z.object({
  name: z.string().min(2, "Class name is required"),
  section: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});
type FormValues = z.infer<typeof schema>;

function ClassesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SchoolClass | null>(null);
  const [deleting, setDeleting] = useState<SchoolClass | null>(null);

  const classesQuery = useQuery({ queryKey: queryKeys.classes({ limit: 50 }), queryFn: () => api.classes.getAll({ limit: 50 }) });
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: "", section: "", status: "ACTIVE" } });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["classes"] });
    void qc.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const save = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = { name: values.name, section: values.section ?? "", status: values.status };
      return editing ? api.classes.update(editing.id, payload) : api.classes.create(payload);
    },
    onSuccess: (res) => {
      toast.success(res.message ?? "Saved");
      setOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (e) => toast.error(errorMessage(e, "Something went wrong while saving this class.")),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.classes.delete(id),
    onSuccess: () => {
      toast.success("Class deleted");
      setDeleting(null);
      invalidate();
    },
    onError: (e) => toast.error(errorMessage(e, "Unable to delete this class.")),
  });

  const rows = classesQuery.data?.data ?? [];

  return (
    <>
      <PageHeader
        title="Classes"
        description="Manage classes and semesters offered by the institution."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              form.reset({ name: "", section: "", status: "ACTIVE" });
              setOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Class
          </Button>
        }
      />

      <div className="rounded-xl border border-border bg-card">
        {classesQuery.isError ? (
          <div className="p-4">
            <ErrorState message={errorMessage(classesQuery.error, "Unable to load classes.")} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[160px]">Class Name</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead className="text-right">Students</TableHead>
                  <TableHead className="text-right">Subjects</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {classesQuery.isPending ? (
                  <TableSkeleton rows={5} columns={6} />
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="p-0">
                      <EmptyState icon={GraduationCap} title="No classes available" description="Create a class to begin enrolling students." />
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium text-foreground">{c.name}</TableCell>
                      <TableCell className="text-muted-foreground">{c.section || "—"}</TableCell>
                      <TableCell className="text-right tabular-nums">{c.studentCount}</TableCell>
                      <TableCell className="text-right tabular-nums">{c.subjectCount}</TableCell>
                      <TableCell>
                        <StatusBadge status={c.status} />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label={`Actions for ${c.name}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditing(c);
                                form.reset({ name: c.name, section: c.section ?? "", status: c.status });
                                setOpen(true);
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => setDeleting(c)}>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Class" : "Add Class"}</DialogTitle>
            <DialogDescription>Classes group students, subjects and examinations.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => save.mutate(v))} className="space-y-4" noValidate>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Name</FormLabel>
                    <FormControl>
                      <Input placeholder="BCA VI Semester" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="section"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section</FormLabel>
                    <FormControl>
                      <Input placeholder="A" {...field} />
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
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={save.isPending}>
                  {save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Class
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this class?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
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
