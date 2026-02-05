"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Activity,
    BrainCircuit,
    ChevronDown,
    RefreshCw,
    Settings2,
    Zap,
    TrendingUp
} from "lucide-react";

interface HeaderProps {
    onRefresh: () => void;
    onTrain: () => void;
    onConfigTickers: () => void;
    onLoadPreset: (preset: string) => void;
    loading: boolean;
    training: boolean;
    tickerCount?: number;
    activePreset: string | null;
    presets: Record<string, string[]>;
}

export default function Header({
    onRefresh,
    onTrain,
    onConfigTickers,
    onLoadPreset,
    loading,
    training,
    tickerCount,
    activePreset,
    presets
}: HeaderProps) {
    return (
        <header className="border-b bg-card">
            <div className="flex h-16 items-center justify-between px-6">
                {/* Logo & Status */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                            <TrendingUp className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight">CGPO</h1>
                            <p className="text-xs text-muted-foreground">Cognitive Graph Portfolio Optimizer</p>
                        </div>
                    </div>

                    {/* Status Indicators */}
                    <div className="hidden md:flex items-center gap-4 border-l pl-6">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-xs text-muted-foreground">System Online</span>
                        </div>
                        {tickerCount && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Activity className="h-3 w-3" />
                                {tickerCount} Assets
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {/* Preset Selector */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="hidden sm:flex">
                                <Zap className="mr-2 h-4 w-4" />
                                {activePreset || "Presets"}
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Quick Presets</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {Object.keys(presets).map((preset) => (
                                <DropdownMenuItem
                                    key={preset}
                                    onClick={() => onLoadPreset(preset)}
                                    className={activePreset === preset ? "bg-accent" : ""}
                                >
                                    <Zap className="mr-2 h-4 w-4" />
                                    {preset}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Custom Tickers */}
                    <Button variant="ghost" size="sm" onClick={onConfigTickers}>
                        <Settings2 className="h-4 w-4" />
                        <span className="ml-2 hidden lg:inline">Custom</span>
                    </Button>

                    {/* Train Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onTrain}
                        disabled={training}
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                        <BrainCircuit className={`h-4 w-4 ${training ? "animate-pulse" : ""}`} />
                        <span className="ml-2 hidden sm:inline">
                            {training ? "Training..." : "Train"}
                        </span>
                    </Button>

                    {/* Run Inference */}
                    <Button
                        size="sm"
                        onClick={onRefresh}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        <span className="ml-2 hidden sm:inline">
                            {loading ? "Running..." : "Run Inference"}
                        </span>
                    </Button>
                </div>
            </div>
        </header>
    );
}
