"use client";
import { useRef } from "react";
import { Globe, Cpu, TrendingUp, ArrowRight } from "lucide-react";
import { AnimatedBeam } from "@/components/ui/animated-beam";

export function ArchitectureSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const vercelRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const yfinanceRef = useRef<HTMLDivElement>(null);

  const tiers = [
    { label: "Vercel", sub: "Next.js Frontend", icon: <Globe className="h-5 w-5" />, ref: vercelRef },
    { label: "Modal GPU", sub: "FastAPI + PyTorch", icon: <Cpu className="h-5 w-5" />, ref: modalRef },
    { label: "yfinance", sub: "Live Market Data", icon: <TrendingUp className="h-5 w-5" />, ref: yfinanceRef },
  ];

  return (
    <div ref={containerRef} className="relative grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Animated beams between cards — desktop only */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={vercelRef}
        toRef={modalRef}
        duration={3.5}
        delay={0}
        className="hidden sm:block"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={modalRef}
        toRef={yfinanceRef}
        duration={3.5}
        delay={1.75}
        className="hidden sm:block"
      />
      {/* Reverse beams (feedback loop) */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={yfinanceRef}
        toRef={modalRef}
        reverse
        duration={3.5}
        delay={0.5}
        gradientStartColor="#93bbff"
        gradientStopColor="#1a56db"
        pathOpacity={0.06}
        className="hidden sm:block"
      />

      {tiers.map((tier, i) => (
        <div key={tier.label} className="relative">
          <div
            ref={tier.ref}
            className="p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1"
            style={{ border: "1px solid #dce5f5", background: "#f7f9ff" }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "#c7d8fc")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "#dce5f5")}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl mb-4"
              style={{ background: "#eff3ff", color: "#1a56db" }}
            >
              {tier.icon}
            </div>
            <p className="font-semibold text-sm" style={{ color: "#0d1a38" }}>{tier.label}</p>
            <p className="text-xs mt-1" style={{ color: "#4a6080" }}>{tier.sub}</p>
          </div>
          {i < 2 && (
            <div className="hidden sm:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-10">
              <ArrowRight className="h-4 w-4 text-muted-foreground/40" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
