import { createFileRoute } from "@tanstack/react-router";
import { Clock3, ExternalLink, Mail, MapPin, Phone, Send, Users2 } from "lucide-react";
import { PublicLayout } from "@/layouts/PublicLayout";
import { INSTITUTION } from "@/api/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Reliance College | Contact Us" },
      {
        name: "description",
        content: "Contact the Student Result Management System team for support, admissions, and examinations.",
      },
      { property: "og:title", content: "Contact Us — SRMS" },
      {
        property: "og:description",
        content: "Find support contacts, office hours, and a message form for the college team.",
      },
    ],
  }),
  component: ContactPage,
});

const contactCards = [
  {
    icon: Phone,
    title: "Call the office",
    value: INSTITUTION.phone,
    text: "Reach the examination and administration desk during working hours.",
  },
  {
    icon: Mail,
    title: "Email support",
    value: INSTITUTION.email,
    text: "Send result, verification, or admissions queries by email.",
  },
  {
    icon: MapPin,
    title: "Visit campus",
    value: INSTITUTION.address,
    text: "Visit the college office for official assistance and documentation.",
  },
];

const officeHours = [
  ["Sunday - Thursday", "9:00 AM - 4:30 PM"],
  ["Friday", "9:00 AM - 2:00 PM"],
  ["Saturday", "Closed"],
];

function ContactPage() {
  return (
    <PublicLayout>
      <section className="bg-[#f8f4ea]">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
          <div className="relative overflow-hidden rounded-[30px] border border-border bg-card shadow-[0_24px_60px_-34px_rgba(15,23,42,0.45)]">
            <div className="relative min-h-85 lg:min-h-105">
              <img
                src="/assets/Reliance-College-Image.jpg"
                alt="Reliance College campus"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,24,54,0.9)_0%,rgba(18,24,54,0.78)_32%,rgba(18,24,54,0.35)_68%,rgba(18,24,54,0.14)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_26%)]" />

              <div className="relative flex min-h-85 lg:min-h-105 items-center">
                <div className="w-full px-6 py-10 sm:px-8 lg:px-12">
                  <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_360px] lg:items-end">
                    <div className="max-w-2xl text-white">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-white/72">Contact Us</p>
                      <h1 className="mt-4 text-[34px] font-semibold leading-[1.04] tracking-[-0.03em] text-balance sm:text-[26px] lg:text-[42px]">
                        Corporate support, admissions, and official contact in one place.
                      </h1>
                      <p className="mt-5 max-w-xl text-[12px] leading-[1.7] text-white/88 sm:text-[15px]">
                        Reliance College, Saraswatinagar, Chabahil provides a professional contact channel for academic
                        support, result inquiries, admissions, and verification requests.
                      </p>

                      <div className="mt-7 flex flex-wrap gap-2 text-[12px] text-white/72">
                        <span className="rounded-full border border-white/15 bg-white/12 px-3 py-1 backdrop-blur-sm">Admissions</span>
                        <span className="rounded-full border border-white/15 bg-white/12 px-3 py-1 backdrop-blur-sm">Examinations</span>
                        <span className="rounded-full border border-white/15 bg-white/12 px-3 py-1 backdrop-blur-sm">Support Desk</span>
                      </div>
                    </div>

                    <div className="rounded-[26px] border border-white/15 bg-white/10 p-5 text-white backdrop-blur-md">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white p-1.5">
                          <img src="/assets/Reliance-College-Logo.webp" alt="Reliance College logo" className="h-full w-full object-contain" />
                        </div>
                        <div>
                          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/70">Official contact</p>
                          <p className="text-[14px] text-white/88">Reliance College office</p>
                        </div>
                      </div>

                      <div className="mt-5 space-y-3 text-[14px]">
                        <p className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3">{INSTITUTION.address}</p>
                        <p className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3">{INSTITUTION.email}</p>
                        <p className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3">{INSTITUTION.phone}</p>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <Button asChild className="bg-white text-[#1f2b4a] hover:bg-white/90">
                          <a href={INSTITUTION.website} target="_blank" rel="noreferrer">
                            Visit Website <ExternalLink className="ml-1.5 h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {contactCards.map((card) => (
              <div key={card.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <card.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                <h2 className="mt-4 text-[15px] font-semibold text-foreground">{card.title}</h2>
                <p className="mt-1 text-[14px] font-medium text-[#243555]">{card.value}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{card.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
            <div className="rounded-[30px] border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Clock3 className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-[16px] font-semibold text-foreground">Office hours</h2>
                  <p className="text-[13px] text-muted-foreground">Best times to contact the college team.</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {officeHours.map(([day, time]) => (
                  <div key={day} className="rounded-2xl border border-border bg-surface p-4">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-subtle-foreground">{day}</p>
                    <p className="mt-1 text-[14px] font-medium text-foreground">{time}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[30px] border border-border bg-surface p-3 shadow-sm">
                <div className="flex items-center justify-between gap-3 px-2 py-2">
                  <div>
                    <h2 className="text-[16px] font-semibold text-foreground">Find us on the map</h2>
                    <p className="text-[13px] text-muted-foreground">Saraswatinagar, Chabahil, Kathmandu</p>
                  </div>
                  <a
                    href={INSTITUTION.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:underline"
                  >
                    Open site <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>

                <div className="mt-2 overflow-hidden rounded-3xl border border-border bg-card">
                  <div className="mx-auto aspect-square w-full max-w-[calc(100%-3.125rem)] h-[250px]">
                    <iframe
                      title="Reliance College location map"
                      src="https://www.google.com/maps?q=Reliance+College+Saraswatinagar+Chabahil+Kathmandu&output=embed"
                      className="h-full w-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-border bg-[#1f2b4a] p-5 text-white shadow-[0_24px_60px_-34px_rgba(15,23,42,0.45)] sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white p-1.5">
                  <img
                    src="/assets/Reliance-College-Logo.webp"
                    alt="Reliance College logo"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/70">Send a message</p>
                  <p className="text-[14px] text-white/88">Professional support form</p>
                </div>
              </div>

              <form className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input className="border-white/12 bg-white/10 text-white placeholder:text-white/45" placeholder="Your name" />
                  <Input className="border-white/12 bg-white/10 text-white placeholder:text-white/45" placeholder="Your email" />
                </div>
                <Input className="border-white/12 bg-white/10 text-white placeholder:text-white/45" placeholder="Subject" />
                <Textarea
                  className="min-h-40 border-white/12 bg-white/10 text-white placeholder:text-white/45"
                  placeholder="Write your message here"
                />
                <Button className="w-full bg-white text-[#1f2b4a] hover:bg-white/90">
                  Send Message <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <div className="mt-6 rounded-2xl border border-white/12 bg-white/8 px-4 py-4">
                <div className="flex items-start gap-3">
                  <Users2 className="mt-0.5 h-4 w-4 text-white/75" aria-hidden="true" />
                  <div>
                    <p className="text-[13px] font-semibold text-white">Faster response</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-white/75">
                      Include your student number, class, and the purpose of the message for quicker handling.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
