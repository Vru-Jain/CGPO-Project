"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Settings, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";

// Context Definition
interface BackendContextType {
    backendUrl: string;
    setBackendUrl: (url: string) => void;
    isConnected: boolean;
    checkConnection: (urlToCheck?: string) => Promise<boolean>;
}

const BackendContext = createContext<BackendContextType | undefined>(undefined);

// Hook
export const useBackend = () => {
    const context = useContext(BackendContext);
    if (!context) {
        throw new Error("useBackend must be used within a BackendProvider");
    }
    return context;
};

// Provider Component
export const BackendProvider = ({ children }: { children: ReactNode }) => {
    const defaultUrl = "/py-api";
    const [backendUrl, setBackendUrlState] = useState(defaultUrl);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("cgpo_backend_url");
            if (stored && !stored.includes("ngrok") && !stored.includes("modal.run")) {
                setBackendUrlState(stored);
            }
        }
    }, []);

    // Update LocalStorage when URL changes
    const setBackendUrl = (url: string) => {
        // Strip trailing slash
        const cleanUrl = url.replace(/\/$/, "");
        setBackendUrlState(cleanUrl);
        localStorage.setItem("cgpo_backend_url", cleanUrl);
        // Trigger immediate check
        setTimeout(() => checkConnection(cleanUrl), 100);
    };

    const checkConnection = async (urlToCheck?: string) => {
        const target = urlToCheck || backendUrl;
        try {
            const res = await apiFetch(`${target}/health`, { signal: AbortSignal.timeout(3000) });
            if (res.ok) {
                setIsConnected(true);
                return true;
            }
        } catch (e) {
            console.warn("Backend check failed:", e);
        }
        setIsConnected(false);
        return false;
    };

    // Periodic heartbeat
    useEffect(() => {
        checkConnection();
        const interval = setInterval(() => checkConnection(), 60000); // Check every 60s to preserve cloud credits
        return () => clearInterval(interval);
    }, [backendUrl]);

    return (
        <BackendContext.Provider value={{ backendUrl, setBackendUrl, isConnected, checkConnection }}>
            {children}
            <BackendConnectionManager />
        </BackendContext.Provider>
    );
};

// Floating Manager Component
const BackendConnectionManager = () => {
    const { backendUrl, setBackendUrl, isConnected, checkConnection } = useBackend();
    const [isOpen, setIsOpen] = useState(false);
    const [tempUrl, setTempUrl] = useState(backendUrl);
    const [checking, setChecking] = useState(false);

    // Auto-open if disconnected for a while (optional, maybe too intrusive?)
    // For now, just show the badge

    const handleSave = async () => {
        setChecking(true);
        const success = await checkConnection(tempUrl);
        setChecking(false);

        if (success) {
            setBackendUrl(tempUrl);
            setIsOpen(false);
        } else {
            // Optional: Force save anyway?
            if (confirm("Could not connect to this URL. Save anyway?")) {
                setBackendUrl(tempUrl);
                setIsOpen(false);
            }
        }
    };

    return (
        <>
            <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
                <Card className="shadow-lg border-opacity-50 bg-card">
                    <CardContent className="p-2 flex items-center gap-2">
                        <Badge
                            variant={isConnected ? "default" : "destructive"}
                            className="cursor-pointer flex items-center gap-1.5"
                            onClick={() => { setTempUrl(backendUrl); setIsOpen(true); }}
                        >
                            {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                            {isConnected ? "Connected" : "Disconnected"}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setTempUrl(backendUrl); setIsOpen(true); }}>
                            <Settings className="h-3 w-3" />
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Backend Connection</DialogTitle>
                        <DialogDescription>
                            Enter the URL of your active Modal Cloud Backend.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Backend URL</label>
                            <Input
                                value={tempUrl}
                                onChange={(e) => setTempUrl(e.target.value)}
                                placeholder="https://user--cgpo-backend-serve.modal.run"
                            />
                            <p className="text-xs text-muted-foreground">
                                Get this from the output of the <b>modal deploy</b> command.
                            </p>
                        </div>

                        {!isConnected && (
                            <div className="text-xs bg-yellow-500/10 text-yellow-500 p-2 rounded flex gap-2">
                                <WifiOff className="h-4 w-4 shrink-0" />
                                <p>
                                    Ensure your Modal container is deployed and running.
                                    If you redeploy under a different workspace, update the URL here.
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => window.open(tempUrl + "/docs", "_blank")}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Test in Browser
                        </Button>
                        <Button onClick={handleSave} disabled={checking}>
                            {checking ? "Checking..." : "Save & Connect"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
