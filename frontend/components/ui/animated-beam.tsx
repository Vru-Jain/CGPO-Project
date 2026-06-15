"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";

interface AnimatedBeamProps {
  className?: string;
  containerRef: React.RefObject<HTMLElement | null>;
  fromRef: React.RefObject<HTMLElement | null>;
  toRef: React.RefObject<HTMLElement | null>;
  curvature?: number;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
}

export function AnimatedBeam({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 4,
  delay = 0,
  pathColor = "hsl(217 91% 60% / 0.15)",
  pathWidth = 1.5,
  pathOpacity = 0.12,
  gradientStartColor = "hsl(217, 91%, 65%)",
  gradientStopColor = "hsl(195, 91%, 70%)",
}: AnimatedBeamProps) {
  const id = useId();
  const [path, setPath] = useState("");
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const update = () => {
      const c = containerRef.current;
      const a = fromRef.current;
      const b = toRef.current;
      if (!c || !a || !b) return;
      const cR = c.getBoundingClientRect();
      const aR = a.getBoundingClientRect();
      const bR = b.getBoundingClientRect();
      setSize({ w: cR.width, h: cR.height });
      const sx = aR.left - cR.left + aR.width / 2;
      const sy = aR.top - cR.top + aR.height / 2;
      const ex = bR.left - cR.left + bR.width / 2;
      const ey = bR.top - cR.top + bR.height / 2;
      const mx = (sx + ex) / 2;
      const my = (sy + ey) / 2 - curvature;
      setPath(`M ${sx},${sy} Q ${mx},${my} ${ex},${ey}`);
    };

    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    update();
    return () => ro.disconnect();
  }, [containerRef, fromRef, toRef, curvature]);

  const gradientCoords = reverse
    ? { x1: ["90%", "-10%"], x2: ["100%", "0%"] }
    : { x1: ["-10%", "110%"], x2: ["0%", "100%"] };

  return (
    <svg
      width={size.w}
      height={size.h}
      fill="none"
      className={cn("pointer-events-none absolute inset-0 z-0 overflow-visible", className)}
    >
      <path d={path} stroke={pathColor} strokeWidth={pathWidth} strokeOpacity={pathOpacity} strokeLinecap="round" />
      <path d={path} strokeWidth={pathWidth + 0.5} stroke={`url(#${id})`} strokeLinecap="round" />
      <defs>
        <motion.linearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          initial={{ x1: "0%", x2: "0%", y1: "0%", y2: "0%" }}
          animate={{ ...gradientCoords, y1: ["0%", "0%"], y2: ["0%", "0%"] }}
          transition={{ delay, duration, ease: [0.16, 1, 0.3, 1], repeat: Infinity }}
        >
          <stop stopColor={gradientStartColor} stopOpacity="0" />
          <stop stopColor={gradientStartColor} />
          <stop offset="32.5%" stopColor={gradientStopColor} />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </svg>
  );
}
