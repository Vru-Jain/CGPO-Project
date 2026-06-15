"use client";

import dynamic from 'next/dynamic';
import { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Network } from "lucide-react";

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
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [atRiskNodes, setAtRiskNodes] = useState<Set<string>>(new Set());

    // Memoize graph to prevent flicker
    const memoData = useMemo(() => {
        return {
            // Use a constant node size so bubble size is not affected by return
            nodes: data.nodes.map(n => ({ ...n, val: 10 })), // Uniform size for all nodes
            links: data.edges.map(e => ({ source: e.source, target: e.target }))
        }
    }, [data]);

    // Calculate at-risk nodes when selection changes
    useEffect(() => {
        if (!selectedNode) {
            setAtRiskNodes(new Set());
            return;
        }

        // Find all nodes directly connected to the selected node
        const connected = new Set<string>();
        memoData.links.forEach((link: any) => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;

            if (sourceId === selectedNode) {
                connected.add(targetId);
            }
            if (targetId === selectedNode) {
                connected.add(sourceId);
            }
        });
        setAtRiskNodes(connected);
    }, [selectedNode, memoData.links]);

    // Custom node rendering — no per-frame gradient allocation
    const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        if (node.x === undefined || node.y === undefined || !isFinite(node.x) || !isFinite(node.y)) {
            return;
        }

        const label = node.id;
        const fontSize = 12 / globalScale;
        const nodeSize = node.val || 8;

        let color = "#00F0FF";
        if (node.return > 0.005) color = "#33FF57";
        if (node.return < -0.005) color = "#FF3333";

        const isSelected = node.id === selectedNode;
        const isAtRisk = atRiskNodes.has(node.id);

        if (isSelected) {
            color = "#FFD700";
        } else if (isAtRisk) {
            color = "#FF6B6B";
        }

        // Lightweight glow — single semi-transparent circle instead of RadialGradient
        const glowSize = isSelected || isAtRisk ? nodeSize * 2.5 : nodeSize * 1.8;
        ctx.beginPath();
        ctx.arc(node.x, node.y, glowSize, 0, 2 * Math.PI);
        ctx.fillStyle = color + "22";
        ctx.fill();

        // Node core
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.strokeStyle = isSelected ? "#FFD700" : (isAtRisk ? "#FF0000" : "#fff");
        ctx.lineWidth = isSelected || isAtRisk ? 2 : 0.5;
        ctx.stroke();

        // Label
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText(label, node.x, node.y + nodeSize + fontSize);

        if (isAtRisk) {
            ctx.font = `bold ${fontSize * 0.7}px sans-serif`;
            ctx.fillStyle = '#FF6B6B';
            ctx.fillText("AT RISK", node.x, node.y - nodeSize - fontSize * 0.5);
        }
    }, [selectedNode, atRiskNodes]);

    // Handle node click
    const handleNodeClick = useCallback((node: any) => {
        if (selectedNode === node.id) {
            setSelectedNode(null); // Deselect if clicking same node
        } else {
            setSelectedNode(node.id);
        }
    }, [selectedNode]);

    // Configure d3 forces after graph mounts
    useEffect(() => {
        if (fgRef.current) {
            // Increase link distance for better spacing
            fgRef.current.d3Force('link')?.distance(150);
            // Increase repulsion for better separation
            fgRef.current.d3Force('charge')?.strength(-400);
            // Center force
            fgRef.current.d3Force('center')?.strength(0.1);
        }
    }, [memoData]);

    return (
        <div className="neo-card h-[450px] relative overflow-hidden flex flex-col">
            <div className="absolute top-3 left-4 z-10 pointer-events-none">
                <h3 className="text-secondary border-b border-border pb-1 mb-1 font-semibold tracking-wider text-xs">CORRELATION NETWORK</h3>
                <p className="text-textDim text-xs">
                    {data.nodes.length} assets · {data.edges.length} correlations
                    {selectedNode && <span className="text-yellow-400 ml-2">· {selectedNode} selected</span>}
                </p>
            </div>

            {/* Risk Legend - pinned to far right, vertically centered to avoid header overlap */}
            {selectedNode && atRiskNodes.size > 0 && (
                <div className="absolute top-1/2 right-4 -translate-y-1/2 transform z-10 bg-black/80 border border-red-500/50 rounded px-3 py-2 max-w-xs">
                    <p className="text-red-400 text-xs font-bold mb-1">Correlated Assets</p>
                    <p className="text-xs text-gray-300">
                        Moves with <span className="text-yellow-400">{selectedNode}</span>:
                    </p>
                    <p className="text-xs text-red-400 font-mono mt-1">
                        {Array.from(atRiskNodes).join(", ")}
                    </p>
                </div>
            )}

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
                        onNodeClick={handleNodeClick}
                        linkColor={(link: any) => {
                            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                            const targetId = typeof link.target === 'object' ? link.target.id : link.target;

                            // Highlight links connected to selected node
                            if (sourceId === selectedNode || targetId === selectedNode) {
                                return "#FF6B6B99";
                            }
                            return "#00F0FF33";
                        }}
                        linkWidth={(link: any) => {
                            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                            const targetId = typeof link.target === 'object' ? link.target.id : link.target;

                            if (sourceId === selectedNode || targetId === selectedNode) {
                                return 4;
                            }
                            return 2;
                        }}
                        backgroundColor="transparent"
                        d3AlphaDecay={0.05}
                        d3VelocityDecay={0.4}
                        warmupTicks={20}
                        cooldownTicks={80}
                        enableNodeDrag={true}
                        enableZoomInteraction={true}
                        enablePanInteraction={true}
                    />
                )}
            </div>
        </div>
    );
}
