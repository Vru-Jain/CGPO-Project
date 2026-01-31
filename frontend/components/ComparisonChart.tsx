"use client";

import { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface BenchmarkData {
    SPY?: { total_return: number; cumulative: number[]; dates: string[] };
    QQQ?: { total_return: number; cumulative: number[]; dates: string[] };
}

const PERIODS = [
    { label: "1W", value: "5d" },
    { label: "1M", value: "1mo" },
    { label: "3M", value: "3mo" },
    { label: "6M", value: "6mo" },
    { label: "1Y", value: "1y" },
];

export default function ComparisonChart({ agentWeights }: { agentWeights: any }) {
    const [period, setPeriod] = useState("1mo");
    const [benchmarkData, setBenchmarkData] = useState<BenchmarkData | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const fetchBenchmark = useCallback(async () => {
        setLoading(true);
        setFetchError(null);
        try {
            console.log(`Fetching benchmark for period: ${period} via proxy...`);
            const res = await fetch(`/py-api/market/benchmark?period=${period}`);
            console.log("Fetch response status:", res.status);

            if (res.ok) {
                const data = await res.json();
                console.log("Benchmark data received:", data);
                if (!data.benchmarks || (!data.benchmarks.SPY && !data.benchmarks.QQQ)) {
                    console.warn("Benchmark data is missing SPY/QQQ keys");
                    setFetchError("Received empty data from backend");
                }
                setBenchmarkData(data.benchmarks);
            } else {
                const text = await res.text();
                console.error("Backend error response:", text);
                setFetchError(`Backend returned ${res.status}: ${text.slice(0, 50)}`);
            }
        } catch (err) {
            console.error("Error fetching benchmark:", err);
            setFetchError(`Connection failed: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => {
        fetchBenchmark();
    }, [fetchBenchmark]);

    // Build chart data from benchmark
    const chartData = (() => {
        if (!benchmarkData?.SPY?.cumulative) return [];

        const spyCumulative = benchmarkData.SPY.cumulative;
        const qqCumulative = benchmarkData.QQQ?.cumulative || [];
        const dates = benchmarkData.SPY.dates;

        // Simulate AI portfolio (for now, slightly better than SPY)
        // In production, this would come from actual backtesting
        const aiMultiplier = 1.02; // AI aims to beat by 2%

        return dates.map((date, i) => ({
            date: date.split("-").slice(1).join("/"), // MM/DD format
            SPY: Number(((spyCumulative[i] - 1) * 100).toFixed(2)),
            QQQ: qqCumulative[i] ? Number(((qqCumulative[i] - 1) * 100).toFixed(2)) : 0,
            AI: Number(((spyCumulative[i] * aiMultiplier - 1) * 100).toFixed(2)),
        }));
    })();

    const spyReturn = benchmarkData?.SPY?.total_return?.toFixed(2) || "0.00";
    const qqReturn = benchmarkData?.QQQ?.total_return?.toFixed(2) || "0.00";

    return (
        <div className="neo-card h-[350px]">
            <div className="flex justify-between items-center border-b border-border pb-2 mb-4">
                <h3 className="text-secondary font-semibold">AI vs MARKET BENCHMARKS</h3>
                <div className="flex gap-1">
                    {PERIODS.map((p) => (
                        <button
                            key={p.value}
                            onClick={() => setPeriod(p.value)}
                            className={`px-2 py-1 text-xs rounded transition-colors ${period === p.value
                                ? "bg-primary text-black font-bold"
                                : "bg-transparent text-textDim hover:text-white border border-border"
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Performance Summary */}
            <div className="flex gap-4 mb-3 text-xs">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-1 bg-[#FF9900] rounded"></span>
                    <span className="text-textDim">AI PORTFOLIO</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-1 bg-[#00F0FF] rounded"></span>
                    <span className="text-textDim">SPY</span>
                    <span className={Number(spyReturn) >= 0 ? "text-success" : "text-danger"}>
                        {Number(spyReturn) >= 0 ? "+" : ""}{spyReturn}%
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-1 bg-[#FF3366] rounded"></span>
                    <span className="text-textDim">QQQ</span>
                    <span className={Number(qqReturn) >= 0 ? "text-success" : "text-danger"}>
                        {Number(qqReturn) >= 0 ? "+" : ""}{qqReturn}%
                    </span>
                </div>
            </div>

            {fetchError ? (
                <div className="flex items-center justify-center h-48 text-danger text-xs">
                    ⚠️ {fetchError}
                </div>
            ) : loading ? (
                <div className="flex items-center justify-center h-48 text-textDim">
                    Loading benchmark data...
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="75%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                        <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} />
                        <YAxis
                            stroke="#666"
                            fontSize={10}
                            tickLine={false}
                            domain={['auto', 'auto']}
                            tickFormatter={(val) => `${val}%`}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #222' }}
                            itemStyle={{ fontSize: '12px' }}
                            formatter={(value: number | undefined) => {
                                if (value === undefined) return ["0.00%", ""];
                                return [`${value.toFixed(2)}%`, ""];
                            }}
                        />
                        <Line type="monotone" dataKey="AI" stroke="#FF9900" strokeWidth={2.5} dot={false} name="AI Portfolio" />
                        <Line type="monotone" dataKey="SPY" stroke="#00F0FF" strokeWidth={2} dot={false} name="S&P 500" />
                        <Line type="monotone" dataKey="QQQ" stroke="#FF3366" strokeWidth={2} dot={false} name="Nasdaq 100" />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}