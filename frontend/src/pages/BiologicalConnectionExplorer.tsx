import React, { useState, useEffect } from 'react';
import {
  Network,
  Search,
  Filter,
  Dna,
  Pill,
  Target,
  Zap,
  BookOpen,
  ShieldCheck,
  Building2,
  Sparkles,
  Info,
  Maximize2,
  RefreshCw
} from 'lucide-react';
import type { KnowledgeGraph } from '../types';
import { KnowledgeGraphView } from '../components/graph/KnowledgeGraphView';
import { api } from '../services/api';

interface BiologicalConnectionExplorerProps {
  onStartResearch: (query: string) => void;
  initialEntity?: string;
  onUpdateSearchQuery?: (query: string) => void;
}

export const BiologicalConnectionExplorer: React.FC<BiologicalConnectionExplorerProps> = ({
  onStartResearch,
  initialEntity,
  onUpdateSearchQuery
}) => {
  const [entityQuery, setEntityQuery] = useState(initialEntity || 'Metformin');
  const [graphData, setGraphData] = useState<KnowledgeGraph | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEntityInfo, setSelectedEntityInfo] = useState<any>(null);

  const sampleEntities = [
    'Metformin',
    'Imatinib',
    'Osimertinib',
    'Pembrolizumab',
    'AMPK',
    'EGFR',
    'BRCA1',
    "Alzheimer's Disease"
  ];

  const handleExplore = async (entity?: string) => {
    const term = entity !== undefined ? entity : entityQuery;
    if (!term.trim()) return;
    if (onUpdateSearchQuery) {
      onUpdateSearchQuery(term.trim());
    }
    setIsLoading(true);
    try {
      const res = await api.exploreGraph(term.trim());
      if (res && res.graph) {
        setGraphData(res.graph);
      }
    } catch (err) {
      console.error('Graph exploration failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const term = initialEntity && initialEntity.trim() ? initialEntity.trim() : 'Metformin';
    setEntityQuery(term);
    handleExplore(term);
  }, [initialEntity]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-scientific-primary font-semibold text-xs uppercase tracking-wider">
          <Network className="w-4 h-4" />
          <span>Biological Knowledge Graph</span>
        </div>
        <h1 className="text-2xl font-bold text-scientific-text tracking-tight">
          Biological Connection Explorer
        </h1>
        <p className="text-xs text-scientific-muted leading-relaxed max-w-2xl">
          Visualize multi-hop connections connecting diseases, genes, proteins, small molecules, biological targets, and supporting scientific publications.
        </p>
      </div>

      {/* Entity Search Bar */}
      <div className="bg-scientific-surface border border-scientific-border rounded-academic p-4 shadow-subtle space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExplore();
          }}
          className="flex flex-col sm:flex-row gap-2.5"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-scientific-muted" />
            <input
              type="text"
              value={entityQuery}
              onChange={(e) => setEntityQuery(e.target.value)}
              placeholder="Enter drug, gene (e.g. PRKAA1, EGFR), protein, or disease..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-academic border border-scientific-border bg-scientific-bg text-scientific-text focus:outline-none focus:ring-1 focus:ring-scientific-primary focus:border-scientific-primary"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2 bg-scientific-primary hover:bg-scientific-primaryHover text-white text-xs font-semibold rounded-academic transition-colors flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Network className="w-3.5 h-3.5" />
            )}
            <span>Explore Graph</span>
          </button>
        </form>

        {/* Example prompts */}
        <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
          <span className="text-scientific-muted font-medium">Quick Explore:</span>
          {sampleEntities.map((se) => (
            <button
              key={se}
              onClick={() => {
                setEntityQuery(se);
                handleExplore(se);
              }}
              className="px-2 py-0.5 bg-scientific-bg hover:bg-scientific-sage text-scientific-text rounded border border-scientific-border transition-colors truncate"
            >
              {se}
            </button>
          ))}
        </div>
      </div>

      {/* Legend and Graph View */}
      <div className="bg-scientific-surface border border-scientific-border rounded-academic p-5 shadow-subtle space-y-4">
        {/* Entity Legend */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-scientific-border text-[11px]">
          <span className="font-semibold text-scientific-text">Node Categories:</span>
          <div className="flex items-center gap-3 flex-wrap text-scientific-muted font-medium">
            <span className="flex items-center gap-1 text-rose-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              Disease / Condition
            </span>
            <span className="flex items-center gap-1 text-scientific-primary">
              <span className="w-2.5 h-2.5 rounded-full bg-scientific-primary"></span>
              Compound / Drug
            </span>
            <span className="flex items-center gap-1 text-teal-700">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
              Target Kinase / Receptor
            </span>
            <span className="flex items-center gap-1 text-blue-700">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              Gene (PRKAA1, EGFR)
            </span>
            <span className="flex items-center gap-1 text-purple-700">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
              Signaling Pathway
            </span>
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              Evidence Publication
            </span>
          </div>
        </div>

        {/* Graph Canvas */}
        {isLoading ? (
          <div className="h-[560px] flex items-center justify-center bg-scientific-bg rounded-academic border border-scientific-border text-xs text-scientific-muted">
            <div className="text-center space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-scientific-primary mx-auto" />
              <p>Constructing evidence-grounded biological network...</p>
            </div>
          </div>
        ) : graphData ? (
          <KnowledgeGraphView
            graph={graphData}
            onSelectNodeDetail={(node) => setSelectedEntityInfo(node)}
          />
        ) : null}

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-scientific-muted pt-2 border-t border-scientific-border">
          <span>Click any node or relationship edge to inspect underlying evidence citations and binding constants.</span>
          <button
            onClick={() => onStartResearch(`What biological pathways connect ${entityQuery}?`)}
            className="text-scientific-primary font-semibold hover:underline flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Synthesize Pathways</span>
          </button>
        </div>
      </div>
    </div>
  );
};
