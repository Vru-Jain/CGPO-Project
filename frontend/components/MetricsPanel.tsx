export default function MetricsPanel({ metrics }: { metrics: any }) {
    if (!metrics) return null;

    const items = [
        { label: "EXP. RETURN", value: (metrics.expected_return * 100).toFixed(2) + "%", color: "text-success" },
        { label: "VOLATILITY", value: (metrics.volatility * 100).toFixed(2) + "%", color: "text-primary" },
        { label: "SHARPE RATIO", value: metrics.sharpe_ratio.toFixed(2), color: metrics.sharpe_ratio > 0 ? "text-success" : "text-danger" },
    ];

    return (
        <div className="neo-card flex justify-around items-center py-4 mb-6">
            {items.map((m) => (
                <div key={m.label} className="text-center">
                    <div className="text-[10px] text-textDim mb-1 tracking-widest">{m.label}</div>
                    <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
                </div>
            ))}
        </div>
    );
}
