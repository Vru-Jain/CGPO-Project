"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useBackend } from "@/components/backend-connection-manager";
import { AlertCircle } from "lucide-react";
import GraphModule from "@/components/GraphModule";
import ComparisonChart from "@/components/ComparisonChart";
import MetricsPanel from "@/components/MetricsPanel";
import ExecutionLog from "@/components/ExecutionLog";
import Sidebar from "@/components/Sidebar";
import TickerModal from "@/components/TickerModal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface GraphNode { id: string; return: number; }
interface GraphEdge { source: string; target: string; }
interface GraphData { nodes: GraphNode[]; edges: GraphEdge[]; }
interface Metrics { expected_return: number; volatility: number; sharpe_ratio: number; }
interface InferenceData {
  tickers: string[];
  weights: Record<string, number>;
  graph: GraphData;
  metrics: Metrics;
}
interface NewsItem {
  ts: string;
  src: string;
  msg?: string;
  title?: string;
  sent: "POS" | "NEG" | "NEU";
}
interface TrainingStatus { episode: number; total: number; reward: number; }

// ─── Presets ─────────────────────────────────────────────────────────────────

const PRESETS = {
  "TECH GIANTS": ["AAPL", "NVDA", "MSFT", "GOOG", "AMZN", "META", "TSLA"],
  "CRYPTO": ["BTC-USD", "ETH-USD", "SOL-USD", "DOGE-USD", "ADA-USD"],
  "FINANCE": ["JPM", "BAC", "GS", "MS", "V", "MA", "AXP"],
  "HEALTHCARE": ["JNJ", "UNH", "PFE", "ABBV", "MRK", "LLY"],
  "ENERGY": ["XOM", "CVX", "COP", "SLB", "EOG", "PXD"],
};

// ─── Achievement Toast ────────────────────────────────────────────────────────

