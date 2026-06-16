import Link from "next/link";
import { Github, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import { ArchitectureSection } from "@/components/ArchitectureSection";

// ── Design tokens ──────────────────────────────────────────────────────────
const C = {
  bg:      "#f7f9ff",   // faint blue-white page background
  surface: "#ffffff",   // card / panel surface
  surface2:"#eef2ff",   // tinted surface
  border:  "#dce5f5",   // subtle border
  text:    "#0d1a38",   // deep navy text
  muted:   "#4a6080",   // muted paragraph
  dim:     "#8fa3bf",   // labels, specs
  accent:  "#1a56db",   // strong royal blue
  accentL: "#eff3ff",   // accent light bg
  accentB: "#c7d8fc",   // accent border
  green:   "#15803d",   // positive return
  greenL:  "#f0fdf4",   // green light
  red:     "#b91c1c",   // negative / drawdown
  redL:    "#fef2f2",   // red light
} as const;

const mono = "var(--font-mono)";

// Mock allocation data for the hero product panel
const ALLOC = [
  { ticker: "NVDA", weight: 0.312, ret: 0.024 },
  { ticker: "MSFT", weight: 0.228, ret: 0.011 },
  { ticker: "AAPL", weight: 0.187, ret: 0.008 },
  { ticker: "AMZN", weight: 0.131, ret: -0.003 },
  { ticker: "META", weight: 0.082, ret: 0.019 },
  { ticker: "GOOG", weight: 0.060, ret: 0.006 },
];

export default function LandingPage() {
  return (
    // Override dark-mode html class with explicit light styles
    <div style={{ background: C.bg, color: C.text }} className="min-h-screen overflow-x-hidden">

      {/* ── NAV ──────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{ borderBottom: `1px solid ${C.border}`, background: `${C.surface}e8` }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-6">
          <div className="flex items-center gap-2">
            <div
              style={{ background: C.accent, borderRadius: "6px", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            >
              <TrendingUp size={14} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: "15px", letterSpacing: "-0.01em" }}>CGPO</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#how-it-works" style={{ fontSize: "13px", color: C.muted, textDecoration: "none" }} className="hidden sm:block hover:text-inherit transition-colors">How it works</a>
            <a href="#results" style={{ fontSize: "13px", color: C.muted, textDecoration: "none" }} className="hidden sm:block hover:text-inherit transition-colors">Results</a>
            <a
              href="https://github.com/Vru-Jain/CGPO-Project"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: C.muted, display: "flex" }}
              aria-label="GitHub"
              className="hidden sm:flex hover:text-inherit transition-colors"
            >
              <Github size={16} />
            </a>
            <Link
              href="/dashboard"
              style={{ background: C.accent, color: "#fff", borderRadius: "7px", fontSize: "13px", fontWeight: 600, padding: "8px 18px", display: "inline-flex", alignItems: "center", gap: "5px" }}
              className="hover:opacity-90 transition-opacity"
            >
              Open Dashboard <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="px-6 pt-16 pb-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 items-start">

          {/* Left — copy */}
          <div className="pt-6">
            <div
              style={{
                display: "inline-flex", alignItems: "center", gap: "7px",
                background: C.accentL, border: `1px solid ${C.accentB}`,
                borderRadius: "20px", padding: "4px 12px", marginBottom: "24px",
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, display: "inline-block", flexShrink: 0 }} />
              <span style={{ fontFamily: mono, fontSize: "11px", color: C.accent, letterSpacing: "0.04em" }}>
                Final Year Research Project
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(2.2rem, 4.5vw, 3.8rem)",
                fontWeight: 800, lineHeight: 1.08,
                letterSpacing: "-0.03em", marginBottom: "20px",
                color: C.text,
              }}
            >
              Graph-based AI for{" "}
              <span style={{ color: C.accent }}>portfolio</span>{" "}
              optimisation
            </h1>

            <p style={{ fontSize: "16px", color: C.muted, lineHeight: 1.8, maxWidth: "44ch", marginBottom: "40px" }}>
              CGPO models a universe of stocks as a correlation graph, then trains a
              reinforcement learning agent to beat major benchmarks. Every allocation
              comes with transparent per-asset reasoning.
            </p>

            {/* Stat pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "36px" }}>
              {[
                { label: "Sharpe ratio", value: "1.34", sub: "vs 0.81 S&P 500", bg: C.accentL, border: C.accentB, valColor: C.accent },
                { label: "Cumulative return", value: "+17.2%", sub: "104 trading days", bg: C.greenL, border: "#bbf7d0", valColor: C.green },
                { label: "Max drawdown", value: "15.7%", sub: "annualised", bg: "#fafafa", border: C.border, valColor: C.muted },
              ].map(({ label, value, sub, bg, border, valColor }) => (
                <div
                  key={label}
                  style={{
                    background: bg, border: `1px solid ${border}`,
                    borderRadius: "10px", padding: "12px 16px", minWidth: "120px",
                  }}
                >
                  <div style={{ fontFamily: mono, fontSize: "9px", color: C.dim, letterSpacing: "0.08em", marginBottom: "5px", textTransform: "uppercase" as const }}>{label}</div>
                  <div style={{ fontFamily: mono, fontSize: "22px", fontWeight: 700, color: valColor, letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</div>
                  <div style={{ fontFamily: mono, fontSize: "10px", color: C.dim, marginTop: "4px" }}>{sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              <Link
                href="/dashboard"
                style={{
                  background: C.accent, color: "#fff", borderRadius: "9px",
                  fontSize: "14px", fontWeight: 600, padding: "13px 26px",
                  display: "inline-flex", alignItems: "center", gap: "7px",
                  boxShadow: "0 4px 20px rgba(26,86,219,0.25)",
                  textDecoration: "none",
                }}
                className="hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.98] transition-all"
              >
                Open Dashboard <ArrowUpRight size={15} />
              </Link>
              <a
                href="https://github.com/Vru-Jain/CGPO-Project"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  border: `1.5px solid ${C.border}`, color: C.muted,
                  borderRadius: "9px", fontSize: "14px", fontWeight: 500,
                  padding: "13px 26px", display: "inline-flex", alignItems: "center", gap: "7px",
                  textDecoration: "none", background: C.surface,
                }}
                className="hover:border-[#a0b4d0] hover:text-inherit hover:-translate-y-0.5 active:scale-[0.98] transition-all"
              >
                <Github size={15} /> View Source
              </a>
            </div>
          </div>

          {/* Right — product preview panel */}
          <div
            className="hidden lg:block"
            style={{
              background: C.surface,
              border: `1.5px solid ${C.border}`,
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow: "0 8px 40px rgba(13,26,56,0.08)",
            }}
          >
            {/* Panel header */}
            <div
              style={{
                borderBottom: `1px solid ${C.border}`,
                padding: "12px 16px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "#fafbff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ display: "flex", gap: "5px" }}>
                  {["#ff5f57","#febc2e","#28c840"].map(c => (
                    <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "inline-block" }} />
                  ))}
                </div>
                <span style={{ fontFamily: mono, fontSize: "11px", color: C.dim, marginLeft: "6px" }}>Portfolio Allocation</span>
              </div>
              <span
                style={{
                  fontFamily: mono, fontSize: "9px", color: C.accent,
                  background: C.accentL, border: `1px solid ${C.accentB}`,
                  borderRadius: "4px", padding: "2px 7px", letterSpacing: "0.04em",
                }}
              >
                LIVE
              </span>
            </div>

            {/* Weights */}
            <div style={{ padding: "16px" }}>
              {ALLOC.map(({ ticker, weight, ret }) => (
                <div
                  key={ticker}
                  style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}
                >
                  <span style={{ fontFamily: mono, fontSize: "11px", fontWeight: 600, color: C.text, width: 36, flexShrink: 0 }}>{ticker}</span>
                  <div style={{ flex: 1, background: C.surface2, borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%", borderRadius: "4px",
                        width: `${(weight / 0.312) * 100}%`,
                        background: `linear-gradient(90deg, ${C.accent}, #5b9bff)`,
                      }}
                    />
                  </div>
                  <span style={{ fontFamily: mono, fontSize: "11px", color: C.accent, width: 38, textAlign: "right", flexShrink: 0 }}>
                    {(weight * 100).toFixed(1)}%
                  </span>
                  <span
                    style={{
                      fontFamily: mono, fontSize: "10px",
                      color: ret >= 0 ? C.green : C.red,
                      width: 48, textAlign: "right", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "2px",
                    }}
                  >
                    {ret >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {ret >= 0 ? "+" : ""}{(ret * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>

            {/* Metrics footer */}
            <div
              style={{
                borderTop: `1px solid ${C.border}`,
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                padding: "14px 16px", gap: "1px", background: C.surface2,
              }}
            >
              {[
                { label: "SHARPE", value: "1.34", color: C.accent },
                { label: "RETURN", value: "+17.2%", color: C.green },
                { label: "DRAWDOWN", value: "−15.7%", color: C.muted },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ textAlign: "center" as const }}>
                  <div style={{ fontFamily: mono, fontSize: "9px", color: C.dim, letterSpacing: "0.08em", marginBottom: "3px" }}>{label}</div>
                  <div style={{ fontFamily: mono, fontSize: "15px", fontWeight: 700, color }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Run button */}
            <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}` }}>
              <Link
                href="/dashboard"
                style={{
                  display: "block", textAlign: "center" as const,
                  background: C.accent, color: "#fff",
                  borderRadius: "8px", padding: "10px",
                  fontFamily: mono, fontSize: "12px", fontWeight: 600,
                  letterSpacing: "0.04em", textDecoration: "none",
                }}
                className="hover:opacity-90 transition-opacity"
              >
                Run optimisation →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section id="how-it-works" style={{ borderTop: `1px solid ${C.border}`, background: C.surface }} className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div style={{ marginBottom: "48px" }}>
            <div style={{ fontFamily: mono, fontSize: "11px", color: C.accent, letterSpacing: "0.06em", marginBottom: "8px" }}>HOW IT WORKS</div>
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 700, letterSpacing: "-0.025em" }}>The model pipeline</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" }}>
            {[
              {
                step: "01",
                title: "Market graph construction",
                desc: "Price history is downloaded, returns are computed, and assets whose returns correlate are connected by edges. Node features include return, volatility, momentum, and RSI.",
                tech: "yfinance · NetworkX · TA indicators",
              },
              {
                step: "02",
                title: "GNN inference",
                desc: "A two-layer Graph Convolutional Network reads the asset graph, aggregates neighbourhood information, and produces per-node embeddings. A skip connection prevents oversmoothing.",
                tech: "PyTorch Geometric · GCNConv · skip connection",
              },
              {
                step: "03",
                title: "Portfolio allocation",
                desc: "An actor head maps node embeddings to allocation logits. A Dirichlet policy turns logits into weights that sum to 1. Inference is deterministic via temperature scaling.",
                tech: "Dirichlet distribution · temperature = 0.5",
              },
              {
                step: "04",
                title: "RL training loop",
                desc: "An A2C agent trains against a Gymnasium environment. Each episode simulates a trading period. The reward is excess return over the benchmark minus a volatility penalty.",
                tech: "A2C · γ = 0.99 · Sharpe objective · Modal T4 GPU",
              },
            ].map(({ step, title, desc, tech }) => (
              <div
                key={step}
                style={{
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: "12px", padding: "24px",
                }}
              >
                <div
                  style={{
                    fontFamily: mono, fontSize: "12px", fontWeight: 700,
                    color: C.accent, background: C.accentL,
                    border: `1px solid ${C.accentB}`,
                    borderRadius: "5px", padding: "3px 9px",
                    display: "inline-block", marginBottom: "16px",
                  }}
                >
                  {step}
                </div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "10px", lineHeight: 1.35, color: C.text }}>{title}</h3>
                <p style={{ fontSize: "13px", color: C.muted, lineHeight: 1.8, marginBottom: "14px" }}>{desc}</p>
                <div style={{ fontFamily: mono, fontSize: "10px", color: C.dim, lineHeight: 1.6 }}>{tech}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESULTS ──────────────────────────────────────── */}
      <section id="results" style={{ borderTop: `1px solid ${C.border}` }} className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div style={{ marginBottom: "40px" }}>
            <div style={{ fontFamily: mono, fontSize: "11px", color: C.accent, letterSpacing: "0.06em", marginBottom: "8px" }}>RESULTS</div>
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 700, letterSpacing: "-0.025em", marginBottom: "6px" }}>
              Performance against the market
            </h2>
            <p style={{ fontSize: "13px", color: C.muted, fontFamily: mono }}>
              Table IV · 104 trading days · Jun–Dec 2025 · 15 episodes · seed 42
            </p>
          </div>

          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            {/* Table header */}
            <div
              style={{
                display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr",
                padding: "11px 24px",
                background: "#f0f4ff",
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              {["MODEL", "ANN. SHARPE", "MAX DRAWDOWN", "CUM. RETURN"].map((h, i) => (
                <span
                  key={h}
                  style={{
                    fontFamily: mono, fontSize: "10px", color: C.dim,
                    fontWeight: 600, letterSpacing: "0.07em",
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
              { model: "SPY — S&P 500", sharpe: "0.81", dd: "−12.1%", ret: "+8.4%", primary: false },
            ].map(({ model, sharpe, dd, ret, primary }, i) => (
              <div
                key={model}
                style={{
                  display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr",
                  padding: "16px 24px",
                  background: primary ? C.accentL : "transparent",
                  borderTop: i > 0 ? `1px solid ${C.border}` : undefined,
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {primary && (
                    <span
                      style={{
                        fontFamily: mono, fontSize: "9px", color: "#fff",
                        background: C.accent, borderRadius: "4px",
                        padding: "2px 7px", letterSpacing: "0.06em", flexShrink: 0,
                      }}
                    >
                      BEST
                    </span>
                  )}
                  <span style={{ fontFamily: mono, fontSize: "13px", fontWeight: primary ? 700 : 400, color: primary ? C.text : C.muted }}>
                    {model}
                  </span>
                </div>
                <span style={{ fontFamily: mono, fontSize: "13px", fontWeight: primary ? 700 : 400, textAlign: "right", color: primary ? C.accent : C.muted }}>
                  {sharpe}
                </span>
                <span style={{ fontFamily: mono, fontSize: "13px", textAlign: "right", color: C.muted }}>
                  {dd}
                </span>
                <span style={{ fontFamily: mono, fontSize: "13px", fontWeight: primary ? 700 : 400, textAlign: "right", color: primary ? C.green : C.muted }}>
                  {ret}
                </span>
              </div>
            ))}
          </div>

          <p style={{ fontFamily: mono, fontSize: "10px", color: C.dim, marginTop: "12px", lineHeight: 1.9 }}>
            Universe: NVDA · GOOG · AAPL · AMZN · MSFT · META · TSLA
            &nbsp;·&nbsp; Run <code style={{ color: C.muted }}>python generate_table_iv.py</code> to reproduce
          </p>
        </div>
      </section>

      {/* ── ARCHITECTURE ─────────────────────────────────── */}
      <section style={{ borderTop: `1px solid ${C.border}`, background: C.surface }} className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div style={{ marginBottom: "40px" }}>
            <div style={{ fontFamily: mono, fontSize: "11px", color: C.accent, letterSpacing: "0.06em", marginBottom: "8px" }}>ARCHITECTURE</div>
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 700, letterSpacing: "-0.025em" }}>Three-tier serverless stack</h2>
          </div>
          <ArchitectureSection />
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section style={{ borderTop: `1px solid ${C.border}` }} className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div
            style={{
              background: C.accent,
              borderRadius: "16px", padding: "56px 48px",
              display: "flex", flexDirection: "column", gap: "24px",
              position: "relative" as const, overflow: "hidden",
            }}
          >
            {/* subtle pattern */}
            <div
              style={{
                position: "absolute" as const, inset: 0, opacity: 0.06,
                backgroundImage: "radial-gradient(circle at 80% 20%, #fff 0%, transparent 60%)",
                pointerEvents: "none",
              }}
            />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
              <div>
                <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, letterSpacing: "-0.025em", color: "#fff", marginBottom: "10px" }}>
                  See the model run live.
                </h2>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", maxWidth: "44ch", lineHeight: 1.75 }}>
                  Pick a stock universe, run inference, compare against benchmarks, and trigger a GPU training run from the dashboard.
                </p>
              </div>
              <Link
                href="/dashboard"
                style={{
                  flexShrink: 0,
                  background: "#fff", color: C.accent,
                  borderRadius: "9px", padding: "14px 28px",
                  fontSize: "14px", fontWeight: 700,
                  display: "inline-flex", alignItems: "center", gap: "7px",
                  whiteSpace: "nowrap" as const, textDecoration: "none",
                }}
                className="hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.98] transition-all"
              >
                Open Dashboard <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "28px 24px", background: C.surface }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ background: C.accent, borderRadius: "5px", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <TrendingUp size={12} color="#fff" />
            </div>
            <span style={{ fontFamily: mono, fontSize: "12px", color: C.muted }}>CGPO — Cognitive Graph Portfolio Optimizer</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <a
              href="https://github.com/Vru-Jain/CGPO-Project"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: mono, fontSize: "12px", color: C.dim, display: "flex", alignItems: "center", gap: "5px", textDecoration: "none" }}
              className="hover:text-inherit transition-colors"
            >
              <Github size={13} /> GitHub
            </a>
            <Link href="/dashboard" style={{ fontFamily: mono, fontSize: "12px", color: C.dim, textDecoration: "none" }} className="hover:text-inherit transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
