import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ClipboardCheck,
  FileSearch,
  GaugeCircle,
  Landmark,
  Layers,
  Lock,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PublicLayout } from "@/layouts/PublicLayout";
import { INSTITUTION } from "@/api/mockData";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Reliance College | Academic Result Portal" },
      {
        name: "description",
        content:
          "Search and securely access published examination results through the Student Result Management System.",
      },
      { property: "og:title", content: "SRMS — Academic Result Portal" },
      {
        property: "og:description",
        content: "Check published examination results and access long-term academic records.",
      },
    ],
  }),
  component: HomePage,
});

const steps = [
  { icon: FileSearch, title: "Enter Student Details", text: "Provide your student number exactly as printed on your admission card." },
  { icon: Layers, title: "Select Class", text: "Choose your running class or semester, and optionally the examination." },
  { icon: ScrollText, title: "View Published Result", text: "Open your digital mark sheet and print or save it for records." },
];

const values = [
  { icon: GaugeCircle, title: "Fast Access", text: "Results load in seconds — no queues at the notice board." },
  { icon: Lock, title: "Secure Records", text: "Only published results are visible to students and parents." },
  { icon: ClipboardCheck, title: "Accurate Results", text: "Grades and GPA are computed from verified subject marks." },
  { icon: Landmark, title: "Long-Term Records", text: "Academic history stays available across terms and years." },
];

function HomeHero() {
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-card shadow-[0_24px_60px_-28px_rgba(15,23,42,0.55)]">
      <div className="relative min-h-85 lg:min-h-110">
        <img
          src="/assets/Reliance-College-Image.jpg"
          alt="Reliance College campus"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,24,54,0.86)_0%,rgba(18,24,54,0.78)_28%,rgba(18,24,54,0.52)_52%,rgba(18,24,54,0.22)_76%,rgba(18,24,54,0.12)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_24%)]" />

        <div className="relative flex min-h-85 lg:min-h-110 items-center">
          <div className="w-full px-6 py-8 sm:px-8 lg:px-12">
            <div className="max-w-130 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white p-1.5 shadow-lg shadow-black/20">
                  <img
                    src="/assets/Reliance-College-Logo.webp"
                    alt="Reliance College logo"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-white/72">
                    Welcome to Reliance College
                  </p>
                  <p className="mt-1 text-[14px] text-white/88">{INSTITUTION.system}</p>
                </div>
              </div>

              <h2 className="mt-4 max-w-xl text-[26px] font-semibold leading-[1.08] text-balance sm:text-[32px] lg:text-[44px]">
                A clearer way to present results and academic updates.
              </h2>
              <p className="mt-3 max-w-lg text-[16px] leading-relaxed text-white/88 sm:text-[18px]">
                Browse the latest campus image, then move into published result checks and student records.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="bg-[#2f3974] text-white hover:bg-[#26305f]">
                  <Link to="/contact">
                    Contact Us <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/70 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  <Link to="/about">About Reliance College</Link>
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap gap-2 text-[12px] text-white/72">
                <span className="rounded-full border border-white/15 bg-white/12 px-3 py-1 backdrop-blur-sm">
                  Result publication
                </span>
                <span className="rounded-full border border-white/15 bg-white/12 px-3 py-1 backdrop-blur-sm">
                  Secure access
                </span>
                <span className="rounded-full border border-white/15 bg-white/12 px-3 py-1 backdrop-blur-sm">
                  Student friendly
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <PublicLayout>
      <section className="border-b border-border bg-[#f8f4ea]">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
          <HomeHero />
        </div>
      </section>

      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">How it works</h2>
          <p className="mt-1 text-sm text-muted-foreground">Three steps to access a published examination result.</p>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light text-[13px] font-semibold text-primary">
                    {i + 1}
                  </span>
                  <step.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-[15px] font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">Why SRMS</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30">
                <v.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                <h3 className="mt-4 text-[15px] font-semibold text-foreground">{v.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-6 px-4 py-12 sm:px-6">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">Need help reaching the college office?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Use the Contact page for admissions, examinations, and general support details.
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <Link to="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
