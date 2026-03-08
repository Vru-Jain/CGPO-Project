"use client";

import { useState, useEffect, useCallback } from "react";

const TUTORIAL_STORAGE_KEY = "cgpo_tutorial_completed";

export function useTutorial() {
    const [showTutorial, setShowTutorial] = useState(false);
    const [tutorialStep, setTutorialStep] = useState(0);

    useEffect(() => {
        // Show tutorial on first visit
        const completed = localStorage.getItem(TUTORIAL_STORAGE_KEY);
        if (!completed) {
            setShowTutorial(true);
        }
    }, []);

    const completeTutorial = useCallback(() => {
        localStorage.setItem(TUTORIAL_STORAGE_KEY, "true");
        setShowTutorial(false);
        setTutorialStep(0);
    }, []);

    const replayTutorial = useCallback(() => {
        setTutorialStep(0);
        setShowTutorial(true);
    }, []);

    const nextStep = useCallback(() => {
        setTutorialStep((prev) => prev + 1);
    }, []);

    const prevStep = useCallback(() => {
        setTutorialStep((prev) => Math.max(0, prev - 1));
    }, []);

    return {
        showTutorial,
        tutorialStep,
        completeTutorial,
        replayTutorial,
        nextStep,
        prevStep,
    };
}
