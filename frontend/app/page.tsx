"use client";

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
} from "lucide-react";

const FEATURES = [
  {
    icon: <Brain className="h-6 w-6" />,
    title: "Graph Neural Networks",
    desc: "Stocks become nodes, correlations become edges. The GNN reads market structure in real-time.",
  },
  {
    icon: <Cpu className="h-6 w-6" />,
    title: "Reinforcement Learning",
    desc: "An A2C agent learns to allocate portfolio weights by maximising the Sharpe ratio.",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Multi-Benchmark",
    desc: "Compare against S&P 500, Nasdaq, Dow Jones, Nifty 50. Get notified when AI beats them.",
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "US & India Markets",
    desc: "Trade NSE, BSE, NYSE. Pre-built portfolios for Tech Giants, Crypto, India Bluechips, and more.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Serverless GPU",
    desc: "Deployed on Modal cloud with T4 GPU. Scales to zero cost when idle — no always-on server.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Secured API",
    desc: "API key authenticated, CORS-locked, with HTTP security headers on every response.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm tracking-tight">CGPO</span>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-32 pb-20 px-6 text-center relative">
        {/* Gradient orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
              <Zap className="h-3 w-3" /> Final Year Research Project
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            Cognitive Graph{" "}
            <span className="text-primary">Portfolio Optimizer</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            An agentic AI system that uses <strong>Graph Neural Networks</strong> and{" "}
            <strong>Reinforcement Learning</strong> to build and optimise
            financial portfolios — then benchmarks itself against global indices in real-time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              Launch Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://github.com/Vru-Jain/CGPO-Project"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-8 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group p-6 rounded-xl border bg-card hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                {f.icon}
              </div>
              <h3 className="font-semibold text-sm mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Architecture ── */}
      <section className="pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground mb-8 text-sm">
            Three-tier cloud architecture. Zero always-on cost.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            {[
              { label: "Vercel", sub: "Next.js Frontend" },
              { label: "Modal GPU", sub: "FastAPI + PyTorch" },
              { label: "yfinance", sub: "Live Market Data" },
            ].map((node, i) => (
              <div key={node.label} className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-1 px-6 py-4 rounded-xl border bg-card min-w-[140px]">
                  <span className="font-semibold">{node.label}</span>
                  <span className="text-xs text-muted-foreground">{node.sub}</span>
                </div>
                {i < 2 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>© 2025 CGPO — Cognitive Graph Portfolio Optimizer</span>
          <div className="flex items-center gap-4">
            <a href="https://github.com/Vru-Jain/CGPO-Project" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              GitHub
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
