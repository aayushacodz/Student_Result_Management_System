import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BrandLockup } from "@/components/common/brand";
import { INSTITUTION } from "@/api/mockData";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Check Result", to: "/results" },
  { label: "Contact", to: "/contact" },
  { label: "About", to: "/about" },
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="no-print sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur supports-backdrop-filter:bg-surface/80">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="min-w-0 rounded-md focus-visible:outline-2 focus-visible:outline-ring">
          <BrandLockup />
        </Link>

        <div className="flex shrink-0 items-center gap-1">
          <nav aria-label="Main" className="mr-2 hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-primary data-[status=active]:text-primary data-[status=active]:font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-70 p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="border-b border-border p-4">
                <BrandLockup />
              </div>
              <nav className="flex flex-col p-3" aria-label="Mobile">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-accent"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="no-print border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <BrandLockup />
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
            {INSTITUTION.subtitle}. Maintained by the examination division of {INSTITUTION.name}.
          </p>
        </div>
        <div>
          <p className="text-[13px] font-semibold text-foreground">Portal</p>
          <ul className="mt-3 space-y-2 text-[13px] text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-primary">
                Home
              </Link>
            </li>
            <li>
              <Link to="/results" className="hover:text-primary">
                Check Result
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-primary">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-primary">
                About
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-[13px] font-semibold text-foreground">Examination Division</p>
          <ul className="mt-3 space-y-2 text-[13px] text-muted-foreground">
            <li>{INSTITUTION.address}</li>
            <li>{INSTITUTION.email}</li>
            <li>{INSTITUTION.phone}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-4 text-[12px] text-subtle-foreground sm:px-6">
          © {new Date().getFullYear()} {INSTITUTION.name}. Student Result Management System.
        </p>
      </div>
    </footer>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
