"use client";

import { useEffect, useRef, useState } from "react";

interface LogEntry {
    id: number;
    timestamp: string;
    type: "INFO" | "WARN" | "ERROR" | "SUCCESS" | "TRACE";
    message: string;
}

export default function ExecutionLog() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial mock logs to populate the terminal
    useEffect(() => {
        const initialLogs: LogEntry[] = [
            { id: 1, timestamp: new Date().toLocaleTimeString(), type: "INFO", message: "System initialized. Kernel loaded." },
            { id: 2, timestamp: new Date().toLocaleTimeString(), type: "INFO", message: "Connecting to Exchange Data Feeds..." },
            { id: 3, timestamp: new Date().toLocaleTimeString(), type: "SUCCESS", message: "Connection established (Latency: 12ms)" },
            { id: 4, timestamp: new Date().toLocaleTimeString(), type: "TRACE", message: "Loading GNN model: agent_v4.pth" },
        ];
        setLogs(initialLogs);

        // Simulate "alive" logs
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                addLog(generateMockLog());
            }
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const addLog = (log: Omit<LogEntry, "id" | "timestamp">) => {
        setLogs((prev) => {
            const newLogs = [
                ...prev,
                {
                    id: Date.now(),
                    timestamp: new Date().toLocaleTimeString(),
                    ...log,
                },
            ];
            // Keep only last 50 logs
            return newLogs.slice(-50);
        });
    };

    // Mock log generator for visual effect
    const generateMockLog = (): Omit<LogEntry, "id" | "timestamp"> => {
        const types: LogEntry["type"][] = ["INFO", "TRACE", "WARN", "SUCCESS"];
        const messages = [
            "Scanning correlation matrix...",
            "Updated node features for AAPL",
            "GNN message passing cycle complete",
            "Risk threshold check passed",
            "Fetching latest market sentiment...",
            "Rebalancing portfolio weights...",
            "Detected volatility spike in Tech sector",
            "Optimizing Bellman equation...",
        ];

        // Weighted random type
        let type = types[0];
        const rand = Math.random();
        if (rand > 0.9) type = "WARN";
        else if (rand > 0.7) type = "SUCCESS";
        else if (rand > 0.4) type = "TRACE";

        return {
            type,
            message: messages[Math.floor(Math.random() * messages.length)],
        };
    };

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="neo-card h-full flex flex-col font-mono text-xs overflow-hidden">
            <div className="flex justify-between items-center border-b border-border pb-2 mb-2">
                <h3 className="text-secondary font-bold">EXECUTION TRACE</h3>
                <div className="flex gap-2">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                    <span className="text-textDim">LIVE</span>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto space-y-1 scrollbar-hide"
            >
                {logs.map((log) => (
                    <div key={log.id} className="flex gap-2">
                        <span className="text-textDim">[{log.timestamp}]</span>
                        <span className={getTypeColor(log.type)}>{log.type}:</span>
                        <span className="text-gray-300">{log.message}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function getTypeColor(type: LogEntry["type"]) {
    switch (type) {
        case "INFO": return "text-blue-400";
        case "WARN": return "text-yellow-400";
        case "ERROR": return "text-red-500 font-bold";
        case "SUCCESS": return "text-green-400";
        case "TRACE": return "text-purple-400";
        default: return "text-gray-400";
    }
}
