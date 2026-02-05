"use client";

import { useEffect, useState, useRef } from "react";
import { AlertCircle, BrainCircuit } from "lucide-react";
import GraphModule from "@/components/GraphModule";
import ComparisonChart from "@/components/ComparisonChart";
import MetricsPanel from "@/components/MetricsPanel";
import ExecutionLog from "@/components/ExecutionLog";
import Header from "@/components/Header";
import TickerModal from "@/components/TickerModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

// TypeScript Interfaces
interface GraphNode {
  id: string;
  return: number;
}

interface GraphEdge {
  source: string;
  target: string;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface Metrics {
  expected_return: number;
  volatility: number;
  sharpe_ratio: number;
}

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

interface TrainingStatus {
  episode: number;
  total: number;
  reward: number;
}

// Preset portfolios for quick switching
const PRESETS = {
  "TECH GIANTS": ["AAPL", "NVDA", "MSFT", "GOOG", "AMZN", "META", "TSLA"],
  "CRYPTO": ["BTC-USD", "ETH-USD", "SOL-USD", "DOGE-USD", "ADA-USD"],
  "FINANCE": ["JPM", "BAC", "GS", "MS", "V", "MA", "AXP"],
  "HEALTHCARE": ["JNJ", "UNH", "PFE", "ABBV", "MRK", "LLY"],
  "ENERGY": ["XOM", "CVX", "COP", "SLB", "EOG", "PXD"],
};

export default function Dashboard() {
  const [data, setData] = useState<InferenceData | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [training, setTraining] = useState(false);
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus | null>(null);
  const [error, setError] = useState("");
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [tickerModalOpen, setTickerModalOpen] = useState(false);

  const loadingRef = useRef(loading);
  const trainingRef = useRef(training);

  useEffect(() => { loadingRef.current = loading; }, [loading]);
  useEffect(() => { trainingRef.current = training; }, [training]);

  const getApiUrl = (path: string) => {
    if (typeof window === "undefined") return `http://127.0.0.1:8000${path}`;
    return `/py-api${path}`;
  };

  const fetchInference = async () => {
    setLoading(true);
    setError("");
    try {
      const infRes = await fetch(getApiUrl("/ai/inference"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!infRes.ok) throw new Error("Backend connection failed");
      const json = await infRes.json();
      setData(json);
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
      await fetch(getApiUrl("/ai/train"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ episodes: 50 })
      });
      pollTrainingStatus();
    } catch (err) {
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
        const res = await fetch(getApiUrl("/ai/training-status"));
        const status = await res.json();
        if (cancelled) return;
        if (status.is_training) {
          setTrainingStatus({ episode: status.episode, total: status.total, reward: status.last_reward });
          setTimeout(poll, 1000);
        } else {
          setTraining(false);
          setTrainingStatus(null);
          fetchInference();
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
    await fetch(getApiUrl("/config/tickers"), {
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
    await fetch(getApiUrl("/config/tickers"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tickers })
    });
    fetchInference();
  };

  const fetchNews = async () => {
    try {
      const res = await fetch(getApiUrl("/market/news"));
      if (res.ok) {
        const newsJson = await res.json();
        setNews(newsJson);
      }
    } catch { /* Silent fail */ }
  };

  useEffect(() => {
    fetchInference();
    fetchNews();
    const inferenceTimer = setInterval(() => {
      if (!loadingRef.current && !trainingRef.current) fetchInference();
    }, 120000);
    const newsTimer = setInterval(fetchNews, 30000);
    return () => {
      clearInterval(inferenceTimer);
      clearInterval(newsTimer);
    };
  }, []);

  const getSentimentStyle = (sent: string) => {
    switch (sent) {
      case "POS": return { variant: "default" as const, className: "bg-green-500/10 text-green-500 border-green-500/20" };
      case "NEG": return { variant: "destructive" as const, className: "" };
      default: return { variant: "secondary" as const, className: "" };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        onRefresh={fetchInference}
        onTrain={startTraining}
        onConfigTickers={() => setTickerModalOpen(true)}
        onLoadPreset={loadPreset}
        loading={loading}
        training={training}
        tickerCount={data?.tickers?.length}
        activePreset={activePreset}
        presets={PRESETS}
      />

      {/* Ticker Modal */}
      <TickerModal
        open={tickerModalOpen}
        onOpenChange={setTickerModalOpen}
        currentTickers={data?.tickers || []}
        onSubmit={handleCustomTickers}
      />

      <main className="p-6 space-y-6">
        {/* Training Status Banner */}
        {training && trainingStatus && (
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-primary animate-pulse" />
                  <span className="font-semibold text-primary">Training in Progress</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Episode {trainingStatus.episode}/{trainingStatus.total}
                </span>
              </div>
              <Progress value={(trainingStatus.episode / trainingStatus.total) * 100} className="h-2" />
              <p className="mt-2 text-sm text-muted-foreground">
                Last Reward: <span className={trainingStatus.reward > 0 ? "text-green-500" : "text-red-500"}>
                  {(Number(trainingStatus.reward) || 0).toFixed(4)}
                </span>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Error Banner */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}. Make sure the Python Backend is running on port 8000.
            </AlertDescription>
          </Alert>
        )}

        {/* Metrics Panel */}
        {data?.metrics && <MetricsPanel metrics={data.metrics} />}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Graph & Logs */}
          <div className="lg:col-span-8 space-y-6">
            {/* Graph Module */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Neural Asset Graph
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[500px]">
                {data ? (
                  <GraphModule data={data.graph} />
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Initializing Neural Assets...
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Execution Log */}
            <div className="h-[250px]">
              <ExecutionLog />
            </div>
          </div>

          {/* Right Column - Charts & News */}
          <div className="lg:col-span-4 space-y-6">
            {/* Comparison Chart */}
            <ComparisonChart agentWeights={data?.weights} />

            {/* Signal Intelligence */}
            <Card className="h-[350px] flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Signal Intelligence</CardTitle>
                  <Badge variant="outline" className="text-xs animate-pulse">
                    Live
                  </Badge>
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
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-sm">{item.src}</span>
                              <Badge variant={style.variant} className={style.className}>
                                {item.sent}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {item.msg || item.title}
                            </p>
                            <span className="text-xs text-muted-foreground/60 mt-2 block">
                              {item.ts}
                            </span>
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
      </main>
    </div>
  );
}
