import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { KnowledgeGraph } from '../../types';
import {
  Dna,
  Pill,
  Target,
  Zap,
  BookOpen,
  ShieldCheck,
  Building2,
  Info,
  Maximize2
} from 'lucide-react';

interface KnowledgeGraphViewProps {
  graph: KnowledgeGraph;
  onSelectNodeDetail?: (nodeData: any) => void;
}

// Custom Node Renderers with Scientific styling
const CustomBiomedicalNode = ({ data, type }: { data: any; type: string }) => {
  const getIcon = () => {
    switch (type) {
      case 'disease':
        return <Dna className="w-4 h-4 text-rose-500" />;
      case 'compound':
        return <Pill className="w-4 h-4 text-blue-500" />;
      case 'target':
        return <Target className="w-4 h-4 text-teal-500" />;
      case 'mechanism':
        return <Zap className="w-4 h-4 text-purple-500" />;
      case 'publication':
        return <BookOpen className="w-4 h-4 text-emerald-500" />;
      case 'clinical_trial':
        return <ShieldCheck className="w-4 h-4 text-amber-500" />;
      default:
        return <Building2 className="w-4 h-4 text-slate-500" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'disease': return 'border-rose-300 shadow-rose-500/10';
      case 'compound': return 'border-blue-300 shadow-blue-500/10';
      case 'target': return 'border-teal-300 shadow-teal-500/10';
      case 'mechanism': return 'border-purple-300 shadow-purple-500/10';
      case 'publication': return 'border-emerald-300 shadow-emerald-500/10';
      case 'clinical_trial': return 'border-amber-300 shadow-amber-500/10';
      default: return 'border-slate-300';
    }
  };

  return (
    <div className={`px-3.5 py-2.5 rounded-xl bg-white shadow-premium border ${getBorderColor()} min-w-[170px] max-w-[220px] transition-all hover:scale-105`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-slate-400" />
      <div className="flex items-center gap-2 mb-1">
        {getIcon()}
        <span className="text-[10px] font-bold uppercase tracking-wider text-scientific-muted truncate">
          {data.category || type}
        </span>
      </div>
      <div className="text-xs font-bold text-scientific-text truncate">
        {data.label}
      </div>
      {data.journal && (
        <div className="text-[10px] text-scientific-primary truncate mt-0.5">
          {data.journal} ({data.year})
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-slate-400" />
    </div>
  );
};

const nodeTypes = {
  disease: (props: any) => <CustomBiomedicalNode {...props} type="disease" />,
  compound: (props: any) => <CustomBiomedicalNode {...props} type="compound" />,
  target: (props: any) => <CustomBiomedicalNode {...props} type="target" />,
  mechanism: (props: any) => <CustomBiomedicalNode {...props} type="mechanism" />,
  publication: (props: any) => <CustomBiomedicalNode {...props} type="publication" />,
  clinical_trial: (props: any) => <CustomBiomedicalNode {...props} type="clinical_trial" />
};

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({
  graph,
  onSelectNodeDetail
}) => {
  // Map GraphNodes into React Flow Nodes
  const initialNodes: Node[] = graph.nodes.map((n) => ({
    id: n.id,
    type: n.type,
    data: n.data,
    position: n.position
  }));

  const initialEdges: Edge[] = graph.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    animated: e.animated,
    style: e.style || { stroke: '#94A3B8', strokeWidth: 1.5 },
    labelStyle: { fontSize: 10, fill: '#64748B', fontWeight: 600 }
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node.data);
      if (onSelectNodeDetail) onSelectNodeDetail(node.data);
    },
    [onSelectNodeDetail]
  );

  return (
    <div className="relative w-full h-[540px] rounded-2xl border border-scientific-border bg-gradient-to-br from-slate-50 via-white to-blue-50/20 overflow-hidden shadow-card">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
      >
        <Background color="#CBD5E1" gap={18} size={1} />
        <Controls className="!bg-white !border-slate-200 !shadow-sm !rounded-xl" />
        <MiniMap
          nodeStrokeWidth={3}
          className="!bg-white !border-slate-200 !rounded-xl !overflow-hidden"
          zoomable
          pannable
        />
      </ReactFlow>

      {/* Selected Node Details Floating Overlay */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 max-w-sm glass-card p-4 rounded-xl border border-scientific-border shadow-lg animate-in fade-in space-y-2 z-10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-scientific-primary">
              Entity Inspector
            </span>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-[10px] text-scientific-muted hover:text-scientific-text font-bold"
            >
              Close
            </button>
          </div>
          <h4 className="text-xs font-bold text-scientific-text">
            {selectedNode.label}
          </h4>
          {selectedNode.description && (
            <p className="text-[11px] text-scientific-muted leading-relaxed">
              {selectedNode.description}
            </p>
          )}
          {selectedNode.smiles && (
            <div className="text-[10px] font-mono text-slate-600 bg-slate-100 p-1.5 rounded truncate">
              SMILES: {selectedNode.smiles}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
