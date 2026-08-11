import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  ClipboardList,
  FilePenLine,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  UserCircle,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { BrandMark } from "@/components/common/brand";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  to: "/admin/dashboard" | "/admin/students" | "/admin/classes" | "/admin/subjects" | "/admin/examinations" | "/admin/marks" | "/admin/results" | "/admin/profile";
  icon: LucideIcon;
  group: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard, group: "Overview" },
  { label: "Students", to: "/admin/students", icon: Users, group: "Academic Management" },
  { label: "Classes", to: "/admin/classes", icon: GraduationCap, group: "Academic Management" },
  { label: "Subjects", to: "/admin/subjects", icon: BookOpen, group: "Academic Management" },
  { label: "Examinations", to: "/admin/examinations", icon: ClipboardList, group: "Academic Management" },
  { label: "Marks Entry", to: "/admin/marks", icon: FilePenLine, group: "Result Management" },
  { label: "Results", to: "/admin/results", icon: FileText, group: "Result Management" },
  { label: "Profile", to: "/admin/profile", icon: UserCircle, group: "Account" },
];

const groups = ["Overview", "Academic Management", "Result Management", "Account"];

function SidebarNav({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4" aria-label="Admin">
      {groups.map((group) => (
        <div key={group}>
          {!collapsed && (
            <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-subtle-foreground">
              {group}
            </p>
          )}
          <ul className="space-y-1">
            {navItems
              .filter((i) => i.group === group)
              .map((item) => {
                const active = pathname.startsWith(item.to);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={onNavigate}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-primary",
                        collapsed && "justify-center px-0",
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function useBreadcrumb() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = navItems.find((i) => pathname.startsWith(i.to));
  if (!current) return { group: null as string | null, label: "Administration" };
  return { group: current.group === "Overview" ? null : current.group, label: current.label };
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const crumb = useBreadcrumb();

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login", replace: true });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "no-print sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 lg:flex",
          collapsed ? "w-[72px]" : "w-[254px]",
        )}
      >
        <div className={cn("flex h-16 items-center gap-2.5 border-b border-sidebar-border px-4", collapsed && "justify-center px-0")}>
          <BrandMark />
          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold text-foreground">SRMS</p>
              <p className="truncate text-[12px] text-muted-foreground">Academic Portal</p>
            </div>
          )}
        </div>
        <SidebarNav collapsed={collapsed} />
        <div className="border-t border-sidebar-border p-3">
          <Button
            variant="ghost"
            className={cn("w-full justify-start gap-2.5 text-muted-foreground", collapsed && "justify-center")}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && "Logout"}
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-30 grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open navigation">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[264px] p-0">
                <SheetTitle className="sr-only">Admin navigation</SheetTitle>
                <div className="flex h-16 items-center gap-2.5 border-b border-border px-4">
                  <BrandMark />
                  <div className="leading-tight">
                    <p className="text-sm font-semibold text-foreground">SRMS</p>
                    <p className="text-[12px] text-muted-foreground">Academic Portal</p>
                  </div>
                </div>
                <SidebarNav onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>

            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:inline-flex"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>

            <Breadcrumb className="min-w-0">
              <BreadcrumbList>
                {crumb.group ? (
                  <>
                    <BreadcrumbItem className="hidden sm:block">
                      <BreadcrumbLink asChild>
                        <Link to="/admin/dashboard">{crumb.group}</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden sm:block" />
                  </>
                ) : null}
                <BreadcrumbItem>
                  <BreadcrumbPage className="truncate">{crumb.label}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5 text-left transition-colors hover:bg-accent">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary text-[11px] text-primary-foreground">AD</AvatarFallback>
                </Avatar>
                <span className="hidden text-[13px] font-medium text-foreground sm:inline">
                  {user?.name ?? "Administrator"}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-[13px]">
                {user?.name ?? "Administrator"}
                <span className="block text-[12px] font-normal text-muted-foreground">{user?.email}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/admin/profile">
                  <UserCircle className="mr-2 h-4 w-4" /> Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1200px] space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
