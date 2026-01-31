"use client";

import { useEffect, useState } from "react";
import { AlertCircle, RefreshCw, Settings, BrainCircuit, Zap } from "lucide-react";
import GraphModule from "@/components/GraphModule";
import ComparisonChart from "@/components/ComparisonChart";
import MetricsPanel from "@/components/MetricsPanel";
import ExecutionLog from "@/components/ExecutionLog";

// Preset portfolios for quick switching
const PRESETS = {
  "TECH GIANTS": ["AAPL", "NVDA", "MSFT", "GOOG", "AMZN", "META", "TSLA"],
  "CRYPTO": ["BTC-USD", "ETH-USD", "SOL-USD", "DOGE-USD", "ADA-USD"],
  "FINANCE": ["JPM", "BAC", "GS", "MS", "V", "MA", "AXP"],
  "HEALTHCARE": ["JNJ", "UNH", "PFE", "ABBV", "MRK", "LLY"],
  "ENERGY": ["XOM", "CVX", "COP", "SLB", "EOG", "PXD"],
};

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [training, setTraining] = useState(false);
  const [trainingStatus, setTrainingStatus] = useState<{ episode: number, total: number, reward: number } | null>(null);
  const [error, setError] = useState("");
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Determine API Base URL (Dynamic for Network Access)
  const getApiUrl = (path: string) => {
    if (typeof window === "undefined") return `http://127.0.0.1:8000${path}`;
    return `/py-api${path}`;
  };

  const fetchInference = async () => {
    setLoading(true);
    setError("");
    try {
      const [infRes, newsRes] = await Promise.all([
        fetch(getApiUrl("/ai/inference"), { method: "POST", headers: { "Content-Type": "application/json" } }),
        fetch(getApiUrl("/market/news"))
      ]);

      if (!infRes.ok) throw new Error("Backend connection failed");
      const json = await infRes.json();
      setData(json);

      if (newsRes.ok) {
        const newsJson = await newsRes.json();
        setNews(newsJson);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startTraining = async () => {
    // eslint-disable-next-line
    if (!confirm("Start training agent? This runs in the background.")) return;
    setTraining(true);
    setTrainingStatus({ episode: 0, total: 50, reward: 0 });
    try {
      await fetch(getApiUrl("/ai/train"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ episodes: 50 })
      });
      // Start polling for status
      pollTrainingStatus();
    } catch (err) {
      alert("Failed to start training");
      setTraining(false);
      setTrainingStatus(null);
    }
  };

  const pollTrainingStatus = async () => {
    const poll = async () => {
      try {
        const res = await fetch(getApiUrl("/ai/training-status"));
        const status = await res.json();
        if (status.is_training) {
          setTrainingStatus({ episode: status.episode, total: status.total, reward: status.last_reward });
          setTimeout(poll, 1000); // Poll every second
        } else {
          setTraining(false);
          setTrainingStatus(null);
          fetchInference(); // Refresh with new model
        }
      } catch {
        setTraining(false);
        setTrainingStatus(null);
      }
    };
    poll();
  };

  const configTickers = async () => {
    // eslint-disable-next-line
    const input = prompt("Enter Tickers (comma separated):", data?.tickers?.join(","));
    if (input) {
      const tickers = input.split(",").map((t: string) => t.trim().toUpperCase());
      setActivePreset(null);
      await fetch(getApiUrl("/config/tickers"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickers })
      });
      fetchInference();
    }
  };

  const loadPreset = async (presetName: string) => {
    const tickers = PRESETS[presetName as keyof typeof PRESETS];
    setActivePreset(presetName);
    setLoading(true);
    await fetch(getApiUrl("/config/tickers"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tickers })
    });
    fetchInference();
  };

  // Auto-refresh intervals
  const INFERENCE_INTERVAL = 60000; // 60 seconds
  const NEWS_INTERVAL = 30000; // 30 seconds

  // Fetch only news (lighter weight)
  const fetchNews = async () => {
    try {
      const res = await fetch(getApiUrl("/market/news"));
      if (res.ok) {
        const newsJson = await res.json();
        setNews(newsJson);
      }
    } catch {
      // Silent fail for background refresh
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchInference();

    // Set up auto-refresh intervals
    const inferenceTimer = setInterval(() => {
      if (!loading && !training) {
        fetchInference();
      }
    }, INFERENCE_INTERVAL);

    const newsTimer = setInterval(() => {
      fetchNews();
    }, NEWS_INTERVAL);

    // Cleanup on unmount
    return () => {
      clearInterval(inferenceTimer);
      clearInterval(newsTimer);
    };
  }, []);

  return (
    <main className="min-h-screen p-4 md:p-8 flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-end border-b border-border pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-widest">CGPO // <span className="text-white text-opacity-60 text-lg font-normal">TERMINAL</span></h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
            <span className="text-xs text-textDim">SYSTEM OPERATIONAL</span>
            {data?.tickers && (
              <span className="text-xs text-textDim ml-2">// {data.tickers.length} ASSETS</span>
            )}
            <span className="text-xs text-secondary ml-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span>
              LIVE AUTO-REFRESH
            </span>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap justify-end">
          <button
            onClick={configTickers}
            className="flex items-center gap-2 px-3 py-2 border border-border text-textDim hover:text-white transition-colors rounded text-xs font-bold"
          >
            <Settings size={14} /> CUSTOM
          </button>
          <button
            onClick={startTraining}
            disabled={training}
            className="flex items-center gap-2 px-3 py-2 border border-primary text-primary hover:bg-primary hover:text-black transition-colors rounded text-xs font-bold disabled:opacity-50"
          >
            <BrainCircuit size={14} className={training ? "animate-pulse" : ""} />
            {training ? "TRAINING..." : "TRAIN"}
          </button>
          <button
            onClick={fetchInference}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-secondary text-secondary hover:bg-secondary hover:text-black transition-colors rounded text-sm font-bold disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "PROCESSING..." : "RUN INFERENCE"}
          </button>
        </div>
      </header>

      {/* Training Status Banner */}
      {training && trainingStatus && (
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 animate-pulse">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BrainCircuit size={16} className="text-primary animate-spin" />
              <span className="text-primary font-bold">TRAINING IN PROGRESS</span>
            </div>
            <span className="text-sm text-textDim">
              Episode {trainingStatus.episode}/{trainingStatus.total}
            </span>
          </div>
          <div className="w-full h-2 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${(trainingStatus.episode / trainingStatus.total) * 100}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-textDim">
            Last Reward: <span className={trainingStatus.reward > 0 ? "text-success" : "text-danger"}>
              {trainingStatus.reward.toFixed(4)}
            </span>
          </div>
        </div>
      )}

      {/* Preset Selector */}
      <div className="flex gap-2 flex-wrap">
        {Object.keys(PRESETS).map((preset) => (
          <button
            key={preset}
            onClick={() => loadPreset(preset)}
            disabled={loading}
            className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold transition-all ${activePreset === preset
              ? "bg-primary text-black"
              : "border border-border text-textDim hover:border-primary hover:text-primary"
              }`}
          >
            <Zap size={12} /> {preset}
          </button>
        ))}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-900/20 border border-danger text-danger p-4 rounded flex items-center gap-3">
          <AlertCircle />
          <span>{error}. Make sure the Python Backend is running on port 8000.</span>
        </div>
      )}

      {/* BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 w-full">

        {/* LEFT COLUMN (Control Plane) - Spans 8 cols */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* Zone A: The Brain (Graph) */}
          <div className="neo-card flex-1 min-h-[500px] relative overflow-hidden group border-primary/20 hover:border-primary/50 transition-colors">
            {/* "Brain" Label Overlay */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary animate-pulse rounded-full"></div>
                <span className="text-secondary text-xs font-bold tracking-widest opacity-80 font-mono">CORTEX_ACTIVE_GRAPH</span>
              </div>
            </div>
            {data ? <GraphModule data={data.graph} /> : <div className="h-full flex items-center justify-center text-textDim italic">Initializing Neural Assets...</div>}
          </div>

          {/* Zone B: The Trace (Execution Log) */}
          <div className="h-[250px] w-full">
            <ExecutionLog />
          </div>

        </div>

        {/* RIGHT COLUMN (Intel & Ops) - Spans 4 cols */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* Metrics Panel */}
          {data?.metrics && <MetricsPanel metrics={data.metrics} />}

          {/* Zone C: Battlefield (Comparison) */}
          <ComparisonChart agentWeights={data?.weights} />

          {/* Zone D: Signals */}
          <div className="neo-card flex-1 min-h-[300px] flex flex-col border-secondary/20">
            <h3 className="text-secondary border-b border-border pb-2 mb-2 font-bold flex justify-between items-center text-xs">
              <span>SIGNAL INTELLIGENCE</span>
              <span className="text-[10px] text-primary animate-pulse">LIVE STREAM</span>
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-800 custom-scrollbar">
              {news.length === 0 ? (
                <div className="text-textDim text-xs italic text-center mt-10">Waiting for intelligence stream...</div>
              ) : (
                <div className="space-y-3">
                  {news.map((item, i) => (
                    <div key={i} className={`p-2 border-l-2 bg-white/5 transition-all hover:bg-white/10 ${item.sent === "POS" ? "border-success" : (item.sent === "NEG" ? "border-danger" : "border-textDim")
                      }`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-xs text-secondary">{item.src}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${item.sent === "POS" ? "bg-success/20 text-success" : (item.sent === "NEG" ? "bg-danger/20 text-danger" : "bg-gray-800 text-gray-400")
                          }`}>
                          {item.sent}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 leading-tight font-mono opacity-90">{item.msg || item.title}</p>
                      <span className="text-[10px] text-gray-600 block mt-1 text-right font-mono">{item.ts}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
