"use client";
import { motion } from "framer-motion";

export function AnimatedHeroGraph() {
  const blue = "#3b7bff";

  const mainEdges = [
    [160,160,55,55],[160,160,265,55],[160,160,55,265],[160,160,265,265],
    [160,160,160,28],[160,160,292,160],[160,160,160,292],[160,160,28,160],
  ] as number[][];

  const secondaryEdges = [
    [55,55,160,28],[265,55,160,28],[55,55,28,160],[55,265,28,160],
    [265,55,292,160],[265,265,292,160],[55,265,160,292],[265,265,160,292],
    [55,55,265,55],[55,265,265,265],
  ] as number[][];

  const outerRing = [[160,28],[292,160],[160,292],[28,160]] as number[][];
  const corners = [[55,55],[265,55],[55,265],[265,265]] as number[][];

  return (
    <div className="relative w-full max-w-[380px] aspect-square select-none pointer-events-none">
      <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
        <defs>
          <radialGradient id="hero-cg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={blue} stopOpacity="0.18" />
            <stop offset="100%" stopColor={blue} stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="160" cy="160" r="64" fill="url(#hero-cg)" />

        {/* Main edges — fade in sequentially */}
        {mainEdges.map(([x1,y1,x2,y2], i) => (
          <motion.line
            key={`me-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={blue} strokeWidth="1"
            initial={{ strokeOpacity: 0 }}
            animate={{ strokeOpacity: 0.2 }}
            transition={{ duration: 0.7, delay: 0.3 + i * 0.07, ease: "easeOut" }}
          />
        ))}

        {/* Secondary edges — fade in later */}
        {secondaryEdges.map(([x1,y1,x2,y2], i) => (
          <motion.line
            key={`se-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={blue} strokeWidth="0.75"
            initial={{ strokeOpacity: 0 }}
            animate={{ strokeOpacity: 0.07 }}
            transition={{ duration: 0.6, delay: 1.0 + i * 0.06, ease: "easeOut" }}
          />
        ))}

        {/* Corner nodes */}
        {corners.map(([cx,cy], i) => (
          <motion.circle
            key={`cn-${i}`} cx={cx} cy={cy} r="7"
            fill={blue} stroke={blue} strokeWidth="1.5"
            initial={{ fillOpacity: 0, strokeOpacity: 0 }}
            animate={{ fillOpacity: 0.12, strokeOpacity: 0.3 }}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease: "easeOut" }}
          />
        ))}

        {/* Outer ring nodes */}
        {outerRing.map(([cx,cy], i) => (
          <motion.circle
            key={`or-${i}`} cx={cx} cy={cy} r="4"
            fill={blue} stroke={blue} strokeWidth="1"
            initial={{ fillOpacity: 0, strokeOpacity: 0 }}
            animate={{ fillOpacity: 0.4, strokeOpacity: 0.55 }}
            transition={{ duration: 0.5, delay: 0.8 + i * 0.1, type: "spring", stiffness: 200, damping: 20 }}
          />
        ))}

        {/* Dashed orbit — slowly rotates */}
        <motion.circle
          cx="160" cy="160" r="22" fill="none"
          stroke={blue} strokeOpacity="0.25" strokeWidth="1" strokeDasharray="4 5"
          style={{ transformOrigin: "160px 160px" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        />

        {/* Pulse ring — expands and fades */}
        <motion.circle
          cx="160" cy="160" r="13" fill="none"
          stroke={blue} strokeWidth="1"
          style={{ transformOrigin: "160px 160px" }}
          initial={{ r: 13, strokeOpacity: 0.5 }}
          animate={{ r: [13, 30, 13], strokeOpacity: [0.45, 0, 0.45] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1 }}
        />

        {/* Center node — subtle pulse */}
        <motion.circle
          cx="160" cy="160" r="13"
          fill={blue}
          style={{ transformOrigin: "160px 160px" }}
          initial={{ fillOpacity: 0 }}
          animate={{ fillOpacity: [0.9, 0.72, 0.9] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5, times: [0, 0.5, 1] }}
        />
      </svg>
    </div>
  );
}
