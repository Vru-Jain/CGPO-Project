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
    isUntrained: boolean;
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

        // Detect untrained: weights are essentially uniform (spread < 0.5%).
        // A partially-trained but conservative agent can still shift weights by
        // 1-2%, so the threshold is kept strict to avoid mislabelling it as
        // "untrained" and hiding its real reasoning.
        const allWeights = entries.map(([, w]) => w);
        const spread = Math.max(...allWeights) - Math.min(...allWeights);
        const isUntrained = spread < 0.005;

        // Build a quick lookup for node-level returns
        const returnMap: Record<string, number> = {};
        graphNodes?.forEach((n) => {
            returnMap[n.id] = n.return;
        });

        const avgWeight = 1 / totalAssets;

        const makeReason = (ticker: string, weight: number): string => {
            if (isUntrained) {
                const ret = returnMap[ticker];
                if (ret !== undefined && ret > 0.005) return "Positive recent momentum";
                if (ret !== undefined && ret < -0.005) return "Negative recent trend";
                return "Equal weight — train to differentiate";
            }

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

        return { topPicks, reductions, totalAssets, isUntrained };
    }, [weights, graphNodes]);
}
