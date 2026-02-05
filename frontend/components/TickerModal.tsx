"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface TickerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentTickers: string[];
    onSubmit: (tickers: string[]) => void;
}

export default function TickerModal({
    open,
    onOpenChange,
    currentTickers,
    onSubmit,
}: TickerModalProps) {
    const [inputValue, setInputValue] = useState("");
    const [tickers, setTickers] = useState<string[]>([]);

    // Initialize with current tickers when modal opens
    useEffect(() => {
        if (open) {
            setTickers(currentTickers || []);
            setInputValue("");
        }
    }, [open, currentTickers]);

    const addTickersFromInput = () => {
        if (!inputValue.trim()) return;

        // Parse input - split by newlines, commas, or spaces
        const newTickers = inputValue
            .split(/[\n,\s]+/)
            .map(t => t.trim().toUpperCase())
            .filter(t => t.length > 0 && !tickers.includes(t));

        if (newTickers.length > 0) {
            setTickers([...tickers, ...newTickers]);
            setInputValue("");
        }
    };

    const removeTicker = (ticker: string) => {
        setTickers(tickers.filter(t => t !== ticker));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            addTickersFromInput();
        }
    };

    const handleSubmit = () => {
        // Add any remaining input before submitting
        let finalTickers = [...tickers];
        if (inputValue.trim()) {
            const newTickers = inputValue
                .split(/[\n,\s]+/)
                .map(t => t.trim().toUpperCase())
                .filter(t => t.length > 0 && !finalTickers.includes(t));
            finalTickers = [...finalTickers, ...newTickers];
        }

        if (finalTickers.length > 0) {
            onSubmit(finalTickers);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-card">
                <DialogHeader>
                    <DialogTitle>Custom Portfolio</DialogTitle>
                    <DialogDescription>
                        Enter stock tickers one per line, or separated by commas. Press Enter to add.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Current tickers as badges */}
                    {tickers.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-3 rounded-lg border bg-muted/50 min-h-[60px]">
                            {tickers.map((ticker) => (
                                <Badge
                                    key={ticker}
                                    variant="secondary"
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm"
                                >
                                    {ticker}
                                    <button
                                        onClick={() => removeTicker(ticker)}
                                        className="ml-1 rounded-full hover:bg-muted p-0.5"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Textarea for input */}
                    <div className="space-y-2">
                        <Textarea
                            placeholder="Enter tickers (e.g., AAPL, NVDA, MSFT)&#10;or one per line:&#10;AAPL&#10;NVDA&#10;MSFT"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="min-h-[120px] font-mono resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                            {tickers.length} ticker{tickers.length !== 1 ? 's' : ''} selected
                        </p>
                    </div>

                    {/* Quick add button */}
                    {inputValue.trim() && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addTickersFromInput}
                            className="w-full"
                        >
                            Add Tickers
                        </Button>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={tickers.length === 0 && !inputValue.trim()}>
                        Apply ({tickers.length + (inputValue.trim() ? '+' : '')} tickers)
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
