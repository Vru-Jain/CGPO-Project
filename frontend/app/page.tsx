import Link from "next/link";
import { Github, ArrowUpRight, ArrowRight } from "lucide-react";
import { AnimatedHeroGraph } from "@/components/AnimatedHeroGraph";
import { ArchitectureSection } from "@/components/ArchitectureSection";
import { Spotlight } from "@/components/ui/spotlight";

// ── Landing page design tokens (isolated from dashboard) ──────────────────
const C = {
  bg:      "#0a0f1e",   // deep navy
  surface: "#0f1929",   // card surface
  border:  "#1d2d4a",   // subtle border
  text:    "#e6eeff",   // cool near-white
  muted:   "#4d6488",   // navy-muted body
  dim:     "#283a54",   // very dim (labels, specs)
  accent:  "#3b7bff",   // electric blue
  accentT: "rgba(59,123,255,0.08)",  // accent tint
  accentB: "rgba(59,123,255,0.22)",  // accent border
  green:   "#22c55e",   // positive return
} as const;

const mono = "var(--font-mono)";
const sans = "var(--font-bricolage)";

export default function LandingPage() {
  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: sans }} className="min-h-screen overflow-x-hidden">
      <Spotlight />

      {/* ── NAV ────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl"
        style={{ borderBottom: `1px solid ${C.border}`, background: `${C.bg}f0` }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-6">
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center w-6 h-6 rounded"
              style={{ background: C.accent, flexShrink: 0 }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="2.5" fill="white" fillOpacity="0.9" />
                <line x1="6" y1="1" x2="6" y2="5" stroke="white" strokeOpacity="0.6" strokeWidth="1" />
                <line x1="6" y1="7" x2="6" y2="11" stroke="white" strokeOpacity="0.6" strokeWidth="1" />
                <line x1="1" y1="6" x2="4.5" y2="6" stroke="white" strokeOpacity="0.4" strokeWidth="1" />
                <line x1="7.5" y1="6" x2="11" y2="6" stroke="white" strokeOpacity="0.4" strokeWidth="1" />
              </svg>
            </div>
            <span style={{ fontFamily: mono, fontSize: "13px", fontWeight: 700, letterSpacing: "0.05em", color: C.text }}>
              CGPO
            </span>
          </div>

          <div className="flex items-center gap-5">
            {[
              { label: "Capabilities", href: "#capabilities" },
              { label: "Architecture", href: "#architecture" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="hidden sm:block transition-colors"
                style={{ fontSize: "13px", color: C.muted }}
                onMouseEnter={e => ((e.target as HTMLElement).style.color = C.text)}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = C.muted)}
              >
                {label}
              </a>
            ))}
            <a
              href="https://github.com/Vru-Jain/CGPO-Project"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex transition-colors"
              style={{ color: C.muted }}
              aria-label="GitHub"
              onMouseEnter={e => ((e.target as HTMLElement).style.color = C.text)}
              onMouseLeave={e => ((e.target as HTMLElement).style.color = C.muted)}
            >
              <Github size={15} />
            </a>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                fontFamily: mono, fontSize: "12px", fontWeight: 600,
                letterSpacing: "0.04em", background: C.accent, color: "#fff",
                padding: "7px 16px", borderRadius: "6px",
              }}
            >
              Dashboard <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative min-h-[100dvh] pt-14 flex items-center px-6 overflow-hidden">
        {/* Deep blue ambient — left */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(ellipse 50% 80% at -5% 55%, rgba(59,123,255,0.07), transparent 60%)` }}
        />

        <div className="relative max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-16 items-center py-20 lg:py-0">

          {/* Left */}
          <div className="max-w-[520px]">
            <div
              className="inline-flex items-center gap-2 rounded-full mb-8 animate-fade-in-up"
              style={{
                border: `1px solid ${C.accentB}`,
                background: C.accentT,
                padding: "5px 12px 5px 8px",
              }}
            >
              <span
                className="relative flex h-1.5 w-1.5"
              >
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full"
                  style={{ background: C.accent, opacity: 0.7 }}
                />
                <span
                  className="relative inline-flex rounded-full h-1.5 w-1.5"
                  style={{ background: C.accent }}
                />
              </span>
              <span style={{ fontFamily: mono, fontSize: "11px", color: C.accent, letterSpacing: "0.04em" }}>
                Research Project — Final Year
              </span>
            </div>

            <h1
              className="animate-fade-in-up delay-100"
              style={{
                fontSize: "clamp(2.4rem, 5vw, 4.4rem)",
                fontWeight: 800, lineHeight: 1.06,
                letterSpacing: "-0.03em", marginBottom: "18px",
                textWrap: "balance",
              } as React.CSSProperties}
            >
              Cognitive Graph{" "}
              <span style={{ color: C.accent }}>Portfolio</span>{" "}
              Optimizer
            </h1>

            <p
              className="animate-fade-in-up delay-200"
              style={{ fontSize: "15px", color: C.muted, lineHeight: 1.8, maxWidth: "46ch", marginBottom: "36px" }}
            >
              GNN and reinforcement learning agent that models a stock universe
              as a correlation graph, learns to outperform major indices, and
              surfaces transparent per-asset allocation rationale.
            </p>

            {/* Metric row */}
            <div
              className="animate-fade-in-up delay-300"
              style={{ display: "flex", gap: "0", marginBottom: "40px" }}
            >
              {[
                { label: "Sharpe Ratio", value: "1.34", note: "vs 0.81 SPY", positive: true },
                { label: "Cum. Return", value: "+17.2%", note: "104 trading days", positive: true },
                { label: "Max Drawdown", value: "15.7%", note: "annualised", positive: false },
              ].map(({ label, value, note, positive }, i) => (
                <div
                  key={label}
                  style={{
                    flex: 1,
                    padding: "16px 20px",
                    borderTop: `1px solid ${C.border}`,
                    borderBottom: `1px solid ${C.border}`,
                    borderLeft: `1px solid ${C.border}`,
                    borderRight: i === 2 ? `1px solid ${C.border}` : "none",
                    background: i === 0 ? C.accentT : "transparent",
                  }}
                >
                  <div style={{ fontFamily: mono, fontSize: "9px", color: C.muted, letterSpacing: "0.08em", marginBottom: "6px", textTransform: "uppercase" as const }}>
                    {label}
                  </div>
                  <div style={{ fontFamily: mono, fontSize: "22px", fontWeight: 700, color: positive ? C.text : C.muted, letterSpacing: "-0.02em", marginBottom: "3px" }}>
                    {i === 0 && <span style={{ color: C.accent }}>{value}</span>}
                    {i !== 0 && <span style={{ color: positive ? C.green : C.muted }}>{value}</span>}
                  </div>
                  <div style={{ fontFamily: mono, fontSize: "9px", color: C.dim, letterSpacing: "0.04em" }}>{note}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 animate-fade-in-up delay-400">
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.98] transition-all"
                style={{
                  fontSize: "14px", fontWeight: 600, background: C.accent, color: "#fff",
                  padding: "12px 24px", borderRadius: "8px",
                  boxShadow: `0 4px 24px rgba(59,123,255,0.3)`,
                }}
              >
                Launch Dashboard
                <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
              <a
                href="https://github.com/Vru-Jain/CGPO-Project"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:-translate-y-0.5 active:scale-[0.98] transition-all"
                style={{
                  fontSize: "14px", fontWeight: 500, color: C.muted,
                  padding: "12px 24px", borderRadius: "8px",
                  border: `1px solid ${C.border}`,
                }}
              >
                <Github size={15} />
                View Source
              </a>
            </div>
          </div>

          {/* Right — graph */}
          <div className="hidden lg:flex items-center justify-center animate-fade-in-up delay-200">
            <AnimatedHeroGraph />
          </div>
        </div>
      </section>

      {/* ── CAPABILITIES ───────────────────────────────────── */}
      <section id="capabilities" style={{ borderTop: `1px solid ${C.border}` }} className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div style={{ marginBottom: "48px" }}>
            <div style={{ fontFamily: mono, fontSize: "11px", color: C.accent, letterSpacing: "0.08em", marginBottom: "10px" }}>
              01 — SYSTEM CAPABILITIES
            </div>
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              How the model works
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1px", background: C.border }}>
            {[
              {
                tag: "GNN",
                title: "Graph Neural Network",
                desc: "Stocks become nodes, correlations become edges. The GNN reads market microstructure and surfaces cross-asset dependencies linear models miss.",
                spec: "PyTorch Geometric · GCNConv · skip connection",
              },
              {
                tag: "A2C",
                title: "Reinforcement Learning",
                desc: "An Advantage Actor-Critic agent learns portfolio weights by maximising risk-adjusted excess return over a benchmark across training episodes.",
                spec: "A2C · γ = 0.99 · Dirichlet distribution · Sharpe objective",
              },
              {
                tag: "GPU",
                title: "Serverless GPU Backend",
                desc: "Training runs on Modal with an NVIDIA T4 GPU. Scales to zero when idle. Trained weights persist across cold starts in a Modal Volume.",
                spec: "Modal · NVIDIA T4 · timeout 30 min · ~3 min run",
              },
              {
                tag: "IDX",
                title: "Global Index Benchmarks",
                desc: "Real-time comparison against five indices across selectable time windows. US and Indian market universes supported out of the box.",
                spec: "S&P 500 · Nasdaq 100 · Dow Jones · Nifty 50 · Sensex",
              },
            ].map(({ tag, title, desc, spec }) => (
              <div
                key={tag}
                className="group transition-colors duration-200"
                style={{ background: C.surface, padding: "28px 28px 24px" }}
              >
                <div
                  style={{
                    display: "inline-block",
                    fontFamily: mono, fontSize: "10px", fontWeight: 700,
                    color: C.accent, background: C.accentT,
                    border: `1px solid ${C.accentB}`,
                    padding: "3px 8px", borderRadius: "4px",
                    letterSpacing: "0.06em", marginBottom: "16px",
                  }}
                >
                  {tag}
                </div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "10px", lineHeight: 1.3 }}>{title}</h3>
                <p style={{ fontSize: "13px", color: C.muted, lineHeight: 1.8, marginBottom: "16px" }}>{desc}</p>
                <div style={{ fontFamily: mono, fontSize: "10px", color: C.dim, letterSpacing: "0.04em" }}>{spec}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENCHMARK RESULTS ──────────────────────────────── */}
      <section style={{ borderTop: `1px solid ${C.border}` }} className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div style={{ marginBottom: "48px" }}>
            <div style={{ fontFamily: mono, fontSize: "11px", color: C.accent, letterSpacing: "0.08em", marginBottom: "10px" }}>
              02 — BENCHMARK RESULTS
            </div>
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              Performance against the market
            </h2>
            <p style={{ fontSize: "13px", color: C.muted, marginTop: "8px", fontFamily: mono }}>
              Table IV · 104 trading days · Jun–Dec 2025 · seed 42
            </p>
          </div>

          <div style={{ border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden" }}>
            <div
              style={{
                display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr",
                padding: "10px 24px", background: C.surface,
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              {["MODEL", "ANN. SHARPE", "MAX DRAWDOWN", "CUM. RETURN"].map((h, i) => (
                <span
                  key={h}
                  style={{
                    fontFamily: mono, fontSize: "10px", color: C.muted,
                    letterSpacing: "0.08em", textAlign: i === 0 ? "left" : "right",
                  }}
                >
                  {h}
                </span>
              ))}
            </div>

            {[
              { model: "CGPO / GNN", sharpe: "1.34", dd: "−15.7%", ret: "+17.2%", primary: true },
              { model: "MLP (ablation)", sharpe: "0.94", dd: "−18.3%", ret: "+12.6%", primary: false },
              { model: "SPY — S&P 500", sharpe: "0.81", dd: "−12.1%", ret: "+8.4%", primary: false },
            ].map(({ model, sharpe, dd, ret, primary }, i) => (
              <div
                key={model}
                style={{
                  display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr",
                  padding: "18px 24px",
                  background: primary ? C.accentT : "transparent",
                  borderTop: i > 0 ? `1px solid ${C.border}` : undefined,
                }}
              >
                <div className="flex items-center gap-2.5">
                  {primary && (
                    <span
                      style={{
                        fontFamily: mono, fontSize: "9px", color: C.accent,
                        background: C.accentT, border: `1px solid ${C.accentB}`,
                        padding: "2px 6px", borderRadius: "3px", letterSpacing: "0.06em", flexShrink: 0,
                      }}
                    >
                      BEST
                    </span>
                  )}
                  <span style={{ fontFamily: mono, fontSize: "13px", fontWeight: primary ? 600 : 400, color: primary ? C.text : C.muted }}>
                    {model}
                  </span>
                </div>
                <span style={{ fontFamily: mono, fontSize: "13px", fontWeight: primary ? 600 : 400, textAlign: "right", color: primary ? C.accent : C.muted }}>
                  {sharpe}
                </span>
                <span style={{ fontFamily: mono, fontSize: "13px", textAlign: "right", color: C.muted }}>
                  {dd}
                </span>
                <span style={{ fontFamily: mono, fontSize: "13px", fontWeight: primary ? 600 : 400, textAlign: "right", color: primary ? C.green : C.muted }}>
                  {ret}
                </span>
              </div>
            ))}
          </div>

          <p style={{ fontFamily: mono, fontSize: "10px", color: C.dim, marginTop: "12px", lineHeight: 1.9 }}>
            Universe: NVDA · GOOG · AAPL · AMZN · MSFT · META · TSLA
            <br />
            Annualised Sharpe uses 252 trading-day convention.
            Run <code style={{ color: C.muted }}>python generate_table_iv.py</code> to reproduce.
          </p>
        </div>
      </section>

      {/* ── ARCHITECTURE ───────────────────────────────────── */}
      <section id="architecture" style={{ borderTop: `1px solid ${C.border}` }} className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div style={{ marginBottom: "48px" }}>
            <div style={{ fontFamily: mono, fontSize: "11px", color: C.accent, letterSpacing: "0.08em", marginBottom: "10px" }}>
              03 — SYSTEM ARCHITECTURE
            </div>
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 700, letterSpacing: "-0.02em" }}>
              Three-tier serverless stack
            </h2>
          </div>
          <ArchitectureSection />
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section style={{ borderTop: `1px solid ${C.border}`, padding: "96px 24px" }}>
        <div className="max-w-6xl mx-auto">
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-10"
            style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: "12px", padding: "48px",
            }}
          >
            <div>
              <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2.2rem)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "10px" }}>
                See the model in action.
              </h2>
              <p style={{ fontSize: "14px", color: C.muted, maxWidth: "44ch", lineHeight: 1.75 }}>
                Run a live portfolio optimisation, compare against global benchmarks,
                explore the asset graph, and trigger a GPU training run.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="flex-shrink-0 group inline-flex items-center gap-2 hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.98] transition-all"
              style={{
                fontSize: "14px", fontWeight: 600, background: C.accent, color: "#fff",
                padding: "14px 28px", borderRadius: "8px", whiteSpace: "nowrap",
                boxShadow: `0 4px 24px rgba(59,123,255,0.3)`,
              }}
            >
              Launch Dashboard
              <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "28px 24px" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center w-5 h-5 rounded"
              style={{ background: C.accent, flexShrink: 0 }}
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="2.5" fill="white" fillOpacity="0.9" />
                <line x1="6" y1="1" x2="6" y2="5" stroke="white" strokeOpacity="0.6" strokeWidth="1" />
                <line x1="6" y1="7" x2="6" y2="11" stroke="white" strokeOpacity="0.6" strokeWidth="1" />
                <line x1="1" y1="6" x2="4.5" y2="6" stroke="white" strokeOpacity="0.4" strokeWidth="1" />
                <line x1="7.5" y1="6" x2="11" y2="6" stroke="white" strokeOpacity="0.4" strokeWidth="1" />
              </svg>
            </div>
            <span style={{ fontFamily: mono, fontSize: "11px", color: C.muted }}>
              CGPO — Cognitive Graph Portfolio Optimizer
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/Vru-Jain/CGPO-Project"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors"
              style={{ fontFamily: mono, fontSize: "12px", color: C.muted }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = C.text)}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = C.muted)}
            >
              <Github size={13} /> GitHub
            </a>
            <Link
              href="/dashboard"
              className="transition-colors"
              style={{ fontFamily: mono, fontSize: "12px", color: C.muted }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = C.text)}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = C.muted)}
            >
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
