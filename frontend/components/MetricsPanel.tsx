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

    const items = [
        {
            label: "Expected Return",
            value: (metrics.expected_return * 100).toFixed(2) + "%",
            icon: metrics.expected_return >= 0 ? TrendingUp : TrendingDown,
            color: metrics.expected_return >= 0 ? "text-green-500" : "text-red-500",
            bgColor: metrics.expected_return >= 0 ? "bg-green-500/10" : "bg-red-500/10"
        },
        {
            label: "Volatility",
            value: (metrics.volatility * 100).toFixed(2) + "%",
            icon: Activity,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10"
        },
        {
            label: "Sharpe Ratio",
            value: metrics.sharpe_ratio.toFixed(2),
            icon: Target,
            color: metrics.sharpe_ratio > 0 ? "text-green-500" : "text-red-500",
            bgColor: metrics.sharpe_ratio > 0 ? "bg-green-500/10" : "bg-red-500/10"
        },
    ];

    return (
        <div className="grid grid-cols-3 gap-4">
            {items.map((m) => {
                const Icon = m.icon;
                return (
                    <Card key={m.label} className="overflow-hidden">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                                        {m.label}
                                    </p>
                                    <p className={`text-2xl font-bold mt-1 ${m.color}`}>
                                        {m.value}
                                    </p>
                                </div>
                                <div className={`h-10 w-10 rounded-full ${m.bgColor} flex items-center justify-center`}>
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
