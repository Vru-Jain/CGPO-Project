import Link from "next/link";
import { Github, ArrowRight } from "lucide-react";
import { AnimatedHeroGraph } from "@/components/AnimatedHeroGraph";
import { ArchitectureSection } from "@/components/ArchitectureSection";
import { Spotlight } from "@/components/ui/spotlight";

const A = "#f0a020";   // amber accent
const BG = "#08090a";  // near-black background
const SF = "#0e0f10";  // surface
const BD = "#1c1e20";  // border
const TX = "#e8e4d8";  // warm off-white text
const MT = "#6b6758";  // muted
const DM = "#323530";  // dim

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: BG, color: TX }}>
      <Spotlight />

      {/* ── NAV ──────────────────────────────────────────── */}
      <nav
        className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl"
        style={{ borderBottom: `1px solid ${BD}`, background: `${BG}ee` }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-6">
          <span
            style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: A, fontWeight: 700, letterSpacing: "0.14em" }}
          >
            CGPO
          </span>
          <div className="flex items-center gap-6">
            <a
              href="#capabilities"
              className="hidden sm:block transition-opacity hover:opacity-100"
              style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: MT, letterSpacing: "0.1em", opacity: 0.7 }}
            >
              CAPABILITIES
            </a>
            <a
              href="#architecture"
              className="hidden sm:block transition-opacity hover:opacity-100"
              style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: MT, letterSpacing: "0.1em", opacity: 0.7 }}
            >
              ARCHITECTURE
            </a>
            <a
              href="https://github.com/Vru-Jain/CGPO-Project"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center transition-opacity hover:opacity-100"
              style={{ color: MT, opacity: 0.7 }}
              aria-label="GitHub"
            >
              <Github size={14} />
            </a>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 hover:opacity-90 active:scale-[0.98] transition-all"
              style={{
                fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700,
                letterSpacing: "0.1em", background: A, color: BG,
                padding: "7px 14px", borderRadius: "3px",
              }}
            >
              DASHBOARD <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-[100dvh] pt-14 flex items-center px-6 overflow-hidden">
        {/* Ambient amber glow — left side */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(ellipse 55% 75% at 0% 55%, rgba(240,160,32,0.04), transparent 65%)` }}
        />

        <div className="relative max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-16 items-center py-20 lg:py-0">

          {/* Left — content */}
          <div className="max-w-xl">
            <div
              className="flex items-center gap-3 mb-8 animate-fade-in-up"
              style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: MT, letterSpacing: "0.12em" }}
            >
              <span style={{ display: "inline-block", width: "32px", height: "1px", background: A, flexShrink: 0 }} />
              PORTFOLIO INTELLIGENCE SYSTEM
            </div>

            <h1
              className="animate-fade-in-up delay-100"
              style={{
                fontSize: "clamp(2.7rem, 5.5vw, 5rem)",
                fontWeight: 800, lineHeight: 1.03,
                letterSpacing: "-0.03em", marginBottom: "20px",
              }}
            >
              Cognitive Graph<br />Portfolio Optimizer
            </h1>

            <p
              className="animate-fade-in-up delay-200"
              style={{ fontSize: "15px", color: MT, lineHeight: 1.8, maxWidth: "38ch", marginBottom: "40px" }}
            >
              GNN and reinforcement learning agent that models stocks as a
              correlation graph, learns to outperform global indices, and
              explains every allocation.
            </p>

            {/* Key metrics */}
            <div
              className="animate-fade-in-up delay-300"
              style={{
                borderTop: `1px solid ${BD}`, borderBottom: `1px solid ${BD}`,
                padding: "22px 0", marginBottom: "40px",
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px",
              }}
            >
              {[
                { label: "SHARPE RATIO", value: "1.34", highlight: true },
                { label: "CUM. RETURN", value: "+17.2%", highlight: true },
                { label: "MAX DRAWDOWN", value: "−15.7%", highlight: false },
              ].map(({ label, value, highlight }) => (
                <div key={label}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)", fontSize: "9px",
                      color: DM, letterSpacing: "0.1em", marginBottom: "7px",
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)", fontSize: "21px",
                      fontWeight: 600, color: highlight ? A : MT,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 animate-fade-in-up delay-400">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.98] transition-all"
                style={{
                  fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 700,
                  letterSpacing: "0.08em", background: A, color: BG,
                  padding: "13px 24px", borderRadius: "3px",
                }}
              >
                LAUNCH DASHBOARD <ArrowRight size={13} />
              </Link>
              <a
                href="https://github.com/Vru-Jain/CGPO-Project"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:-translate-y-0.5 active:scale-[0.98] transition-all"
                style={{
                  fontFamily: "var(--font-mono)", fontSize: "11px",
                  letterSpacing: "0.08em", color: MT,
                  padding: "13px 24px", borderRadius: "3px",
                  border: `1px solid ${BD}`,
                }}
              >
                <Github size={13} />
                VIEW SOURCE
              </a>
            </div>
          </div>

          {/* Right — animated graph */}
          <div className="hidden lg:flex items-center justify-center animate-fade-in-up delay-200">
            <AnimatedHeroGraph />
          </div>
        </div>
      </section>

      {/* ── CAPABILITIES ─────────────────────────────────── */}
      <section id="capabilities" style={{ borderTop: `1px solid ${BD}` }} className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div
            style={{
              fontFamily: "var(--font-mono)", fontSize: "10px", color: MT,
              letterSpacing: "0.12em", marginBottom: "56px",
              display: "flex", alignItems: "center", gap: "12px",
            }}
          >
            <span style={{ color: A }}>01</span>
            <span style={{ flex: 1, height: "1px", background: BD }} />
            CAPABILITIES
          </div>

          <div style={{ borderTop: `1px solid ${BD}` }}>
            {[
              {
                tag: "GNN",
                title: "Graph Neural Network",
                desc: "Stocks become nodes, correlations become edges. The GNN reads market microstructure and surfaces cross-asset dependencies that linear models miss.",
                spec: "PyTorch Geometric · GCNConv · skip connection · cross-sectional z-scoring",
              },
              {
                tag: "A2C",
                title: "Reinforcement Learning Agent",
                desc: "An Advantage Actor-Critic agent learns to allocate portfolio weights by maximising risk-adjusted excess return over a benchmark across training episodes.",
                spec: "A2C · γ = 0.99 · Dirichlet action distribution · Sharpe objective",
              },
              {
                tag: "GPU",
                title: "Serverless GPU Training",
                desc: "Training runs on Modal with an NVIDIA T4 GPU. The container scales to zero between runs. Trained weights persist across cold starts in a Modal Volume.",
                spec: "Modal · NVIDIA T4 · 120 episodes · ~3 min per training run",
              },
              {
                tag: "IDX",
                title: "Multi-Index Benchmarking",
                desc: "Real-time comparison against five global indices across selectable time windows. Pre-built portfolios for US and Indian market universes.",
                spec: "S&P 500 · Nasdaq 100 · Dow Jones · Nifty 50 · Sensex · yfinance",
              },
            ].map(({ tag, title, desc, spec }) => (
              <div
                key={tag}
                style={{
                  display: "grid", gridTemplateColumns: "80px 1fr",
                  borderBottom: `1px solid ${BD}`, padding: "28px 0",
                  gap: "32px", alignItems: "start",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)", fontSize: "11px",
                    fontWeight: 700, color: A, letterSpacing: "0.1em", paddingTop: "2px",
                  }}
                >
                  {tag}
                </div>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px", lineHeight: 1.3 }}>
                    {title}
                  </div>
                  <p style={{ fontSize: "13px", color: MT, lineHeight: 1.8, marginBottom: "12px", maxWidth: "58ch" }}>
                    {desc}
                  </p>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)", fontSize: "10px",
                      color: DM, letterSpacing: "0.06em",
                    }}
                  >
                    {spec}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENCHMARK RESULTS ────────────────────────────── */}
      <section style={{ borderTop: `1px solid ${BD}` }} className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div
            style={{
              fontFamily: "var(--font-mono)", fontSize: "10px", color: MT,
              letterSpacing: "0.12em", marginBottom: "56px",
              display: "flex", alignItems: "center", gap: "12px",
            }}
          >
            <span style={{ color: A }}>02</span>
            <span style={{ flex: 1, height: "1px", background: BD }} />
            BENCHMARK RESULTS
          </div>

          <div
            style={{
              fontFamily: "var(--font-mono)", fontSize: "11px", color: DM,
              letterSpacing: "0.04em", marginBottom: "16px", lineHeight: 1.7,
            }}
          >
            TABLE IV — GNN agent vs MLP ablation vs S&amp;P 500<br />
            104 trading days · Jun–Dec 2025 · 15 training episodes · seed 42
          </div>

          <div style={{ border: `1px solid ${BD}`, overflow: "hidden", borderRadius: "2px" }}>
            <div
              style={{
                display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr",
                padding: "10px 24px", background: SF, borderBottom: `1px solid ${BD}`,
              }}
            >
              {["MODEL", "ANN. SHARPE", "MAX DRAWDOWN", "CUM. RETURN"].map((h, i) => (
                <span
                  key={h}
                  style={{
                    fontFamily: "var(--font-mono)", fontSize: "9px",
                    color: DM, letterSpacing: "0.1em",
                    textAlign: i === 0 ? "left" : "right",
                  }}
                >
                  {h}
                </span>
              ))}
            </div>
            {[
              { model: "CGPO / GNN", sharpe: "1.34", dd: "−15.7%", ret: "+17.2%", primary: true },
              { model: "MLP (ablation)", sharpe: "0.94", dd: "−18.3%", ret: "+12.6%", primary: false },
              { model: "SPY (S&P 500)", sharpe: "0.81", dd: "−12.1%", ret: "+8.4%", primary: false },
            ].map(({ model, sharpe, dd, ret, primary }, i) => (
              <div
                key={model}
                style={{
                  display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr",
                  padding: "16px 24px", alignItems: "center",
                  background: primary ? "rgba(240,160,32,0.05)" : "transparent",
                  borderTop: i > 0 ? `1px solid ${BD}` : undefined,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)", fontSize: "12px",
                    fontWeight: primary ? 600 : 400, color: primary ? A : MT,
                  }}
                >
                  {model}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)", fontSize: "12px",
                    fontWeight: primary ? 600 : 400, textAlign: "right",
                    color: primary ? A : MT,
                  }}
                >
                  {sharpe}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)", fontSize: "12px",
                    textAlign: "right", color: MT,
                  }}
                >
                  {dd}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)", fontSize: "12px",
                    fontWeight: primary ? 600 : 400, textAlign: "right",
                    color: primary ? A : MT,
                  }}
                >
                  {ret}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              fontFamily: "var(--font-mono)", fontSize: "10px",
              color: DM, marginTop: "12px", lineHeight: 1.9,
            }}
          >
            Universe: NVDA · GOOG · AAPL · AMZN · MSFT · META · TSLA
            <br />
            Annualised Sharpe uses 252 trading-day convention.
            Run <code style={{ color: MT }}>python generate_table_iv.py</code> to reproduce.
          </div>
        </div>
      </section>

      {/* ── ARCHITECTURE ─────────────────────────────────── */}
      <section id="architecture" style={{ borderTop: `1px solid ${BD}` }} className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div
            style={{
              fontFamily: "var(--font-mono)", fontSize: "10px", color: MT,
              letterSpacing: "0.12em", marginBottom: "56px",
              display: "flex", alignItems: "center", gap: "12px",
            }}
          >
            <span style={{ color: A }}>03</span>
            <span style={{ flex: 1, height: "1px", background: BD }} />
            SYSTEM ARCHITECTURE
          </div>
          <ArchitectureSection />
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section style={{ borderTop: `1px solid ${BD}`, padding: "96px 24px" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-10">
          <div>
            <h2
              style={{
                fontSize: "clamp(1.6rem, 3.5vw, 2.8rem)", fontWeight: 800,
                lineHeight: 1.08, letterSpacing: "-0.025em", marginBottom: "12px",
              }}
            >
              Run a live optimisation.
            </h2>
            <p style={{ fontSize: "14px", color: MT, maxWidth: "44ch", lineHeight: 1.75 }}>
              Compare the GNN agent against benchmarks, explore the portfolio
              graph, and trigger a GPU training run from the dashboard.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="flex-shrink-0 inline-flex items-center gap-2 hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.98] transition-all"
            style={{
              fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 700,
              letterSpacing: "0.08em", background: A, color: BG,
              padding: "14px 28px", borderRadius: "3px", whiteSpace: "nowrap",
            }}
          >
            LAUNCH DASHBOARD <ArrowRight size={13} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${BD}`, padding: "28px 24px" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span
            style={{
              fontFamily: "var(--font-mono)", fontSize: "11px",
              color: DM, letterSpacing: "0.08em",
            }}
          >
            CGPO — Cognitive Graph Portfolio Optimizer
          </span>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/Vru-Jain/CGPO-Project"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:opacity-100 transition-opacity"
              style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: DM, letterSpacing: "0.06em", opacity: 0.7 }}
            >
              <Github size={12} /> GitHub
            </a>
            <Link
              href="/dashboard"
              className="hover:opacity-100 transition-opacity"
              style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: DM, letterSpacing: "0.06em", opacity: 0.7 }}
            >
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
