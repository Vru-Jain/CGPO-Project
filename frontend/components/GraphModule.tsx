"use client";

import dynamic from 'next/dynamic';
import { useMemo, useRef, useCallback } from 'react';

// Dynamic import to avoid SSR issues with canvas
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center text-textDim">Loading Graph Core...</div>
});

interface GraphData {
    nodes: any[];
    edges: any[];
}

export default function GraphModule({ data }: { data: GraphData }) {
    const fgRef = useRef<any>(null);

    // Memoize graph to prevent flicker
    const memoData = useMemo(() => {
        return {
            nodes: data.nodes.map(n => ({ ...n, val: Math.abs(n.return) * 500 + 5 })), // Size by return magnitude
            links: data.edges.map(e => ({ source: e.source, target: e.target }))
        }
    }, [data]);

    // Custom node rendering for futuristic look
    const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        // Guard: Skip if node position not yet computed by physics
        if (node.x === undefined || node.y === undefined || !isFinite(node.x) || !isFinite(node.y)) {
            return;
        }

        const label = node.id;
        const fontSize = 12 / globalScale;
        const nodeSize = node.val || 8;

        // Determine color based on return
        let color = "#00F0FF"; // Default cyan
        if (node.return > 0.005) color = "#33FF57"; // Green for positive
        if (node.return < -0.005) color = "#FF3333"; // Red for negative

        // Glow effect
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, nodeSize * 2);

        gradient.addColorStop(0, color);
        gradient.addColorStop(0.5, color + "44");
        gradient.addColorStop(1, "transparent");

        // Draw glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeSize * 2, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw node core
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Draw label
        ctx.font = `bold ${fontSize}px 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText(label, node.x, node.y + nodeSize + fontSize);
    }, []);

    // Continuous physics for "alive" feel
    const handleEngineStop = useCallback(() => {
        if (fgRef.current) {
            // Reheat simulation slightly for subtle movement
            fgRef.current.d3ReheatSimulation();
        }
    }, []);

    return (
        <div className="neo-card h-[450px] relative overflow-hidden flex flex-col">
            <div className="absolute top-3 left-4 z-10 pointer-events-none">
                <h3 className="text-secondary border-b border-border pb-1 mb-1 font-semibold tracking-wider">GL-STN SYSTEMIC RISK MAP</h3>
                <p className="text-textDim text-xs">Dynamic Topology // {data.nodes.length} Assets // {data.edges.length} Correlations</p>
            </div>

            <div className="flex-1 w-full">
                {data.nodes.length > 0 && (
                    <ForceGraph2D
                        ref={fgRef}
                        graphData={memoData}
                        nodeCanvasObject={paintNode}
                        nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
                            ctx.beginPath();
                            ctx.arc(node.x, node.y, (node.val || 8) * 1.5, 0, 2 * Math.PI);
                            ctx.fillStyle = color;
                            ctx.fill();
                        }}
                        linkColor={() => "#00F0FF33"}
                        linkWidth={2}
                        linkDirectionalParticles={2}
                        linkDirectionalParticleSpeed={0.005}
                        linkDirectionalParticleWidth={2}
                        linkDirectionalParticleColor={() => "#00F0FF"}
                        backgroundColor="transparent"
                        d3AlphaDecay={0.01}
                        d3VelocityDecay={0.3}
                        warmupTicks={50}
                        cooldownTicks={500}
                        onEngineStop={handleEngineStop}
                        enableNodeDrag={true}
                        enableZoomInteraction={true}
                        enablePanInteraction={true}
                    />
                )}
            </div>
        </div>
    );
}
