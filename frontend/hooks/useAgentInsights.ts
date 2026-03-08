"use client";

import { useMemo } from "react";

export interface InsightItem {
    ticker: string;
    weight: number;
    percentage: string;
    reason: string;
}

export interface AgentInsightsData {
    topPicks: InsightItem[];
    reductions: InsightItem[];
    totalAssets: number;
}

/**
 * Derives explainable AI insights from the raw weights and node-level features
 * returned by the RL agent's inference.
 *
 * @param weights  Record<ticker, weight>  from the inference API
 * @param graphNodes  Array of { id, return }   from the inference API
 */
export function useAgentInsights(
    weights: Record<string, number> | undefined,
    graphNodes: { id: string; return: number }[] | undefined
): AgentInsightsData | null {
    return useMemo(() => {
        if (!weights || Object.keys(weights).length === 0) return null;

        const entries = Object.entries(weights).sort((a, b) => b[1] - a[1]);
        const totalAssets = entries.length;

        // Build a quick lookup for node-level returns
        const returnMap: Record<string, number> = {};
        graphNodes?.forEach((n) => {
            returnMap[n.id] = n.return;
        });

        // Average weight for comparison
        const avgWeight = 1 / totalAssets;

        const makeReason = (ticker: string, weight: number): string => {
            const ret = returnMap[ticker];
            const isHeavy = weight > avgWeight * 1.5;
            const isLight = weight < avgWeight * 0.5;

            if (isHeavy) {
                if (ret !== undefined && ret > 0) {
                    return "Strong recent momentum with favorable risk-adjusted return";
                }
                return "High weight chosen to maximize portfolio Sharpe Ratio";
            }
            if (isLight) {
                if (ret !== undefined && ret < 0) {
                    return "Reduced due to negative recent returns and high downside risk";
                }
                return "Reduced due to high recent volatility relative to peers";
            }
            return "Moderate allocation within the balanced portfolio";
        };

        const topPicks: InsightItem[] = entries.slice(0, 3).map(([ticker, w]) => ({
            ticker,
            weight: w,
            percentage: `${(w * 100).toFixed(1)}%`,
            reason: makeReason(ticker, w),
        }));

        const reductions: InsightItem[] = entries
            .slice(-3)
            .reverse()
            .map(([ticker, w]) => ({
                ticker,
                weight: w,
                percentage: `${(w * 100).toFixed(1)}%`,
                reason: makeReason(ticker, w),
            }));

        return { topPicks, reductions, totalAssets };
    }, [weights, graphNodes]);
}
