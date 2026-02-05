"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

interface LogEntry {
    id: number;
    timestamp: string;
    type: "INFO" | "WARN" | "ERROR" | "SUCCESS" | "TRACE";
    message: string;
}

const typeVariants: Record<LogEntry["type"], { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
    INFO: { variant: "secondary", className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" },
    WARN: { variant: "secondary", className: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20" },
    ERROR: { variant: "destructive", className: "" },
    SUCCESS: { variant: "secondary", className: "bg-green-500/10 text-green-500 hover:bg-green-500/20" },
    TRACE: { variant: "secondary", className: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20" },
};

export default function ExecutionLog() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const getApiUrl = (path: string) => {
        if (typeof window === "undefined") return `http://127.0.0.1:8000${path}`;
        return `/py-api${path}`;
    };

    useEffect(() => {
        let cancelled = false;

        const fetchLogs = async () => {
            try {
                const res = await fetch(getApiUrl("/system/logs?limit=50"));
                if (!res.ok) {
                    throw new Error(`Backend returned ${res.status}`);
                }
                const data: LogEntry[] = await res.json();
                if (!cancelled) {
                    setLogs(data);
                    setError(null);
                }
            } catch (e: any) {
                if (!cancelled) {
                    setError(e.message || "Failed to load logs");
                }
            }
        };

        fetchLogs();
        const interval = setInterval(fetchLogs, 2000);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Execution Trace
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-xs text-muted-foreground">Live</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden pb-4">
                <ScrollArea className="h-full pr-4" ref={scrollRef}>
                    <div className="space-y-2 font-mono text-xs">
                        {error && logs.length === 0 && (
                            <div className="text-destructive">
                                Failed to load execution logs: {error}
                            </div>
                        )}
                        {!error && logs.length === 0 && (
                            <div className="text-muted-foreground italic text-center py-8">
                                Waiting for execution events...
                            </div>
                        )}
                        {logs.map((log) => {
                            const typeStyle = typeVariants[log.type];
                            return (
                                <div key={log.id} className="flex items-start gap-2 py-1">
                                    <span className="text-muted-foreground shrink-0">
                                        [{log.timestamp}]
                                    </span>
                                    <Badge
                                        variant={typeStyle.variant}
                                        className={`shrink-0 text-[10px] px-1.5 ${typeStyle.className}`}
                                    >
                                        {log.type}
                                    </Badge>
                                    <span className="text-foreground/80 break-all">
                                        {log.message}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
