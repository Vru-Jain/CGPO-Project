"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Activity,
    BrainCircuit,
    RefreshCw,
    Settings2,
    Zap,
    TrendingUp,
    Trophy,
    ChevronRight,
    Menu,
    X,
    Play,
    Brain,
    Sliders,
    HelpCircle,
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
    onReplayTutorial: () => void;
    loading: boolean;
    training: boolean;
    trainingStatus: TrainingStatus | null;
    tickerCount?: number;
    activePreset: string | null;
    presets: Record<string, string[]>;
    presetGroups: { label: string; presets: string[] }[];
    isConnected: boolean;
}

export default function Sidebar(props: SidebarProps) {
    const {
        onRefresh, onTrain, onConfigTickers, onLoadPreset, onReplayTutorial,
        loading, training, trainingStatus, tickerCount,
        activePreset, presets, presetGroups, isConnected,
    } = props;

    // Mobile drawer open state 
    const [mobileOpen, setMobileOpen] = useState(false);
    // Tablet: collapsed icon-only
    const [collapsed, setCollapsed] = useState(false);

    // Auto-close mobile drawer on resize to md+
    useEffect(() => {
        const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);

    const trainingPct = trainingStatus
        ? Math.round((trainingStatus.episode / trainingStatus.total) * 100)
        : 0;

    // Shared action items
    const actions = [
        { label: "Run Inference", icon: <Play className="h-4 w-4" />, onClick: onRefresh, disabled: loading, loading: loading, loadingLabel: "Running..." },
        { label: "Train Agent", icon: <Brain className="h-4 w-4" />, onClick: onTrain, disabled: training, loading: training, loadingLabel: "Training..." },
        { label: "Custom Tickers", icon: <Sliders className="h-4 w-4" />, onClick: onConfigTickers, disabled: false, loading: false, loadingLabel: "" },
    ];

    // ── Sidebar Content (reused across all modes) ───────────────────────────
    const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shrink-0">
                            <TrendingUp className="h-5 w-5 text-primary-foreground" />
                        </div>
                        {!collapsed && (
                            <h1 className="text-base font-bold tracking-tight">CGPO</h1>
                        )}
                    </div>
                    {/* Close button on mobile */}
                    {onClose && (
                        <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded">
                            <X className="h-5 w-5" />
                        </button>
                    )}
                    {/* Collapse toggle on md+ (not mobile) */}
                    {!onClose && (
                        <button
                            onClick={() => setCollapsed(c => !c)}
                            className="hidden md:flex text-muted-foreground hover:text-foreground p-1 rounded"
                        >
                            <Menu className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Status row */}
                {!collapsed && (
                    <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? "bg-green-400" : "bg-red-400"}`} />
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {isConnected ? "Online" : "Disconnected"}
                            </span>
                        </div>
                        {tickerCount && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Activity className="h-3 w-3" />{tickerCount} assets
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Training Progress */}
            {training && trainingStatus && !collapsed && (
                <div className="px-4 py-3 border-b bg-primary/5 shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                        <BrainCircuit className="h-3.5 w-3.5 text-primary animate-pulse" />
                        <span className="text-xs font-semibold text-primary">Training</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                            {trainingStatus.episode}/{trainingStatus.total}
                        </span>
                    </div>
                    <Progress value={trainingPct} className="h-1.5" />
                    <div className="mt-1.5 flex justify-between">
                        <span className="text-xs text-muted-foreground">Reward:</span>
                        <span className={`text-xs font-mono font-medium ${trainingStatus.reward > 0 ? "text-green-500" : "text-red-400"}`}>
                            {(Number(trainingStatus.reward) || 0).toFixed(4)}
                        </span>
                    </div>
                </div>
            )}

            {/* Collapsed training indicator */}
            {training && collapsed && (
                <div className="flex justify-center py-2 border-b bg-primary/5">
                    <BrainCircuit className="h-4 w-4 text-primary animate-pulse" />
                </div>
            )}

            {/* Actions */}
            <div className={`p-3 border-b shrink-0 space-y-1 ${collapsed ? "px-2" : ""}`}>
                {!collapsed && (
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1 mb-2">Actions</p>
                )}
                {actions.map((a) =>
                    collapsed ? (
                        <button
                            key={a.label}
                            onClick={a.onClick}
                            disabled={a.disabled}
                            title={a.label}
                            className="w-full flex justify-center items-center p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                        >
                            {a.loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : a.icon}
                        </button>
                    ) : (
                        <Button
                            key={a.label}
                            variant={a.label === "Run Inference" ? "default" : a.label === "Train Agent" ? "outline" : "ghost"}
                            size="sm"
                            onClick={a.onClick}
                            disabled={a.disabled}
                            className={`w-full justify-start ${a.label === "Train Agent" ? "border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground" : a.label === "Custom Tickers" ? "text-muted-foreground" : ""}`}
                        >
                            <span className={`mr-2 ${a.loading ? "animate-spin" : ""}`}>{a.icon}</span>
                            {a.loading ? a.loadingLabel : a.label}
                        </Button>
                    )
                )}
            </div>

            {/* Presets */}
            <div className={`flex-1 overflow-y-auto p-3 ${collapsed ? "px-2" : ""}`}>
                {!collapsed && (
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1 mb-2">Presets</p>
                )}
                <div className="space-y-3">
                    {presetGroups.map((group) => (
                        <div key={group.label}>
                            {!collapsed && (
                                <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest px-1 mb-1">{group.label}</p>
                            )}
                            <div className="space-y-0.5">
                                {group.presets.map((preset) =>
                                    collapsed ? (
                                        <button
                                            key={preset}
                                            onClick={() => onLoadPreset(preset)}
                                            title={preset}
                                            className={`w-full flex justify-center p-2 rounded-md transition-colors ${activePreset === preset ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground hover:text-foreground"}`}
                                        >
                                            <Zap className="h-3.5 w-3.5" />
                                        </button>
                                    ) : (
                                        <button
                                            key={preset}
                                            onClick={() => { onLoadPreset(preset); onClose?.(); }}
                                            className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-md text-sm transition-colors ${activePreset === preset ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground hover:text-foreground"}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Zap className="h-3.5 w-3.5 shrink-0" />
                                                {preset}
                                            </div>
                                            <ChevronRight className="h-3.5 w-3.5 opacity-50 shrink-0" />
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            {!collapsed && (
                <div className="p-4 border-t shrink-0 space-y-2">
                    <button
                        onClick={() => { onReplayTutorial(); onClose?.(); }}
                        className="w-full flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-md hover:bg-accent transition-colors"
                    >
                        <HelpCircle className="h-3.5 w-3.5 shrink-0" />
                        Help / Replay Tutorial
                    </button>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Trophy className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                        <span>CGPO v2.0 · Modal Cloud</span>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <>
            {/* ── Mobile: hamburger button (fixed, bottom-left) ──────────────────── */}
            <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden fixed bottom-5 left-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
                aria-label="Open menu"
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* ── Mobile: backdrop ────────────────────────────────────────────────── */}
            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ── Mobile: drawer ──────────────────────────────────────────────────── */}
            <div className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-card border-r shadow-2xl transform transition-transform duration-300 ease-in-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <SidebarContent onClose={() => setMobileOpen(false)} />
            </div>

            {/* ── Tablet: icon-only strip / Desktop: full panel ─────────────────── */}
            <aside className={`hidden md:flex flex-col h-screen sticky top-0 border-r bg-card transition-all duration-300 shrink-0 ${collapsed ? "w-14" : "w-64"}`}>
                <SidebarContent />
            </aside>
        </>
    );
}
