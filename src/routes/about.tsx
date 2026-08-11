import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpenCheck,
  Building2,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  MapPin,
  Users2,
  Workflow,
} from "lucide-react";
import { PublicLayout } from "@/layouts/PublicLayout";
import { INSTITUTION } from "@/api/mockData";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Reliance College | About" },
      {
        name: "description",
        content: "About Reliance College, Chabahil, Kathmandu and its academic programs, campus profile, and contact details.",
      },
      { property: "og:title", content: "About Reliance College — SRMS" },
      {
        property: "og:description",
        content: "Learn about Reliance College, its TU affiliation, programs, and official contact details.",
      },
    ],
  }),
  component: AboutPage,
});

const highlights = [
  {
    icon: Building2,
    title: `Founded in ${INSTITUTION.established}`,
    text: "Reliance College is part of the Reliance Education Network, a Kathmandu-based academic network focused on higher education and student growth.",
  },
  {
    icon: GraduationCap,
    title: "TU-affiliated programs",
    text: "The college offers BCA, BBS, BA/BSW and MBS programs with a strong academic and practical learning focus.",
  },
  {
    icon: Users2,
    title: "Student-focused environment",
    text: "The campus emphasizes internships, career support, and a student-friendly learning atmosphere in Chabahil.",
  },
];

const programs = ["BCA", "BBS", "BA/BSW", "MBS"];

const quickFacts = [
  { label: "Location", value: INSTITUTION.address, icon: MapPin },
  { label: "Website", value: "riacollege.edu.np", icon: ExternalLink },
  { label: "Affiliation", value: INSTITUTION.affiliation, icon: Workflow },
  { label: "Programs", value: "BCA, BBS, BA/BSW, MBS", icon: BookOpenCheck },
];

function AboutPage() {
  return (
    <PublicLayout>
      <section className="bg-[#f8f4ea]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-primary">About Reliance College</p>
              <h1 className="mt-3 max-w-2xl text-[34px] font-semibold leading-[1.04] tracking-[-0.03em] text-[#1f2b4a] sm:text-[44px]">
                A TU-affiliated college in Saraswatinagar, Chabahil, Kathmandu.
              </h1>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#5f6e88]">
                {INSTITUTION.name} is part of the Reliance Education Network and serves students across management,
                humanities and computer science with a focus on academic quality, practical learning, and career
                readiness.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {programs.map((program) => (
                  <span key={program} className="rounded-full border border-border bg-white px-3 py-1 text-[12px] font-medium text-[#243555] shadow-sm">
                    {program}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild className="bg-[#23345f] text-white hover:bg-[#1b294c]">
                  <Link to="/contact">
                    Contact Us <ChevronRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-border bg-transparent text-[#243555] hover:bg-white">
                  <a href={INSTITUTION.website} target="_blank" rel="noreferrer">
                    Visit Website <ExternalLink className="ml-1.5 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="overflow-hidden rounded-[30px] border border-border bg-card shadow-[0_24px_60px_-34px_rgba(15,23,42,0.35)]">
              <div className="relative min-h-[320px]">
                <img
                  src="/assets/Reliance-College-Image.jpg"
                  alt="Reliance College campus"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.05),rgba(15,23,42,0.72))]" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white p-1.5">
                      <img src="/assets/Reliance-College-Logo.webp" alt="Reliance College logo" className="h-full w-full object-contain" />
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/70">
                        Reliance Education Network
                      </p>
                      <p className="text-[14px] text-white/88">{INSTITUTION.affiliation}</p>
                    </div>
                  </div>
                  <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/88">
                    Founded in 2050 BS and rooted in a network of educational institutions in Kathmandu, the college
                    supports more than academic learning through career exposure and student growth.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {quickFacts.map((item) => (
              <section key={item.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <item.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                <h2 className="mt-4 text-[15px] font-semibold text-foreground">{item.label}</h2>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">{item.value}</p>
              </section>
            ))}
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {highlights.map((block) => (
              <section key={block.title} className="rounded-2xl border border-border bg-card p-5">
                <block.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                <h2 className="mt-3 text-[15px] font-semibold text-foreground">{block.title}</h2>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">{block.text}</p>
              </section>
            ))}
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="text-[16px] font-semibold text-foreground">Programs offered</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  ["BCA", "Computer application program for students focused on software, systems, and practical IT skills."],
                  ["BBS", "Business studies program built for commerce, management, and professional development."],
                  ["BA/BSW", "Humanities and social work pathway with community, communication, and development focus."],
                  ["MBS", "Graduate-level management study for advanced business and leadership learning."],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-xl border border-border bg-surface p-4">
                    <h3 className="text-[14px] font-semibold text-foreground">{title}</h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{text}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="text-[16px] font-semibold text-foreground">Official contact</h2>
              <ul className="mt-4 space-y-3 text-[14px] text-muted-foreground">
                <li>{INSTITUTION.address}</li>
                <li>{INSTITUTION.email}</li>
                <li>{INSTITUTION.phone}</li>
                <li>
                  <a href={INSTITUTION.website} className="inline-flex items-center gap-1 text-primary hover:underline">
                    {INSTITUTION.website.replace("https://", "")}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
