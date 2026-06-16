"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { useBackend } from "@/components/backend-connection-manager";
import { AlertCircle, Activity } from "lucide-react";
import GraphModule from "@/components/GraphModule";
import MetricsPanel from "@/components/MetricsPanel";
import Sidebar from "@/components/Sidebar";

const ComparisonChart = dynamic(() => import("@/components/ComparisonChart"), {
  ssr: false,
  loading: () => <div className="h-full rounded-xl border bg-card flex items-center justify-center text-sm text-muted-foreground">Loading chart...</div>,
});
const ExecutionLog = dynamic(() => import("@/components/ExecutionLog"), {
  ssr: false,
  loading: () => <div className="h-full rounded-xl border bg-card flex items-center justify-center text-sm text-muted-foreground">Loading logs...</div>,
});
const AgentInsights = dynamic(() => import("@/components/AgentInsights"), {
  ssr: false,
  loading: () => <div className="h-full rounded-xl border bg-card flex items-center justify-center text-sm text-muted-foreground">Loading insights...</div>,
});
const TickerModal = dynamic(() => import("@/components/TickerModal"), { ssr: false });
const TutorialModal = dynamic(() => import("@/components/TutorialModal"), { ssr: false });
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { apiFetch } from "@/lib/api";
import { useTutorial } from "@/hooks/useTutorial";
import { useAgentInsights } from "@/hooks/useAgentInsights";
import { useMarketRegion } from "@/hooks/useMarketRegion";

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
  trained?: boolean;
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
  // ── US Markets ──
  "TECH GIANTS": ["AAPL", "NVDA", "MSFT", "GOOG", "AMZN", "META", "TSLA"],
  "FINANCE": ["JPM", "BAC", "GS", "MS", "V", "MA", "AXP"],
  "HEALTHCARE": ["JNJ", "UNH", "PFE", "ABBV", "MRK", "LLY"],
  "ENERGY": ["XOM", "CVX", "COP", "SLB", "EOG", "PXD"],
  // ── Indian Markets (NSE via Yahoo Finance .NS suffix) ──
  "INDIA BLUECHIPS": ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS", "HINDUNILVR.NS", "ITC.NS"],
  "INDIA IT": ["TCS.NS", "INFY.NS", "WIPRO.NS", "HCLTECH.NS", "TECHM.NS", "LTIM.NS", "PERSISTENT.NS"],
};

