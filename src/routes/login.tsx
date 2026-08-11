import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { errorMessage } from "@/api";
import { DEMO_ADMIN, INSTITUTION } from "@/api/mockData";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BrandMark } from "@/components/common/brand";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reliance College | Administrator Login" },
      { name: "description", content: "Sign in to the SRMS academic management dashboard." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Administrator Login — SRMS" },
      { property: "og:description", content: "Access the academic management dashboard." },
    ],
  }),
  component: AdminLoginPage,
});

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

function AdminLoginPage() {
  const { login, isAuthenticated, ready } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && isAuthenticated) void navigate({ to: "/admin/dashboard", replace: true });
  }, [ready, isAuthenticated, navigate]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setSubmitting(true);
    try {
      await login(values.email, values.password, values.remember);
      toast.success("Signed in", { description: "Welcome back, Administrator." });
      void navigate({ to: "/admin/dashboard", replace: true });
    } catch (err) {
      setError(errorMessage(err, "Unable to sign in. Please check your credentials."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_1fr]">
      <aside className="hidden flex-col justify-between bg-primary px-10 py-12 lg:flex">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground text-[13px] font-bold text-primary">
            SR
          </span>
          <span className="text-sm font-semibold text-primary-foreground">SRMS</span>
        </Link>

        <div className="max-w-md">
          <h2 className="text-[28px] font-semibold leading-tight text-primary-foreground">
            Academic Result Management &amp; Publication Platform
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-primary-foreground/75">
            Manage students, subjects, examinations and marks — then review and publish verified results for
            students and parents.
          </p>
        </div>

        <p className="text-[13px] text-primary-foreground/60">
          {INSTITUTION.name} · {INSTITUTION.address}
        </p>
      </aside>

      <main className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <BrandMark />
            <span className="text-sm font-semibold text-foreground">SRMS</span>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span className="text-[12px] font-semibold uppercase tracking-[0.14em]">Secure Area</span>
            </div>
            <h1 className="mt-3 text-2xl font-semibold text-foreground">Administrator Login</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Access the academic management dashboard.</p>

            {error ? (
              <Alert variant="destructive" className="mt-5">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="admin@srms.edu.np" autoComplete="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            className="pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="remember"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <Checkbox id="remember" checked={field.value} onCheckedChange={(v) => field.onChange(Boolean(v))} />
                      </FormControl>
                      <Label htmlFor="remember" className="text-[13px] font-normal text-muted-foreground">
                        Remember me on this device
                      </Label>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </Form>

            <p className="mt-6 border-t border-border pt-4 text-[12px] leading-relaxed text-subtle-foreground">
              Demo administrator · {DEMO_ADMIN.email} · {DEMO_ADMIN.password}
            </p>
          </div>

          <p className="mt-6 text-center text-[13px] text-muted-foreground">
            <Link to="/" className="hover:text-primary">
              ← Back to result portal
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
