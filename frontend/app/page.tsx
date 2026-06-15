import Link from "next/link";
import {
  TrendingUp,
  Brain,
  BarChart3,
  Zap,
  ArrowRight,
  Globe,
  Shield,
  Cpu,
  Github,
  Activity,
} from "lucide-react";

function MiniGraph() {
  const blue = "hsl(217, 91%, 60%)";
  const nodes = [
    { label: "NVDA", x: 80, y: 60 },
    { label: "MSFT", x: 20, y: 18 },
    { label: "AAPL", x: 140, y: 18 },
    { label: "META", x: 20, y: 102 },
    { label: "AMZN", x: 140, y: 102 },
  ];
  const edges: [number, number][] = [[0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [3, 4]];
  return (
    <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-full h-full">
      {edges.map(([a, b], i) => (
        <line key={i}
          x1={nodes[a].x} y1={nodes[a].y}
          x2={nodes[b].x} y2={nodes[b].y}
          stroke={blue} strokeOpacity="0.3" strokeWidth="1"
        />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={i === 0 ? 9 : 5}
            fill={blue} fillOpacity={i === 0 ? "0.8" : "0.15"}
            stroke={blue} strokeOpacity="0.45" strokeWidth="1"
          />
          <text x={n.x} y={n.y + (i === 0 ? 19 : 15)} textAnchor="middle"
            fill={blue} fillOpacity="0.5" fontSize="7" fontFamily="monospace">
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function NetworkGraph() {
  const blue = "hsl(217, 91%, 60%)";
  return (
    <div className="relative w-full max-w-[380px] aspect-square select-none pointer-events-none">
      <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
        <defs>
          <radialGradient id="cg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={blue} stopOpacity="0.18" />
            <stop offset="100%" stopColor={blue} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="160" cy="160" r="64" fill="url(#cg)" />
        {([[160,160,55,55],[160,160,265,55],[160,160,55,265],[160,160,265,265],
           [160,160,160,28],[160,160,292,160],[160,160,160,292],[160,160,28,160]] as number[][]).map(([x1,y1,x2,y2],i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={blue} strokeOpacity="0.2" strokeWidth="1" />
        ))}
        {([[55,55,160,28],[265,55,160,28],[55,55,28,160],[55,265,28,160],
           [265,55,292,160],[265,265,292,160],[55,265,160,292],[265,265,160,292],
           [55,55,265,55],[55,265,265,265]] as number[][]).map(([x1,y1,x2,y2],i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={blue} strokeOpacity="0.07" strokeWidth="0.75" />
        ))}
        {([[160,28],[292,160],[160,292],[28,160]] as number[][]).map(([cx,cy],i) => (
          <circle key={i} cx={cx} cy={cy} r="4" fill={blue} fillOpacity="0.4" stroke={blue} strokeOpacity="0.55" strokeWidth="1" />
        ))}
        {([[55,55],[265,55],[55,265],[265,265]] as number[][]).map(([cx,cy],i) => (
          <circle key={i} cx={cx} cy={cy} r="7" fill={blue} fillOpacity="0.12" stroke={blue} strokeOpacity="0.3" strokeWidth="1.5" />
        ))}
        <circle cx="160" cy="160" r="22" fill="none" stroke={blue} strokeOpacity="0.25" strokeWidth="1" strokeDasharray="4 5" />
        <circle cx="160" cy="160" r="13" fill={blue} fillOpacity="0.9" />
      </svg>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/30">
              <TrendingUp className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm tracking-tight">CGPO</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="#capabilities" className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Capabilities
            </a>
            <a href="#architecture" className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Architecture
            </a>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              Dashboard <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[100dvh] pt-14 flex items-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-25" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 55% 65% at 15% 55%, hsl(217 91% 60% / 0.09), transparent 65%)" }}
        />
        <div className="relative max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-20 lg:py-0">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary mb-8 animate-fade-in-up">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
              </span>
              Final Year Research Project
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.06] mb-6 animate-fade-in-up delay-100 [text-wrap:balance]">
              Cognitive Graph
              <br />
              <span className="text-primary">Portfolio Optimizer</span>
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed mb-10 max-w-sm animate-fade-in-up delay-200">
              GNN and RL agent that builds, optimises, and benchmarks portfolios against global indices in real-time.
            </p>
            <div className="flex flex-wrap items-center gap-3 animate-fade-in-up delay-300">
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                Launch Dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="https://github.com/Vru-Jain/CGPO-Project"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border/50 px-6 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 hover:bg-card/50 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <Github className="h-4 w-4" />
                View Source
              </a>
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center animate-fade-in-up delay-200">
            <NetworkGraph />
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </section>

      {/* Capabilities */}
      <section id="capabilities" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold [text-wrap:balance]">System Capabilities</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">

            {/* GNN - wide, two-column inner layout with mini graph */}
            <div className="card-glow group lg:col-span-7 rounded-2xl border border-primary/20 bg-primary/[0.07] hover:bg-primary/[0.11] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
              <div className="flex flex-col sm:flex-row h-full p-7 gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary mb-5 ring-1 ring-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Brain className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-base mb-2">Graph Neural Networks</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Stocks become nodes, correlations become edges. The GNN reads market structure in real-time and surfaces hidden cross-asset relationships that linear models miss.
                  </p>
                  <p className="text-xs text-muted-foreground/50" style={{ fontFamily: "var(--font-mono)" }}>
                    PyG · NetworkX · 7-node portfolio graph
                  </p>
                </div>
                <div className="hidden sm:flex items-center justify-center flex-shrink-0 w-28 h-28 opacity-50 group-hover:opacity-75 transition-opacity">
                  <MiniGraph />
                </div>
              </div>
            </div>

            {/* RL - single primary tint */}
            <div className="card-glow group lg:col-span-5 p-7 rounded-2xl border border-primary/15 bg-primary/[0.04] hover:bg-primary/[0.09] transition-all duration-300 hover:-translate-y-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary mb-5 ring-1 ring-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base mb-2">Reinforcement Learning</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                An A2C agent learns to allocate portfolio weights by maximising the Sharpe ratio across thousands of training episodes.
              </p>
              <p className="text-xs text-muted-foreground/50" style={{ fontFamily: "var(--font-mono)" }}>A2C · γ = 0.99 · Sharpe objective</p>
            </div>

            {/* Benchmark */}
            <div className="card-glow group lg:col-span-5 p-6 rounded-2xl border border-border/40 bg-card/40 hover:bg-card/70 transition-all duration-300 hover:-translate-y-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 ring-1 ring-primary/15 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-sm mb-2">Multi-Benchmark</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                S&P 500, Nasdaq, Dow Jones, Nifty 50. Live comparison at every optimisation step.
              </p>
            </div>

            {/* Markets */}
            <div className="card-glow group lg:col-span-7 p-6 rounded-2xl border border-border/40 bg-card/40 hover:bg-card/70 transition-all duration-300 hover:-translate-y-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 ring-1 ring-primary/15 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-sm mb-2">US & India Markets</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                NSE, BSE, NYSE. Pre-built portfolios for Tech Giants, Crypto, India Bluechips, and more.
              </p>
            </div>

            {/* GPU - neutral */}
            <div className="card-glow group lg:col-span-6 p-6 rounded-2xl border border-border/40 bg-card/40 hover:bg-card/70 transition-all duration-300 hover:-translate-y-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 ring-1 ring-primary/15 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-sm mb-2">Serverless GPU</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Modal cloud with T4 GPU. Scales to zero when idle. No always-on server cost.
              </p>
            </div>

            {/* Security */}
            <div className="card-glow group lg:col-span-6 p-6 rounded-2xl border border-border/40 bg-card/40 hover:bg-card/70 transition-all duration-300 hover:-translate-y-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 ring-1 ring-primary/15 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-sm mb-2">Secured API</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                API key authenticated, CORS-locked, with HTTP security headers on every response.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="py-24 px-6 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <div className="mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 [text-wrap:balance]">How It Works</h2>
            <p className="text-sm text-muted-foreground">Three-tier cloud stack. Zero always-on cost.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Vercel", sub: "Next.js Frontend", icon: <Globe className="h-5 w-5" /> },
              { label: "Modal GPU", sub: "FastAPI + PyTorch", icon: <Cpu className="h-5 w-5" /> },
              { label: "yfinance", sub: "Live Market Data", icon: <TrendingUp className="h-5 w-5" /> },
            ].map((step, i) => (
              <div key={step.label} className="relative">
                <div className="p-6 rounded-2xl border border-border/40 bg-card/40 hover:bg-card/70 hover:border-primary/25 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl mb-4 bg-primary/10 text-primary">
                    {step.icon}
                  </div>
                  <p className="font-semibold text-sm">{step.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{step.sub}</p>
                </div>
                {i < 2 && (
                  <div className="hidden sm:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="h-4 w-4 text-muted-foreground/40" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benchmark Results */}
      <section className="py-24 px-6 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 [text-wrap:balance]">Benchmark Results</h2>
            <p className="text-sm text-muted-foreground">
              Table IV: GNN agent vs. MLP ablation vs. S&P 500. 104 trading days, Jun–Dec 2025, 15 training episodes, seed 42.
            </p>
          </div>
          <div className="rounded-xl border border-border/40 overflow-hidden">
            <div className="grid grid-cols-4 px-5 py-3 bg-card/60 border-b border-border/30">
              <span className="text-xs font-medium text-muted-foreground">Model</span>
              <span className="text-xs font-medium text-muted-foreground text-right">Ann. Sharpe</span>
              <span className="text-xs font-medium text-muted-foreground text-right">Max Drawdown</span>
              <span className="text-xs font-medium text-muted-foreground text-right">Cum. Return</span>
            </div>
            <div className="grid grid-cols-4 px-5 py-4 bg-primary/[0.07] border-b border-primary/15">
              <span className="text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-mono)" }}>GNN</span>
              <span className="text-sm font-semibold text-foreground text-right" style={{ fontFamily: "var(--font-mono)" }}>1.34</span>
              <span className="text-sm text-muted-foreground text-right" style={{ fontFamily: "var(--font-mono)" }}>−15.7%</span>
              <span className="text-sm font-semibold text-primary text-right" style={{ fontFamily: "var(--font-mono)" }}>+17.2%</span>
            </div>
            <div className="grid grid-cols-4 px-5 py-4 bg-card/20 border-b border-border/20">
              <span className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>MLP</span>
              <span className="text-sm text-muted-foreground text-right" style={{ fontFamily: "var(--font-mono)" }}>0.94</span>
              <span className="text-sm text-muted-foreground text-right" style={{ fontFamily: "var(--font-mono)" }}>−18.3%</span>
              <span className="text-sm text-muted-foreground text-right" style={{ fontFamily: "var(--font-mono)" }}>+12.6%</span>
            </div>
            <div className="grid grid-cols-4 px-5 py-4 bg-card/20">
              <span className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>SPY</span>
              <span className="text-sm text-muted-foreground text-right" style={{ fontFamily: "var(--font-mono)" }}>0.81</span>
              <span className="text-sm text-muted-foreground text-right" style={{ fontFamily: "var(--font-mono)" }}>−12.1%</span>
              <span className="text-sm text-muted-foreground text-right" style={{ fontFamily: "var(--font-mono)" }}>+8.4%</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground/60">
            Universe: NVDA, GOOG, AAPL, AMZN, MSFT, META, TSLA. Annualised Sharpe uses 252 trading-day convention. Run <code className="font-mono text-[0.7rem]">python generate_table_iv.py</code> to reproduce.
          </p>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl border border-primary/20 bg-primary/[0.06] px-8 sm:px-16 py-16 text-center overflow-hidden">
            <div
              className="absolute inset-0 pointer-events-none animate-glow-pulse"
              style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, hsl(217 91% 60% / 0.1), transparent 68%)" }}
            />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 [text-wrap:balance]">See the AI in action</h2>
              <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">
                Run a live optimisation, compare against benchmarks, and explore the portfolio graph.
              </p>
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                Launch Dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10">
              <TrendingUp className="h-3 w-3 text-primary" />
            </div>
            <span>CGPO: Cognitive Graph Portfolio Optimizer</span>
          </div>
          <div className="flex items-center gap-5">
            <a
              href="https://github.com/Vru-Jain/CGPO-Project"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <Github className="h-3.5 w-3.5" /> GitHub
            </a>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
