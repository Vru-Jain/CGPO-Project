"use client";

import { TrendingUp, TrendingDown, Sparkles, Info, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AgentInsightsData } from "@/hooks/useAgentInsights";

interface AgentInsightsProps {
    data: AgentInsightsData | null;
    loading: boolean;
}

function InsightSkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 animate-pulse">
                    <div className="h-8 w-8 rounded-lg bg-muted" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-24 rounded bg-muted" />
                        <div className="h-3 w-full rounded bg-muted" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function InsightRow({
    ticker,
    percentage,
    reason,
    type,
}: {
    ticker: string;
    percentage: string;
    reason: string;
    type: "top" | "bottom";
}) {
    const isTop = type === "top";
    return (
        <div
            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors hover:bg-accent/50 ${
                isTop
                    ? "border-green-500/20 bg-green-500/5"
                    : "border-red-500/20 bg-red-500/5"
            }`}
        >
            <div
                className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-lg ${
                    isTop
                        ? "bg-green-500/10 text-green-500"
                        : "bg-red-500/10 text-red-500"
                }`}
            >
                {isTop ? (
                    <TrendingUp className="h-4 w-4" />
                ) : (
                    <TrendingDown className="h-4 w-4" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-sm">{ticker}</span>
                    <span
                        className={`text-xs font-mono font-medium ${
                            isTop ? "text-green-500" : "text-red-400"
                        }`}
                    >
                        {percentage}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    {reason}
                </p>
            </div>
        </div>
    );
}

export default function AgentInsights({ data, loading }: AgentInsightsProps) {
    return (
        <Card className="h-full flex flex-col card-glow hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-400" />
                        Agent Insights
                    </CardTitle>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Info className="h-3 w-3" />
                        XAI
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4">
                {loading ? (
                    <InsightSkeleton />
                ) : !data ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm italic py-8">
                        Run inference to see agent recommendations
                    </div>
                ) : (
                    <>
                        {data.isUntrained && (
                            <div className="flex items-start gap-2.5 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 text-xs">
                                <GraduationCap className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-amber-400">Agent is untrained</p>
                                    <p className="text-muted-foreground mt-0.5">
                                        Weights are equal across all assets. Click <strong>Train Agent</strong> to learn differentiated allocations.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Top Picks */}
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                Top Robust Choices
                            </p>
                            <div className="space-y-2">
                                {data.topPicks.map((item) => (
                                    <InsightRow
                                        key={item.ticker}
                                        ticker={item.ticker}
                                        percentage={item.percentage}
                                        reason={item.reason}
                                        type="top"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Reductions */}
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                Reductions / Underweight
                            </p>
                            <div className="space-y-2">
                                {data.reductions.map((item) => (
                                    <InsightRow
                                        key={item.ticker}
                                        ticker={item.ticker}
                                        percentage={item.percentage}
                                        reason={item.reason}
                                        type="bottom"
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
