"use client";

import { useMemo } from "react";

export type MarketRegion = "US" | "IN";

/**
 * Determines the market region of the currently loaded portfolio.
 * Used to auto-select the correct benchmark (S&P 500 vs Nifty 50).
 *
 * Portfolios are strictly US or Indian — no mixing.
 * If the majority of tickers are Indian (.NS / .BO), returns "IN".
 * Otherwise defaults to "US".
 */
export function useMarketRegion(tickers: string[] | undefined): MarketRegion {
    return useMemo(() => {
        if (!tickers || tickers.length === 0) return "US";

        const indianCount = tickers.filter(
            (t) => t.endsWith(".NS") || t.endsWith(".BO")
        ).length;

        return indianCount > tickers.length / 2 ? "IN" : "US";
    }, [tickers]);
}
