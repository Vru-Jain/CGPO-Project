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
    [key: string]: { total_return: number; cumulative: number[]; dates: string[] };
}

const PERIODS = [
    { label: "1 week", value: "5d" },
    { label: "1 month", value: "1mo" },
    { label: "3 months", value: "3mo" },
    { label: "6 months", value: "6mo" },
    { label: "1 year", value: "1y" },
];

const BENCHMARKS = [
    { label: "S&P 500 (US)", value: "^GSPC", color: "hsl(221.2 83.2% 53.3%)" },
    { label: "Nasdaq 100 (US)", value: "^IXIC", color: "hsl(212 95% 68%)" },
    { label: "Dow Jones (US)", value: "^DJI", color: "hsl(280 65% 60%)" },
    { label: "Nifty 50 (IN)", value: "^NSEI", color: "hsl(142 76% 36%)" },
    { label: "Sensex (IN)", value: "^BSESN", color: "hsl(24 94% 50%)" },
];

const chartConfig = {
    BENCH: {
        label: "Benchmark",
        color: "hsl(221.2 83.2% 53.3%)",
    },
} satisfies ChartConfig;

export default function ComparisonChart({ agentWeights }: { agentWeights: Record<string, number> | undefined }) {
    const [period, setPeriod] = useState("3mo");
    const [selectedBenchmark, setSelectedBenchmark] = useState(BENCHMARKS[0]);
    const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
    const [isBenchDropdownOpen, setIsBenchDropdownOpen] = useState(false);

    const [benchmarkData, setBenchmarkData] = useState<BenchmarkData | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const fetchBenchmark = useCallback(async () => {
        setLoading(true);
        setFetchError(null);
        try {
            // Encode the ticker properly (e.g. ^ values)
            const tickerParam = encodeURIComponent(selectedBenchmark.value);
            const res = await fetch(`/py-api/market/benchmark?period=${period}&ticker=${tickerParam}`);
            if (res.ok) {
                const data = await res.json();
                if (!data.benchmarks || Object.keys(data.benchmarks).length === 0) {
                    setFetchError("No data available for this index");
                    setBenchmarkData(null);
                } else {
                    setBenchmarkData(data.benchmarks);
                }
            } else {
                setFetchError(`Backend error: ${res.status}`);
            }
        } catch (err) {
            setFetchError(`Connection failed`);
        } finally {
            setLoading(false);
        }
    }, [period, selectedBenchmark]);

    useEffect(() => {
        fetchBenchmark();
    }, [fetchBenchmark]);

    // Build chart data
    const chartData = (() => {
        if (!benchmarkData) return [];
        // The key in the response will match the requested ticker
        const key = selectedBenchmark.value;
        const data = benchmarkData[key];

        if (!data || !data.cumulative) return [];

        return data.dates.map((date, i) => ({
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            BENCH: Number(((data.cumulative[i] - 1) * 100).toFixed(2)),
        }));
    })();

    const selectedPeriod = PERIODS.find(p => p.value === period);

    // Update dynamic chart config color based on selection
    const dynamicConfig = {
        BENCH: {
            label: selectedBenchmark.label,
            color: selectedBenchmark.color,
        }
    };

    return (
        <Card>
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row justify-between">
                <div className="grid flex-1 gap-1 text-center sm:text-left">
                    <CardTitle>Market Benchmark</CardTitle>
                    <CardDescription>
                        Performance for {selectedPeriod?.label || 'last 3 months'}
                    </CardDescription>
                </div>

                <div className="flex gap-2">
                    {/* Index Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsBenchDropdownOpen(!isBenchDropdownOpen)}
                            className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm hover:bg-accent min-w-[140px] justify-between"
                        >
                            <span className="truncate">{selectedBenchmark.label}</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${isBenchDropdownOpen ? 'rotate-180' : ''}`}>
                                <path d="m6 9 6 6 6-6" />
                            </svg>
                        </button>

                        {isBenchDropdownOpen && (
                            <div className="absolute right-0 top-full z-50 mt-1 w-[200px] overflow-hidden rounded-lg border border-border bg-card shadow-lg">
                                {BENCHMARKS.map((b) => (
                                    <button
                                        key={b.value}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedBenchmark(b);
                                            setIsBenchDropdownOpen(false);
                                        }}
                                        className={`block w-full px-3 py-2 text-left text-sm hover:bg-accent ${selectedBenchmark.value === b.value ? 'bg-accent text-accent-foreground' : ''}`}
                                    >
                                        {b.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Period Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
                            className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm hover:bg-accent"
                        >
                            {selectedPeriod?.label}
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${isPeriodDropdownOpen ? 'rotate-180' : ''}`}>
                                <path d="m6 9 6 6 6-6" />
                            </svg>
                        </button>

                        {isPeriodDropdownOpen && (
                            <div className="absolute right-0 top-full z-50 mt-1 min-w-[100px] overflow-hidden rounded-lg border border-border bg-card shadow-lg">
                                {PERIODS.map((p) => (
                                    <button
                                        key={p.value}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPeriod(p.value);
                                            setIsPeriodDropdownOpen(false);
                                        }}
                                        className={`block w-full px-3 py-2 text-left text-sm hover:bg-accent ${period === p.value ? 'bg-accent text-accent-foreground' : ''}`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                {fetchError ? (
                    <div className="flex h-[250px] items-center justify-center rounded-lg bg-destructive/10 text-destructive text-sm p-4 text-center">
                        <div>
                            <p className="font-bold">⚠️ Data unavailable</p>
                            <p className="text-xs mt-1 opacity-80">{fetchError}</p>
                            <p className="text-xs mt-2 text-muted-foreground">Try selecting a different index or period.</p>
                        </div>
                    </div>
                ) : loading ? (
                    <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-primary" />
                            Fetching market data...
                        </div>
                    </div>
                ) : (
                    <ChartContainer
                        config={dynamicConfig}
                        className="aspect-auto h-[250px] w-full"
                    >
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="fillBench" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={selectedBenchmark.color} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={selectedBenchmark.color} stopOpacity={0.1} />
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
                                dataKey="BENCH"
                                type="natural"
                                fill="url(#fillBench)"
                                stroke={selectedBenchmark.color}
                                stackId="a"
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                        </AreaChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}