"use client";
import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";

export function Spotlight({ className = "" }: { className?: string }) {
  const mouseX = useMotionValue(-500);
  const mouseY = useMotionValue(-500);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20, restDelta: 0.001 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20, restDelta: 0.001 });
  const background = useMotionTemplate`radial-gradient(650px circle at ${springX}px ${springY}px, rgba(240,160,32,0.06), transparent 40%)`;

  useEffect(() => {
    const handler = (e: MouseEvent) => { mouseX.set(e.clientX); mouseY.set(e.clientY); };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className={`pointer-events-none fixed inset-0 z-30 ${className}`}
      style={{ background }}
    />
  );
}
