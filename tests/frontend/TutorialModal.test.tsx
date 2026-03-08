/**
 * Basic smoke test for the TutorialModal component.
 *
 * This is a lightweight check that confirms:
 *  1. The modal renders without crashing.
 *  2. The step indicator dots are present.
 *  3. The "Next" and "Skip" buttons are clickable.
 *
 * In a full CI environment you would add:
 *   npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
 *
 * Then run:
 *   npx jest tests/frontend/TutorialModal.test.tsx
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// We dynamically import because the component lives in the Next.js tree
// and uses `"use client"`.  For this smoke test we treat it as a plain
// React component.
import TutorialModal from "../../frontend/components/TutorialModal";

describe("TutorialModal", () => {
    const onNext = jest.fn();
    const onPrev = jest.fn();
    const onClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the first step title", () => {
        render(
            <TutorialModal step={0} onNext={onNext} onPrev={onPrev} onClose={onClose} />
        );
        expect(screen.getByText("Neural Asset Graph")).toBeInTheDocument();
    });

    it("renders the correct number of step indicator dots", () => {
        const { container } = render(
            <TutorialModal step={0} onNext={onNext} onPrev={onPrev} onClose={onClose} />
        );
        // 4 steps = 4 dots
        const dots = container.querySelectorAll(".rounded-full");
        expect(dots.length).toBe(4);
    });

    it("calls onNext when the Next button is clicked", () => {
        render(
            <TutorialModal step={0} onNext={onNext} onPrev={onPrev} onClose={onClose} />
        );
        fireEvent.click(screen.getByText("Next"));
        expect(onNext).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when Skip is clicked on the first step", () => {
        render(
            <TutorialModal step={0} onNext={onNext} onPrev={onPrev} onClose={onClose} />
        );
        fireEvent.click(screen.getByText("Skip"));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("renders 'Get Started' on the last step", () => {
        render(
            <TutorialModal step={3} onNext={onNext} onPrev={onPrev} onClose={onClose} />
        );
        expect(screen.getByText("Get Started")).toBeInTheDocument();
    });

    it("calls onClose when 'Get Started' is clicked on the last step", () => {
        render(
            <TutorialModal step={3} onNext={onNext} onPrev={onPrev} onClose={onClose} />
        );
        fireEvent.click(screen.getByText("Get Started"));
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
