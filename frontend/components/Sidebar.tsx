"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    Activity,
    BrainCircuit,
    RefreshCw,
    Settings2,
    Zap,
    TrendingUp,
    Trophy,
    ChevronRight,
} from "lucide-react";

interface TrainingStatus {
    episode: number;
    total: number;
    reward: number;
}

interface SidebarProps {
    onRefresh: () => void;
    onTrain: () => void;
    onConfigTickers: () => void;
    onLoadPreset: (preset: string) => void;
    loading: boolean;
    training: boolean;
    trainingStatus: TrainingStatus | null;
    tickerCount?: number;
    activePreset: string | null;
    presets: Record<string, string[]>;
    isConnected: boolean;
}

export default function Sidebar({
    onRefresh,
    onTrain,
    onConfigTickers,
    onLoadPreset,
    loading,
    training,
    trainingStatus,
    tickerCount,
    activePreset,
    presets,
    isConnected,
}: SidebarProps) {
    const trainingPct = trainingStatus
        ? Math.round((trainingStatus.episode / trainingStatus.total) * 100)
        : 0;

    return (
        <aside className="w-64 shrink-0 h-screen sticky top-0 border-r bg-card flex flex-col overflow-hidden">
            {/* Logo */}
            <div className="p-5 border-b">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shrink-0">
                        <TrendingUp className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold tracking-tight">CGPO</h1>
                        <p className="text-xs text-muted-foreground leading-tight">
                            Cognitive Graph Portfolio Optimizer
                        </p>
                    </div>
                </div>

                {/* Status row */}
                <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? "bg-green-400" : "bg-red-400"}`} />
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {isConnected ? "System Online" : "Disconnected"}
                        </span>
                    </div>
                    {tickerCount && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Activity className="h-3 w-3" />
                            {tickerCount} assets
                        </div>
                    )}
                </div>
            </div>

            {/* Training Progress */}
            {training && trainingStatus && (
                <div className="px-4 py-3 border-b bg-primary/5">
                    <div className="flex items-center gap-2 mb-2">
                        <BrainCircuit className="h-3.5 w-3.5 text-primary animate-pulse" />
                        <span className="text-xs font-semibold text-primary">Training Agent</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                            {trainingStatus.episode}/{trainingStatus.total}
                        </span>
                    </div>
                    <Progress value={trainingPct} className="h-1.5" />
                    <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Last reward:</span>
                        <span className={`text-xs font-mono font-medium ${trainingStatus.reward > 0 ? "text-green-500" : "text-red-400"}`}>
                            {(Number(trainingStatus.reward) || 0).toFixed(4)}
                        </span>
                    </div>
                </div>
            )}

            {/* Main Actions */}
            <div className="p-4 space-y-2 border-b">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Actions</p>
                <Button
                    className="w-full justify-start"
                    size="sm"
                    onClick={onRefresh}
                    disabled={loading}
                >
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    {loading ? "Running..." : "Run Inference"}
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={onTrain}
                    disabled={training}
                    className="w-full justify-start border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
                >
                    <BrainCircuit className={`mr-2 h-4 w-4 ${training ? "animate-pulse" : ""}`} />
                    {training ? "Training..." : "Train Agent"}
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onConfigTickers}
                    className="w-full justify-start text-muted-foreground"
                >
                    <Settings2 className="mr-2 h-4 w-4" />
                    Custom Tickers
                </Button>
            </div>

            {/* Presets */}
            <div className="p-4 flex-1 overflow-y-auto">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Quick Presets</p>
                <div className="space-y-1">
                    {Object.keys(presets).map((preset) => (
                        <button
                            key={preset}
                            onClick={() => onLoadPreset(preset)}
                            className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-md text-sm transition-colors
                                ${activePreset === preset
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-accent text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Zap className="h-3.5 w-3.5 shrink-0" />
                                {preset}
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Trophy className="h-3.5 w-3.5 text-yellow-500" />
                    <span>CGPO v2.0 · Modal Cloud</span>
                </div>
            </div>
        </aside>
    );
}
