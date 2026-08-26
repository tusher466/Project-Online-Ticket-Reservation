import React, { useState } from 'react';
import { TicketNode, Station, Ticket } from '../../types';
import { GitFork, Search, Info, CheckCircle2 } from 'lucide-react';

interface BstVisualizerWidgetProps {
  root: TicketNode | null;
  stations: Station[];
  highlightId?: number | null;
  onSelectTicket?: (ticket: Ticket) => void;
}

interface VisualNode {
  node: TicketNode;
  x: number;
  y: number;
  left?: VisualNode;
  right?: VisualNode;
}

export const BstVisualizerWidget: React.FC<BstVisualizerWidgetProps> = ({
  root,
  stations,
  highlightId = null,
  onSelectTicket,
}) => {
  const [selectedNode, setSelectedNode] = useState<TicketNode | null>(null);

  // Layout the BST into a hierarchical 2D tree
  const buildLayout = (
    curr: TicketNode | null,
    depth: number,
    leftBound: number,
    rightBound: number
  ): VisualNode | null => {
    if (!curr) return null;
    const x = (leftBound + rightBound) / 2;
    const y = 50 + depth * 70;

    const leftNode = buildLayout(curr.left, depth + 1, leftBound, x);
    const rightNode = buildLayout(curr.right, depth + 1, x, rightBound);

    return {
      node: curr,
      x,
      y,
      left: leftNode || undefined,
      right: rightNode || undefined,
    };
  };

  const visualTree = buildLayout(root, 0, 20, 680);

  // Flatten edges for rendering lines
  const getEdges = (vNode: VisualNode | null): { x1: number; y1: number; x2: number; y2: number }[] => {
    if (!vNode) return [];
    const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
    if (vNode.left) {
      edges.push({ x1: vNode.x, y1: vNode.y, x2: vNode.left.x, y2: vNode.left.y });
      edges.push(...getEdges(vNode.left));
    }
    if (vNode.right) {
      edges.push({ x1: vNode.x, y1: vNode.y, x2: vNode.right.x, y2: vNode.right.y });
      edges.push(...getEdges(vNode.right));
    }
    return edges;
  };

  // Flatten nodes for rendering circles
  const getNodes = (vNode: VisualNode | null): VisualNode[] => {
    if (!vNode) return [];
    return [vNode, ...getNodes(vNode.left || null), ...getNodes(vNode.right || null)];
  };

  const edges = visualTree ? getEdges(visualTree) : [];
  const nodes = visualTree ? getNodes(visualTree) : [];

  return (
    <div className="flex flex-col h-full bg-[#161B22] text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#0D1117]/80 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <GitFork className="w-3.5 h-3.5 text-emerald-400 rotate-180" />
          <span className="font-semibold text-slate-300">Confirmed Bookings BST Index</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">Key: ticketId • In-Order O(log N)</span>
      </div>

      {/* Canvas Area */}
      <div className="relative flex-1 min-h-[240px] bg-[#0A0C10] flex items-center justify-center p-2 overflow-auto">
        {!root ? (
          <div className="text-center text-xs text-slate-500 font-mono flex flex-col items-center gap-2">
            <Info className="w-5 h-5 text-slate-600" />
            <span>BST is currently empty. Book tickets to populate nodes.</span>
          </div>
        ) : (
          <svg viewBox="0 0 700 320" className="w-full h-full max-h-[300px] select-none">
            {/* Tree Branch Edges */}
            {edges.map((edge, i) => (
              <line
                key={`tree-edge-${i}`}
                x1={edge.x1}
                y1={edge.y1}
                x2={edge.x2}
                y2={edge.y2}
                stroke="#21262d"
                strokeWidth={2}
                strokeLinecap="round"
              />
            ))}

            {/* Tree Nodes */}
            {nodes.map((vn) => {
              const isHighlighted = highlightId === vn.node.ticketId;
              const isSelected = selectedNode?.ticketId === vn.node.ticketId;

              return (
                <g
                  key={`tree-node-${vn.node.ticketId}`}
                  transform={`translate(${vn.x}, ${vn.y})`}
                  onClick={() => {
                    setSelectedNode(vn.node);
                    if (onSelectTicket) {
                      onSelectTicket({
                        ticketId: vn.node.ticketId,
                        name: vn.node.name,
                        source: vn.node.source,
                        dest: vn.node.dest,
                        fare: vn.node.fare,
                        bookedAt: Date.now(),
                      });
                    }
                  }}
                  className="cursor-pointer group"
                >
                  {/* Glow circle if highlighted/selected */}
                  {(isHighlighted || isSelected) && (
                    <circle
                      r={24}
                      fill="none"
                      stroke={isHighlighted ? '#34d399' : '#38bdf8'}
                      strokeWidth={2}
                      className="animate-ping"
                      strokeOpacity={0.4}
                    />
                  )}

                  {/* Primary Node Circle */}
                  <circle
                    r={18}
                    fill={isHighlighted ? '#065f46' : isSelected ? '#0369a1' : '#161B22'}
                    stroke={isHighlighted ? '#34d399' : isSelected ? '#38bdf8' : '#30363d'}
                    strokeWidth={2}
                    className="transition-transform duration-150 group-hover:scale-110"
                  />

                  {/* Node ID */}
                  <text
                    x={0}
                    y={4}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={11}
                    fontFamily="monospace"
                    fontWeight={700}
                    pointerEvents="none"
                  >
                    #{vn.node.ticketId}
                  </text>

                  {/* Passenger Label Pill */}
                  <g transform="translate(0, 26)">
                    <rect
                      x={-vn.node.name.length * 3.5 - 6}
                      y={-8}
                      width={vn.node.name.length * 7 + 12}
                      height={16}
                      rx={3}
                      fill="#0D1117"
                      stroke="#30363d"
                      strokeWidth={0.8}
                    />
                    <text
                      x={0}
                      y={4}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize={9}
                      fontFamily="sans-serif"
                      fontWeight={600}
                      pointerEvents="none"
                    >
                      {vn.node.name}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Selected Node Details Footer */}
      {selectedNode && (
        <div className="px-3.5 py-2 bg-[#0D1117] border-t border-slate-800 text-xs flex items-center justify-between font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-emerald-400 font-bold">Node #{selectedNode.ticketId}:</span>
            <span>{selectedNode.name}</span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-300">
              {stations[selectedNode.source]?.name} → {stations[selectedNode.dest]?.name}
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-300">৳{selectedNode.fare}</span>
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            className="text-[10px] text-slate-400 hover:text-white"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};
