import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BookOpen, Loader2, MoreHorizontal, Plus, Search } from "lucide-react";
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
import type { Subject } from "@/types";

export const Route = createFileRoute("/_admin/admin/subjects")({
  component: SubjectsPage,
});

const schema = z
  .object({
    code: z.string().min(2, "Subject code is required"),
    name: z.string().min(2, "Subject name is required"),
    classId: z.string().min(1, "Select a class"),
    fullMarks: z.coerce.number().min(1, "Full marks must be greater than 0").max(200),
    passMarks: z.coerce.number().min(1, "Pass marks must be greater than 0").max(200),
    status: z.enum(["ACTIVE", "INACTIVE"]),
  })
  .refine((v) => v.passMarks <= v.fullMarks, {
    message: "Pass marks cannot exceed full marks",
    path: ["passMarks"],
  });

type FormValues = z.infer<typeof schema>;

function SubjectsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [classId, setClassId] = useState("ALL");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [deleting, setDeleting] = useState<Subject | null>(null);

  const query = { search, classId, limit: 50 };
  const subjectsQuery = useQuery({ queryKey: queryKeys.subjects(query), queryFn: () => api.subjects.getAll(query) });
  const classesQuery = useQuery({ queryKey: queryKeys.classes({ limit: 50 }), queryFn: () => api.classes.getAll({ limit: 50 }) });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: "", name: "", classId: "", fullMarks: 100, passMarks: 40, status: "ACTIVE" },
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["subjects"] });
    void qc.invalidateQueries({ queryKey: ["classes"] });
    void qc.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const save = useMutation({
    mutationFn: (values: FormValues) => (editing ? api.subjects.update(editing.id, values) : api.subjects.create(values)),
    onSuccess: (res) => {
      toast.success(res.message ?? "Saved");
      setOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (e) => toast.error(errorMessage(e, "Something went wrong while saving this subject.")),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.subjects.delete(id),
    onSuccess: () => {
      toast.success("Subject deleted");
      setDeleting(null);
      invalidate();
    },
    onError: (e) => toast.error(errorMessage(e, "Unable to delete this subject.")),
  });

  const rows = subjectsQuery.data?.data ?? [];
  const classes = classesQuery.data?.data ?? [];

  return (
    <>
      <PageHeader
        title="Subjects"
        description="Define subjects, marking scheme and class assignment."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              form.reset({ code: "", name: "", classId: "", fullMarks: 100, passMarks: 40, status: "ACTIVE" });
              setOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Subject
          </Button>
        }
      />

      <div className="rounded-xl border border-border bg-card">
        <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-[minmax(0,1fr)_200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subject code or name"
              className="pl-9"
              aria-label="Search subjects"
            />
          </div>
          <Select value={classId} onValueChange={setClassId}>
            <SelectTrigger aria-label="Filter by class">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All classes</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {subjectsQuery.isError ? (
          <div className="p-4">
            <ErrorState message={errorMessage(subjectsQuery.error, "Unable to load subjects.")} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead className="min-w-[180px]">Subject Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Full Marks</TableHead>
                  <TableHead className="text-right">Pass Marks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjectsQuery.isPending ? (
                  <TableSkeleton rows={6} columns={7} />
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="p-0">
                      <EmptyState icon={BookOpen} title="No subjects assigned to this class" description="Add a subject to build the marking scheme." />
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium text-foreground">{s.code}</TableCell>
                      <TableCell className="text-foreground">{s.name}</TableCell>
                      <TableCell className="text-muted-foreground">{s.className}</TableCell>
                      <TableCell className="text-right tabular-nums">{s.fullMarks}</TableCell>
                      <TableCell className="text-right tabular-nums">{s.passMarks}</TableCell>
                      <TableCell>
                        <StatusBadge status={s.status} />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label={`Actions for ${s.name}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditing(s);
                                form.reset({
                                  code: s.code,
                                  name: s.name,
                                  classId: s.classId,
                                  fullMarks: s.fullMarks,
                                  passMarks: s.passMarks,
                                  status: s.status,
                                });
                                setOpen(true);
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => setDeleting(s)}>
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
            <DialogTitle>{editing ? "Edit Subject" : "Add Subject"}</DialogTitle>
            <DialogDescription>Pass marks must not exceed full marks.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => save.mutate(v))} className="grid gap-4 sm:grid-cols-2" noValidate>
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Code</FormLabel>
                    <FormControl>
                      <Input placeholder="CS305" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Web Technology" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Class</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes.map((c) => (
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
                name="fullMarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Marks</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="passMarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pass Marks</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
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
                  Save Subject
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this subject?</AlertDialogTitle>
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
