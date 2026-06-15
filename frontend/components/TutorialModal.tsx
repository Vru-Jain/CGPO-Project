"use client";

import { X, ChevronRight, ChevronLeft, BrainCircuit, Network, Terminal, BarChart3, Sparkles } from "lucide-react";

interface TutorialModalProps {
    step: number;
    onNext: () => void;
    onPrev: () => void;
    onClose: () => void;
}

const STEPS = [
    {
        icon: <Network className="h-8 w-8 text-blue-400" />,
        title: "Neural Asset Graph",
        description:
            "This interactive graph shows how your portfolio stocks are connected. Each node is a stock, and edges represent correlation strength. Thicker edges mean stronger correlation. Green nodes have positive recent returns; red nodes have negative returns.",
    },
    {
        icon: <Terminal className="h-8 w-8 text-emerald-400" />,
        title: "Execution Log",
        description:
            "The execution log shows real-time system events — API calls, training progress, and inference results. It helps you understand what the AI agent is doing behind the scenes.",
    },
    {
        icon: <Sparkles className="h-8 w-8 text-amber-400" />,
        title: "Agent Insights (XAI)",
        description:
            "This panel reveals the agent's reasoning. It shows which stocks the RL agent weighted highest (Top Robust Choices) and lowest (Reductions), along with a short explanation of why.",
    },
    {
        icon: <BarChart3 className="h-8 w-8 text-purple-400" />,
        title: "Market Benchmark",
        description:
            "Compare your AI-optimized portfolio against real equity benchmarks like the S&P 500 (US) or Nifty 50 (India). The chart automatically picks the right benchmark based on your portfolio's region.",
    },
];

export default function TutorialModal({ step, onNext, onPrev, onClose }: TutorialModalProps) {
    const currentStep = STEPS[step];
    const isLast = step === STEPS.length - 1;
    const isFirst = step === 0;

    if (!currentStep) {
        onClose();
        return null;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-[90vw] max-w-lg mx-auto animate-in zoom-in-95 fade-in duration-300">
                <div className="rounded-2xl border border-border/50 bg-card shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 pt-5 pb-3">
                        <div className="flex items-center gap-2">
                            <BrainCircuit className="h-5 w-5 text-primary" />
                            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                Dashboard Guide
                            </span>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-accent"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-6 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                            {currentStep.icon}
                        </div>
                        <h2 className="text-xl font-bold mb-2">{currentStep.title}</h2>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
                            {currentStep.description}
                        </p>
                    </div>

                    {/* Step Indicator */}
                    <div className="flex justify-center gap-1.5 pb-4">
                        {STEPS.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    i === step
                                        ? "w-6 bg-primary"
                                        : "w-1.5 bg-muted-foreground/30"
                                }`}
                            />
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-6 pb-5">
                        <button
                            onClick={isFirst ? onClose : onPrev}
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-accent"
                        >
                            {isFirst ? (
                                "Skip"
                            ) : (
                                <>
                                    <ChevronLeft className="h-4 w-4" />
                                    Back
                                </>
                            )}
                        </button>
                        <button
                            onClick={isLast ? onClose : onNext}
                            className="flex items-center gap-1 text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            {isLast ? (
                                "Get Started"
                            ) : (
                                <>
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
