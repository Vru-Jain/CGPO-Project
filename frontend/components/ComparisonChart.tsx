"use client";

import { useState, useEffect, useCallback } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent
} from "@/components/ui/chart";

interface BenchmarkData {
    SPY?: { total_return: number; cumulative: number[]; dates: string[] };
    QQQ?: { total_return: number; cumulative: number[]; dates: string[] };
}

const PERIODS = [
    { label: "1 week", value: "5d" },
    { label: "1 month", value: "1mo" },
    { label: "3 months", value: "3mo" },
    { label: "6 months", value: "6mo" },
    { label: "1 year", value: "1y" },
];

const chartConfig = {
    SPY: {
        label: "SPY (S&P 500)",
        color: "hsl(221.2 83.2% 53.3%)",
    },
    QQQ: {
        label: "QQQ (Nasdaq 100)",
        color: "hsl(212 95% 68%)",
    },
} satisfies ChartConfig;

export default function ComparisonChart({ agentWeights }: { agentWeights: Record<string, number> | undefined }) {
    const [period, setPeriod] = useState("3mo");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [benchmarkData, setBenchmarkData] = useState<BenchmarkData | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const fetchBenchmark = useCallback(async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const res = await fetch(`/py-api/market/benchmark?period=${period}`);
            if (res.ok) {
                const data = await res.json();
                if (!data.benchmarks || (!data.benchmarks.SPY && !data.benchmarks.QQQ)) {
                    setFetchError("No benchmark data available");
                }
                setBenchmarkData(data.benchmarks);
            } else {
                setFetchError(`Backend error: ${res.status}`);
            }
        } catch (err) {
            setFetchError(`Connection failed`);
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => {
        fetchBenchmark();
    }, [fetchBenchmark]);

    // Build chart data
    const chartData = (() => {
        if (!benchmarkData?.SPY?.cumulative) return [];
        const spyCumulative = benchmarkData.SPY.cumulative;
        const qqCumulative = benchmarkData.QQQ?.cumulative || [];
        const dates = benchmarkData.SPY.dates;

        return dates.map((date, i) => ({
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            SPY: Number(((spyCumulative[i] - 1) * 100).toFixed(2)),
            QQQ: qqCumulative[i] ? Number(((qqCumulative[i] - 1) * 100).toFixed(2)) : 0,
        }));
    })();

    const selectedPeriod = PERIODS.find(p => p.value === period);

    return (
        <Card>
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1 text-center sm:text-left">
                    <CardTitle>Market Benchmarks - Interactive</CardTitle>
                    <CardDescription>
                        Showing benchmark performance for the {selectedPeriod?.label || 'last 3 months'}
                    </CardDescription>
                </div>

                {/* Period Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm hover:bg-accent"
                    >
                        {selectedPeriod?.label || 'Last 3 months'}
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                        >
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 top-full z-50 mt-1 min-w-[140px] overflow-hidden rounded-lg border border-border bg-card shadow-lg">
                            {PERIODS.map((p) => (
                                <button
                                    key={p.value}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPeriod(p.value);
                                        setIsDropdownOpen(false);
                                    }}
                                    className={`block w-full px-3 py-2 text-left text-sm hover:bg-accent ${period === p.value ? 'bg-accent text-accent-foreground' : ''
                                        }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                {fetchError ? (
                    <div className="flex h-[250px] items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                        ⚠️ {fetchError}
                    </div>
                ) : loading ? (
                    <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-primary" />
                            Loading benchmark data...
                        </div>
                    </div>
                ) : (
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[250px] w-full"
                    >
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="fillSPY" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-SPY)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--color-SPY)" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="fillQQQ" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-QQQ)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--color-QQQ)" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}%`}
                                tickMargin={8}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        labelFormatter={(value) => value}
                                        indicator="dot"
                                    />
                                }
                            />
                            <Area
                                dataKey="QQQ"
                                type="natural"
                                fill="url(#fillQQQ)"
                                stroke="var(--color-QQQ)"
                                stackId="a"
                            />
                            <Area
                                dataKey="SPY"
                                type="natural"
                                fill="url(#fillSPY)"
                                stroke="var(--color-SPY)"
                                stackId="b"
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                        </AreaChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}