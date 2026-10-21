import Link from "@/components/ui/link";
import {
  ArrowUpRight,
  Camera,
  Handshake,
  LineChart,
  Megaphone,
  ScanSearch,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { services, type ServiceIcon } from "@/content/home";

const ICONS: Record<ServiceIcon, LucideIcon> = {
  search: ScanSearch,
  camera: Camera,
  chart: LineChart,
  megaphone: Megaphone,
  handshake: Handshake,
  shield: ShieldCheck,
};

export function ServicesSection() {
  return (
    <section aria-labelledby="servicios-title" className="section border-t border-line">
      <div className="container-luxe">
        <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <Reveal>
            <SectionHeading
              index="04"
              eyebrow="Servicios"
              title={<span id="servicios-title">Todo el proceso, en una sola mano</span>}
              intro="Personalización y servicios a medida para cada situación."
            />
          </Reveal>
          <Reveal delay={0.1} className="shrink-0">
            <Link
              href="/servicios"
              className="link-underline inline-flex items-center gap-2 text-sm text-muted hover:text-fg"
            >
              Todos los servicios <ArrowUpRight className="size-4" strokeWidth={1.5} aria-hidden />
            </Link>
          </Reveal>
        </div>

        <RevealGroup className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => {
            const Icon = ICONS[s.icon];
            return (
              <RevealItem
                key={s.title}
                className="group relative bg-bg p-8 transition-colors duration-500 hover:bg-bg-secondary lg:p-10"
              >
                <div className="mb-12 flex items-start justify-between">
                  <Icon
                    className="size-7 text-accent transition-transform duration-500 ease-luxe group-hover:-translate-y-1"
                    strokeWidth={1.1}
                    aria-hidden
                  />
                  <span className="tabular text-xs text-subtle">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mb-3 text-xl">{s.title}</h3>
                <p className="text-sm text-muted">{s.text}</p>
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-700 ease-luxe group-hover:scale-x-100"
                />
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