const PRESET_GROUPS: { label: string; presets: string[] }[] = [
  { label: "US Markets", presets: ["TECH GIANTS", "FINANCE", "HEALTHCARE", "ENERGY"] },
  { label: "Indian Markets", presets: ["INDIA BLUECHIPS", "INDIA IT"] },
];

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
  const [gpuWarmingUp, setGpuWarmingUp] = useState(false);
  const [training, setTraining] = useState(false);
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus | null>(null);
  const [error, setError] = useState("");
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [tickerModalOpen, setTickerModalOpen] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [trainConfirmOpen, setTrainConfirmOpen] = useState(false);

  // Custom hooks
  const { showTutorial, tutorialStep, completeTutorial, replayTutorial, nextStep, prevStep } = useTutorial();
  const agentInsights = useAgentInsights(data?.weights, data?.graph?.nodes, data?.trained);
  const marketRegion = useMarketRegion(data?.tickers);

  const loadingRef = useRef(loading);
  const trainingRef = useRef(training);
  const abortRef = useRef<AbortController | null>(null);
  const benchmarkCacheRef = useRef<{ ts: number; avgReturn: number } | null>(null);
  useEffect(() => { loadingRef.current = loading; }, [loading]);
  useEffect(() => { trainingRef.current = training; }, [training]);

  const { backendUrl, isConnected } = useBackend();

  const getApiUrl = (path: string) => {
    const base = backendUrl.replace(/\/$/, "");
    const endpoint = path.startsWith("/") ? path : `/${path}`;
    return `${base}${endpoint}`;
  };

  // ── Check if agent beats market — result cached for 5 min ───────────────
  const checkAchievement = useCallback(async (metrics: Metrics) => {
    try {
      const now = Date.now();
      let avgBenchReturn: number;
      if (benchmarkCacheRef.current && now - benchmarkCacheRef.current.ts < 5 * 60 * 1000) {
        avgBenchReturn = benchmarkCacheRef.current.avgReturn;
      } else {
        const res = await apiFetch(getApiUrl("/market/benchmark?period=3mo"));
        if (!res.ok) return;
        const json = await res.json();
        const benchmarks: Record<string, { total_return: number }> = json.benchmarks || {};
        const vals = Object.values(benchmarks).map((b) => b.total_return).filter(Boolean);
        if (vals.length === 0) return;
        avgBenchReturn = vals.reduce((a, b) => a + b, 0) / vals.length;
        benchmarkCacheRef.current = { ts: now, avgReturn: avgBenchReturn };
      }
      if (metrics.expected_return > avgBenchReturn) setShowAchievement(true);
    } catch {
      // silent — achievement check is non-critical
    }
  }, [backendUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchInference = useCallback(async () => {
    // Cancel any in-flight inference request
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setGpuWarmingUp(false);
    setError("");

    // After 6s with no response, show GPU warm-up notice
    const warmupTimer = setTimeout(() => setGpuWarmingUp(true), 6000);

    try {
      const infRes = await apiFetch(getApiUrl("/ai/inference"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ctrl.signal,
      });
      if (!infRes.ok) {
        const body = await infRes.json().catch(() => null);
        throw new Error(body?.detail || `Inference failed (${infRes.status})`);
      }
      const json = await infRes.json();
      setData(json);
      if (json.metrics) checkAchievement(json.metrics);
    } catch (err: any) {
      if (err.name !== "AbortError") setError(err.message);
    } finally {
      clearTimeout(warmupTimer);
      setGpuWarmingUp(false);
      setLoading(false);
    }
  }, [backendUrl, checkAchievement]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTrainConfirmed = async () => {
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
      setTraining(false);
      setTrainingStatus(null);
    }
  };

  const startTraining = () => setTrainConfirmOpen(true);

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
      if (!loadingRef.current && !trainingRef.current && document.visibilityState === "visible") {
        fetchInference();
      }
    }, 120000);
    const newsTimer = setInterval(() => {
      if (document.visibilityState === "visible") fetchNews();
    }, 30000);
    return () => {
      clearInterval(inferenceTimer);
      clearInterval(newsTimer);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchInference]); // eslint-disable-line react-hooks/exhaustive-deps

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
      {/* ── Left Sidebar (responsive) ── */}
      <Sidebar
        onRefresh={fetchInference}
        onTrain={startTraining}
        onConfigTickers={() => setTickerModalOpen(true)}
        onLoadPreset={loadPreset}
        onReplayTutorial={replayTutorial}
        loading={loading}
        training={training}
        trainingStatus={trainingStatus}
        tickerCount={data?.tickers?.length}
        activePreset={activePreset}
        presets={PRESETS}
        presetGroups={PRESET_GROUPS}
        isConnected={isConnected}
      />

      {/* ── Main Content ── */}
      <div className="flex-1 overflow-y-auto">
        {/* pb-20 on mobile = space above FAB button */}
        <div className="p-4 md:p-6 pb-20 md:pb-6 space-y-4 md:space-y-6">
          {/* Ticker Modal */}
          <TickerModal
            open={tickerModalOpen}
            onOpenChange={setTickerModalOpen}
            currentTickers={data?.tickers || []}
            onSubmit={handleCustomTickers}
          />

          {/* Train Confirmation Dialog */}
          <AlertDialog open={trainConfirmOpen} onOpenChange={setTrainConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Train the AI Agent?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will run 50 training episodes on the cloud GPU in the background.
                  Inference data will auto-refresh when training completes.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleTrainConfirmed}>
                  Start Training
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* GPU cold-start notice */}
          {gpuWarmingUp && (
            <Alert className="border-primary/30 bg-primary/5">
              <Activity className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm">
                <span className="font-medium text-primary">Waking up GPU container</span>
                <span className="text-muted-foreground"> — Modal serverless cold start typically takes 20–40 s. Inference will run automatically when ready.</span>
              </AlertDescription>
            </Alert>
          )}

          {/* Error Banner */}
          {error && !isConnected && (
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 md:gap-6">

            {/* Left Column: Graph + Logs (7 cols on xl, full on md, full on mobile) */}
            <div className="md:col-span-2 xl:col-span-7 space-y-4 md:space-y-6">
              <Card className="overflow-hidden card-glow hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    Neural Asset Graph
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 h-[340px] md:h-[420px] xl:h-[520px]">
                  {data ? (
                    <GraphModule data={data.graph} />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
                      </div>
                      Initializing Neural Assets...
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Execution Log */}
              <div className="h-[180px] md:h-[220px]">
                <ExecutionLog />
              </div>
            </div>

            {/* Right Column: Benchmark Chart + Agent Insights + News (5 cols on xl) */}
            <div className="md:col-span-2 xl:col-span-5 space-y-4 md:space-y-6">
              {/* Comparison Chart */}
              <div className="h-[380px] md:h-[420px] xl:h-[460px]">
                <ComparisonChart agentWeights={data?.weights} marketRegion={marketRegion} />
              </div>

              {/* Agent Insights (XAI) */}
              <div className="h-[340px]">
                <AgentInsights data={agentInsights} loading={loading} />
              </div>

              {/* Signal Intelligence */}
              <Card className="h-[340px] flex flex-col card-glow hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      Signal Intelligence
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                      <span className="relative flex h-1.5 w-1.5 mr-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                      </span>
                      Live
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full pr-4">
                    {news.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-2 py-8">
                        <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
                          <Activity className="h-4 w-4 text-muted-foreground/50" />
                        </div>
                        <span className="italic">Waiting for intelligence stream...</span>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {news.map((item, i) => {
                          const style = getSentimentStyle(item.sent);
                          return (
                            <div
                              key={`${item.ts}-${item.src}-${i}`}
                              className={`p-3 rounded-lg border transition-all duration-200 hover:bg-accent/50 hover:-translate-y-px ${item.sent === "POS" ? "border-green-500/20" :
                                item.sent === "NEG" ? "border-red-500/20" : "border-border/50"
                                }`}
                            >
                              <div className="flex justify-between items-start mb-1.5">
                                <span className="font-medium text-sm">{item.src}</span>
                                <Badge variant={style.variant} className={`text-[10px] ${style.className}`}>{item.sent}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {item.msg || item.title}
                              </p>
                              <span className="text-[10px] text-muted-foreground/50 mt-1.5 block font-mono">{item.ts}</span>
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

      {/* ── Tutorial Modal ── */}
      {showTutorial && (
        <TutorialModal
          step={tutorialStep}
          onNext={nextStep}
          onPrev={prevStep}
          onClose={completeTutorial}
        />
      )}
    </div>
  );
}
