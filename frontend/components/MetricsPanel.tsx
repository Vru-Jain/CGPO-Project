import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, Target } from "lucide-react";

interface MetricsPanelProps {
    metrics: {
        expected_return: number;
        volatility: number;
        sharpe_ratio: number;
    };
}

export default function MetricsPanel({ metrics }: MetricsPanelProps) {
    if (!metrics) return null;

    const sharpeQuality = metrics.sharpe_ratio > 2 ? "Excellent" : metrics.sharpe_ratio > 1 ? "Good" : metrics.sharpe_ratio > 0 ? "Low" : "Negative";
    const volLevel = metrics.volatility > 0.3 ? "High" : metrics.volatility > 0.15 ? "Moderate" : "Low";

    const items = [
        {
            label: "Expected Return",
            value: (metrics.expected_return * 100).toFixed(2) + "%",
            sublabel: "Annualized",
            icon: metrics.expected_return >= 0 ? TrendingUp : TrendingDown,
            color: metrics.expected_return >= 0 ? "text-green-500" : "text-red-500",
            bgColor: metrics.expected_return >= 0 ? "bg-green-500/10" : "bg-red-500/10",
            accent: metrics.expected_return >= 0 ? "metric-accent metric-accent-green" : "metric-accent metric-accent-red",
            ringColor: metrics.expected_return >= 0 ? "ring-green-500/20" : "ring-red-500/20",
        },
        {
            label: "Volatility",
            value: (metrics.volatility * 100).toFixed(2) + "%",
            sublabel: volLevel,
            icon: Activity,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
            accent: "metric-accent metric-accent-blue",
            ringColor: "ring-blue-500/20",
        },
        {
            label: "Sharpe Ratio",
            value: metrics.sharpe_ratio.toFixed(2),
            sublabel: sharpeQuality,
            icon: Target,
            color: metrics.sharpe_ratio > 0 ? "text-green-500" : "text-red-500",
            bgColor: metrics.sharpe_ratio > 0 ? "bg-green-500/10" : "bg-red-500/10",
            accent: metrics.sharpe_ratio > 0 ? "metric-accent metric-accent-green" : "metric-accent metric-accent-red",
            ringColor: metrics.sharpe_ratio > 0 ? "ring-green-500/20" : "ring-red-500/20",
        },
    ];

    return (
        <div className="grid grid-cols-3 gap-4">
            {items.map((m) => {
                const Icon = m.icon;
                return (
                    <Card key={m.label} className={`overflow-hidden ${m.accent} hover:shadow-lg hover:shadow-primary/5 transition-all duration-300`}>
                        <CardContent className="p-4 pt-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                                        {m.label}
                                    </p>
                                    <p className={`text-2xl font-bold mt-1.5 tracking-tight font-mono ${m.color}`}>
                                        {m.value}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">{m.sublabel}</p>
                                </div>
                                <div className={`h-10 w-10 rounded-xl ${m.bgColor} ring-1 ${m.ringColor} flex items-center justify-center`}>
                                    <Icon className={`h-5 w-5 ${m.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
