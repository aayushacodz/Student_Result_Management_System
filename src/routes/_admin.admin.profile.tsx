import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Mail, Shield, UserCircle2 } from "lucide-react";
import { toast } from "sonner";
import { api, errorMessage } from "@/api";
import { INSTITUTION } from "@/api/mockData";
import { useAuth } from "@/context/AuthContext";
import { PageHeader, SectionCardTitle } from "@/components/common/ui-states";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_admin/admin/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out");
      await navigate({ to: "/login", replace: true });
    } catch (error) {
      toast.error(errorMessage(error, "Unable to sign out right now."));
    }
  };

  return (
    <>
      <PageHeader
        title="Profile"
        description="View the signed-in administrator details and session settings."
        actions={
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-xl border border-border bg-card p-5">
          <SectionCardTitle
            title="Account Summary"
            hint="The active admin session used by the protected dashboard."
          />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-[12px] uppercase tracking-wide text-subtle-foreground">
                Administrator
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {user?.name ?? "Administrator"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-[12px] uppercase tracking-wide text-subtle-foreground">Email</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{user?.email ?? "-"}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-[12px] uppercase tracking-wide text-subtle-foreground">Role</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{user?.role ?? "ADMIN"}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-[12px] uppercase tracking-wide text-subtle-foreground">Platform</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{INSTITUTION.short}</p>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-border bg-surface p-4">
            <p className="text-sm font-medium text-foreground">Session Notes</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Result publication, student records, classes, subjects, examinations, and marks entry
              are all managed from this account.
            </p>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <SectionCardTitle title="Identity" />
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
                <UserCircle2 className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">
                  {user?.name ?? "Administrator"}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {user?.email ?? "Signed in administrator"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <SectionCardTitle title="Quick Links" />
            <div className="mt-4 space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/admin/dashboard">
                  <Shield className="mr-2 h-4 w-4" /> Dashboard
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/admin/results">
                  <Mail className="mr-2 h-4 w-4" /> Result Reviews
                </Link>
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