function AchievementToast({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-500/20 to-green-500/20 border border-yellow-500/50 rounded-xl px-6 py-4 shadow-2xl backdrop-blur-sm">
        <span className="text-3xl">🏆</span>
        <div>
          <p className="font-bold text-yellow-400 text-sm">Agent Beats the Market!</p>
          <p className="text-xs text-muted-foreground">AI portfolio outperformed the benchmark index</p>
        </div>
        <button onClick={onClose} className="ml-4 text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const [data, setData] = useState<InferenceData | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [training, setTraining] = useState(false);
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus | null>(null);
  const [error, setError] = useState("");
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [tickerModalOpen, setTickerModalOpen] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);

  const loadingRef = useRef(loading);
  const trainingRef = useRef(training);
  useEffect(() => { loadingRef.current = loading; }, [loading]);
  useEffect(() => { trainingRef.current = training; }, [training]);

  const { backendUrl, isConnected } = useBackend();

  const getApiUrl = (path: string) => {
    const base = backendUrl.replace(/\/$/, "");
    const endpoint = path.startsWith("/") ? path : `/${path}`;
    return `${base}${endpoint}`;
  };

  // ── Check if agent beats market ─────────────────────────────────────────
  const checkAchievement = useCallback(async (metrics: Metrics) => {
    try {
      const res = await apiFetch(getApiUrl("/market/benchmark?period=3mo"));
      if (!res.ok) return;
      const json = await res.json();
      const benchmarks: Record<string, { total_return: number }> = json.benchmarks || {};
      // Average the US benchmarks as the reference
      const vals = Object.values(benchmarks).map((b) => b.total_return).filter(Boolean);
      if (vals.length === 0) return;
      const avgBenchReturn = vals.reduce((a, b) => a + b, 0) / vals.length;
      if (metrics.expected_return > avgBenchReturn) {
        setShowAchievement(true);
      }
    } catch {
      // silent — achievement check is non-critical
    }
  }, [backendUrl]);

  const fetchInference = async () => {
    setLoading(true);
    setError("");
    try {
      const infRes = await apiFetch(getApiUrl("/ai/inference"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!infRes.ok) throw new Error("Backend connection failed");
      const json = await infRes.json();
      setData(json);
      if (json.metrics) checkAchievement(json.metrics);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startTraining = async () => {
    if (!confirm("Start training agent? This runs in the background.")) return;
    setTraining(true);
    setTrainingStatus({ episode: 0, total: 50, reward: 0 });
    try {
      await apiFetch(getApiUrl("/ai/train"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ episodes: 50 })
      });
      pollTrainingStatus();
    } catch {
      alert("Failed to start training");
      setTraining(false);
      setTrainingStatus(null);
    }
  };

  const pollTrainingStatus = () => {
    let cancelled = false;
    const poll = async () => {
      if (cancelled) return;
      try {
        const res = await apiFetch(getApiUrl("/ai/training-status"));
        const status = await res.json();
        if (cancelled) return;
        if (status.is_training) {
          setTrainingStatus({ episode: status.episode, total: status.total, reward: status.last_reward });
          setTimeout(poll, 1000);
        } else {
          setTraining(false);
          setTrainingStatus(null);
          fetchInference(); // Re-run inference after training completes
        }
      } catch {
        if (!cancelled) {
          setTraining(false);
          setTrainingStatus(null);
        }
      }
    };
    poll();
    return () => { cancelled = true; };
  };

  const handleCustomTickers = async (tickers: string[]) => {
    setActivePreset(null);
    setLoading(true);
    await apiFetch(getApiUrl("/config/tickers"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tickers })
    });
    fetchInference();
  };

  const loadPreset = async (presetName: string) => {
    const tickers = PRESETS[presetName as keyof typeof PRESETS];
    setActivePreset(presetName);
    setLoading(true);
    await apiFetch(getApiUrl("/config/tickers"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tickers })
    });
    fetchInference();
  };

  const fetchNews = async () => {
    try {
      const res = await apiFetch(getApiUrl("/market/news"));
      if (res.ok) setNews(await res.json());
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchInference();
    fetchNews();
    const inferenceTimer = setInterval(() => {
      if (!loadingRef.current && !trainingRef.current) fetchInference();
    }, 120000);
    const newsTimer = setInterval(fetchNews, 30000);
    return () => { clearInterval(inferenceTimer); clearInterval(newsTimer); };
  }, []);

  const getSentimentStyle = (sent: string) => {
    switch (sent) {
      case "POS": return { variant: "default" as const, className: "bg-green-500/10 text-green-500 border-green-500/20" };
      case "NEG": return { variant: "destructive" as const, className: "" };
      default: return { variant: "secondary" as const, className: "" };
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Left Sidebar ── */}
      <Sidebar
        onRefresh={fetchInference}
        onTrain={startTraining}
        onConfigTickers={() => setTickerModalOpen(true)}
        onLoadPreset={loadPreset}
        loading={loading}
        training={training}
        trainingStatus={trainingStatus}
        tickerCount={data?.tickers?.length}
        activePreset={activePreset}
        presets={PRESETS}
        isConnected={isConnected}
      />

      {/* ── Main Content ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Ticker Modal */}
          <TickerModal
            open={tickerModalOpen}
            onOpenChange={setTickerModalOpen}
            currentTickers={data?.tickers || []}
            onSubmit={handleCustomTickers}
          />

          {/* Error Banner */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}. Make sure the Python Backend is running.
              </AlertDescription>
            </Alert>
          )}

          {/* Metrics */}
          {data?.metrics && <MetricsPanel metrics={data.metrics} />}

          {/* ── Main Grid ── */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

            {/* Left Column: Graph + Logs (7 cols) */}
            <div className="xl:col-span-7 space-y-6">
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Neural Asset Graph
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 h-[520px]">
                  {data ? (
                    <GraphModule data={data.graph} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                      Initializing Neural Assets...
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Execution Log */}
              <div className="h-[220px]">
                <ExecutionLog />
              </div>
            </div>

            {/* Right Column: Benchmark Chart + News (5 cols) */}
            <div className="xl:col-span-5 space-y-6">
              {/* Bigger Comparison Chart */}
              <div className="h-[460px]">
                <ComparisonChart agentWeights={data?.weights} />
              </div>

              {/* Signal Intelligence */}
              <Card className="h-[340px] flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Signal Intelligence</CardTitle>
                    <Badge variant="outline" className="text-xs animate-pulse">Live</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full pr-4">
                    {news.length === 0 ? (
                      <div className="text-muted-foreground text-sm italic text-center py-8">
                        Waiting for intelligence stream...
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {news.map((item, i) => {
                          const style = getSentimentStyle(item.sent);
                          return (
                            <div
                              key={`${item.ts}-${item.src}-${i}`}
                              className={`p-3 rounded-lg border transition-colors hover:bg-accent/50 ${item.sent === "POS" ? "border-green-500/20" :
                                  item.sent === "NEG" ? "border-red-500/20" : "border-border"
                                }`}
                            >
                              <div className="flex justify-between items-start mb-1.5">
                                <span className="font-medium text-sm">{item.src}</span>
                                <Badge variant={style.variant} className={style.className}>{item.sent}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {item.msg || item.title}
                              </p>
                              <span className="text-xs text-muted-foreground/60 mt-1.5 block">{item.ts}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* ── Achievement Toast ── */}
      {showAchievement && (
        <AchievementToast onClose={() => setShowAchievement(false)} />
      )}
    </div>
  );
}
