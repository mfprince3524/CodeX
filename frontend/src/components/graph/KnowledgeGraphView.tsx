import React, { useState, useCallback, useEffect } from 'react';
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
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';

interface KnowledgeGraphViewProps {
  graph: KnowledgeGraph;
  onSelectNodeDetail?: (nodeData: any) => void;
  onSelectEdgeDetail?: (edgeData: any) => void;
}

// Custom Node Renderers with Scientific styling
const CustomBiomedicalNode = ({ data, type }: { data: any; type: string }) => {
  const getIcon = () => {
    switch (type) {
      case 'disease':
        return <Dna className="w-3.5 h-3.5 text-rose-700" />;
      case 'compound':
        return <Pill className="w-3.5 h-3.5 text-scientific-primary" />;
      case 'target':
        return <Target className="w-3.5 h-3.5 text-teal-700" />;
      case 'mechanism':
        return <Zap className="w-3.5 h-3.5 text-purple-700" />;
      case 'publication':
        return <BookOpen className="w-3.5 h-3.5 text-emerald-700" />;
      case 'gene':
        return <Dna className="w-3.5 h-3.5 text-blue-700" />;
      case 'clinical_trial':
        return <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />;
      default:
        return <Building2 className="w-3.5 h-3.5 text-slate-700" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'disease': return 'border-rose-300 bg-rose-50/40';
      case 'compound': return 'border-scientific-sageDark bg-scientific-sage/30';
      case 'target': return 'border-teal-300 bg-teal-50/40';
      case 'mechanism': return 'border-purple-300 bg-purple-50/40';
      case 'publication': return 'border-emerald-300 bg-emerald-50/40';
      case 'gene': return 'border-blue-300 bg-blue-50/40';
      case 'clinical_trial': return 'border-amber-300 bg-amber-50/40';
      default: return 'border-scientific-border bg-white';
    }
  };

  return (
    <div className={`px-3 py-2 rounded-academic bg-white shadow-card border ${getBorderColor()} min-w-[170px] max-w-[220px] transition-all hover:scale-105 cursor-pointer`}>
      <Handle type="target" position={Position.Top} className="w-1.5 h-1.5 !bg-scientific-muted" />
      <div className="flex items-center gap-1.5 mb-1">
        {getIcon()}
        <span className="text-[9.5px] font-bold uppercase tracking-wider text-scientific-muted truncate">
          {data.category || type}
        </span>
      </div>
      <div className="text-xs font-semibold text-scientific-text truncate">
        {data.label}
      </div>
      {data.journal && (
        <div className="text-[10px] text-scientific-primary truncate mt-0.5">
          {data.journal} ({data.year})
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-1.5 h-1.5 !bg-scientific-muted" />
    </div>
  );
};

const nodeTypes = {
  disease: (props: any) => <CustomBiomedicalNode {...props} type="disease" />,
  compound: (props: any) => <CustomBiomedicalNode {...props} type="compound" />,
  target: (props: any) => <CustomBiomedicalNode {...props} type="target" />,
  mechanism: (props: any) => <CustomBiomedicalNode {...props} type="mechanism" />,
  publication: (props: any) => <CustomBiomedicalNode {...props} type="publication" />,
  gene: (props: any) => <CustomBiomedicalNode {...props} type="gene" />,
  clinical_trial: (props: any) => <CustomBiomedicalNode {...props} type="clinical_trial" />
};

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({
  graph,
  onSelectNodeDetail,
  onSelectEdgeDetail
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [selectedEdge, setSelectedEdge] = useState<any>(null);

  useEffect(() => {
    if (graph && graph.nodes) {
      setNodes(
        graph.nodes.map((n) => ({
          id: n.id,
          type: n.type,
          data: n.data,
          position: n.position
        }))
      );
    }
    if (graph && graph.edges) {
      setEdges(
        graph.edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label,
          animated: e.animated,
          style: e.style || { stroke: '#527A62', strokeWidth: 1.5 },
          labelStyle: { fontSize: 9.5, fill: '#737873', fontWeight: 600 }
        }))
      );
    }
  }, [graph, setNodes, setEdges]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node.data);
      setSelectedEdge(null);
      if (onSelectNodeDetail) onSelectNodeDetail(node.data);
    },
    [onSelectNodeDetail]
  );

  const handleEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      setSelectedEdge(edge);
      setSelectedNode(null);
      if (onSelectEdgeDetail) onSelectEdgeDetail(edge);
    },
    [onSelectEdgeDetail]
  );

  return (
    <div className="relative w-full h-[560px] rounded-academic border border-scientific-border bg-scientific-bg overflow-hidden shadow-subtle">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        fitView
      >
        <Background color="#E6E8E3" gap={18} size={1} />
        <Controls className="!bg-white !border-scientific-border !shadow-subtle !rounded-academic" />
        <MiniMap
          nodeStrokeWidth={2}
          className="!bg-white !border-scientific-border !rounded-academic !overflow-hidden"
          zoomable
          pannable
        />
      </ReactFlow>

      {/* Selected Node Details Floating Overlay */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 max-w-sm bg-white p-4 rounded-academic border border-scientific-border shadow-modal space-y-2 z-10 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-scientific-primary">
              Entity Property Inspector
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
          {selectedNode.category && (
            <span className="inline-block px-1.5 py-0.5 text-[9.5px] font-medium bg-scientific-sage rounded text-scientific-text">
              {selectedNode.category}
            </span>
          )}
          {selectedNode.description && (
            <p className="text-[11px] text-scientific-muted leading-relaxed">
              {selectedNode.description}
            </p>
          )}
          {selectedNode.smiles && (
            <div className="text-[10px] font-mono text-scientific-text bg-scientific-bg p-1.5 rounded border border-scientific-border truncate">
              SMILES: {selectedNode.smiles}
            </div>
          )}
          {selectedNode.pmid && (
            <a
              href={selectedNode.source_url || `https://pubmed.ncbi.nlm.nih.gov/${selectedNode.pmid}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10.5px] text-scientific-primary font-semibold hover:underline flex items-center gap-1 pt-1"
            >
              <span>View Source Paper (PMID: {selectedNode.pmid})</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {/* Selected Edge Details Floating Overlay */}
      {selectedEdge && (
        <div className="absolute bottom-4 left-4 max-w-sm bg-white p-4 rounded-academic border border-scientific-border shadow-modal space-y-2 z-10 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-scientific-primary">
              Relationship Evidence Link
            </span>
            <button
              onClick={() => setSelectedEdge(null)}
              className="text-[10px] text-scientific-muted hover:text-scientific-text font-bold"
            >
              Close
            </button>
          </div>
          <div className="text-xs font-semibold text-scientific-text">
            Relationship: {selectedEdge.label || 'Direct Association'}
          </div>
          <p className="text-[11px] text-scientific-muted">
            Connection between <strong className="text-scientific-text">{selectedEdge.source}</strong> and <strong className="text-scientific-text">{selectedEdge.target}</strong> verified through retrieved literature.
          </p>
        </div>
      )}
    </div>
  );
};
