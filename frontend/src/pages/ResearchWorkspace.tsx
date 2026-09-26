import React, { useState, useEffect } from 'react';
import {
  ResearchQueryResult,
  CitationItem,
  ClarificationResponse
} from '../types';
import { api } from '../services/api';
import { ClarificationModal } from '../components/clarification/ClarificationModal';
import { CitationDrawer } from '../components/evidence/CitationDrawer';
import { ConfidenceGauge } from '../components/common/ConfidenceGauge';
import { ConflictMatrix } from '../components/common/ConflictMatrix';
import { KnowledgeGraphView } from '../components/graph/KnowledgeGraphView';
import { ResearchTimelineView } from '../components/timeline/ResearchTimelineView';
import { MoleculeViewer } from '../components/molecule/MoleculeViewer';
import {
  Search,
  Sparkles,
  Layers,
  Activity,
  FileCheck2,
  GitFork,
  Clock,
  Pill,
  ShieldCheck,
  Bookmark,
  Download,
  Share2,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Info,
  RefreshCw,
  Compass
} from 'lucide-react';

interface ResearchWorkspaceProps {
  initialQuery?: string;
  onNavigate: (tab: string) => void;
}

export const ResearchWorkspace: React.FC<ResearchWorkspaceProps> = ({
  initialQuery = "What research exists on metformin and Alzheimer's disease?",
  onNavigate
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<number>(0);
  const [result, setResult] = useState<ResearchQueryResult | null>(null);

  // Modals & Drawers
  const [isClarificationOpen, setIsClarificationOpen] = useState(false);
  const [clarificationData, setClarificationData] = useState<ClarificationResponse | null>(null);
  const [selectedCitation, setSelectedCitation] = useState<CitationItem | null>(null);
  const [isCitationDrawerOpen, setIsCitationDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'synthesis' | 'evidence' | 'graph' | 'timeline' | 'compounds' | 'trials'>('synthesis');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Auto-run initial query on mount
  useEffect(() => {
    if (initialQuery) {
      handleInitiateResearch(initialQuery);
    }
  }, [initialQuery]);

  const handleInitiateResearch = async (qText: string) => {
    if (!qText.trim()) return;
    setQuery(qText);
    setIsLoading(true);
    setPipelineStep(1); // Intent understanding

    try {
      // Step 1: Check clarification
      const clarifyRes = await api.clarifyQuery(qText);
      setClarificationData(clarifyRes);

      if (clarifyRes.needs_clarification && !result) {
        setIsLoading(false);
        setIsClarificationOpen(true);
        return;
      }

      // If no clarification needed or already clarified, run research
      await executeResearchPlan({
        query: qText,
        focus: 'All Dimensions',
        timeframe: 'All',
        sources: ['PubMed', 'ChEMBL', 'ClinicalTrials.gov', 'DrugBank']
      });
    } catch (err) {
      console.error('Error initiating research:', err);
      setIsLoading(false);
    }
  };

  const executeResearchPlan = async (plan: {
    query?: string;
    focus: string;
    timeframe: string;
    evidence_type?: string;
    sources: string[];
  }) => {
    setIsClarificationOpen(false);
    setIsLoading(true);

    const q = plan.query || query;
    setPipelineStep(2); // Multi-source Retrieval

    setTimeout(() => setPipelineStep(3), 300); // Normalization & Conflict Detection
    setTimeout(() => setPipelineStep(4), 600); // Grounded AI Synthesis & Citations

    try {
      const res = await api.runResearchQuery({
        query: q,
        focus: plan.focus,
        timeframe: plan.timeframe,
        evidence_type: plan.evidence_type || 'All',
        sources: plan.sources
      });

      setResult(res);
      setPipelineStep(5); // Complete
    } catch (err) {
      console.error('Execution failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCitationByMarker = (marker: string) => {
    if (!result) return;
    const cleanMarker = marker.trim();
    const cite = result.citations.find((c) => c.marker === cleanMarker || cleanMarker.includes(c.marker));
    if (cite) {
      setSelectedCitation(cite);
      setIsCitationDrawerOpen(true);
    }
  };

  const handleSaveCitationToCollection = async (cite: CitationItem) => {
    const cols = await api.getCollections();
    const targetColId = cols.length > 0 ? cols[0].id : 'col-1';
    await api.addToCollection(targetColId, {
      item_type: 'paper',
      title: cite.title,
      reference_id: cite.pmid || cite.id,
      metadata: { journal: cite.journal, year: cite.year, study_type: cite.study_type },
      notes: `Saved evidence marker ${cite.marker}: ${cite.evidence_excerpt.slice(0, 100)}...`
    });
    setSaveSuccessMsg(`Saved "${cite.title.slice(0, 35)}..." to Research Collection.`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleExportDossier = () => {
    if (!result) return;
    const markdownContent = `# Research Intelligence Dossier: ${result.query}\n\n` +
      `**Session ID:** ${result.session_id}\n` +
      `**Confidence Score:** ${Math.round(result.confidence.overall_confidence * 100)}% (${result.confidence.label})\n` +
      `**Evidence Agreement:** ${result.agreement_status}\n` +
      `**Generated:** ${result.timestamp}\n\n` +
      `## Executive Summary\n${result.synthesis.executive_summary}\n\n` +
      `## Key Findings\n` +
      result.synthesis.key_findings.map((f) => `- ${f}`).join('\n') +
      `\n\n## Mechanisms\n` +
      result.synthesis.mechanisms.map((m) => `- ${m}`).join('\n') +
      `\n\n## Clinical Evidence\n` +
      result.synthesis.clinical_evidence.map((c) => `- ${c}`).join('\n') +
      `\n\n## Contradictory Findings & Limitations\n` +
      result.synthesis.contradictory_findings.map((cf) => `- ${cf}`).join('\n') +
      `\n\n## Grounded Citations & Sources\n` +
      result.citations.map((c) => `${c.marker} ${c.title}. *${c.journal || 'Database'}* (${c.year || 'N/A'}). URL: ${c.source_url}`).join('\n');

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BioMindQ-Dossier-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper to render text with clickable citation chips
  const renderTextWithCitations = (text: string) => {
    const parts = text.split(/(\[\d+\])/g);
    return parts.map((part, i) => {
      if (/^\[\d+\]$/.test(part)) {
        return (
          <button
            key={i}
            onClick={() => handleOpenCitationByMarker(part)}
            className="citation-chip"
            title="Click to inspect primary source and verified excerpt"
          >
            {part}
          </button>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {saveSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 glass-card px-4 py-3 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Query Search Bar */}
      <div className="glass-card p-3 rounded-2xl border border-scientific-border shadow-premium flex items-center gap-3">
        <Search className="w-5 h-5 text-scientific-primary ml-2 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleInitiateResearch(query)}
          placeholder="Ask a scientific research question (e.g. 'What is known about metformin and Alzheimer's disease?')"
          className="w-full py-2 px-1 text-sm bg-transparent text-scientific-text focus:outline-none font-medium"
        />
        <button
          onClick={() => handleInitiateResearch(query)}
          disabled={isLoading}
          className="px-6 py-2.5 rounded-xl bg-scientific-primary text-white font-bold text-xs hover:bg-blue-600 shadow-premium shadow-scientific-primary/20 transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing Evidence...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Execute Research</span>
            </>
          )}
        </button>
      </div>

      {/* Pipeline Status Indicator (When loading) */}
      {isLoading && (
        <div className="glass-panel p-6 rounded-2xl border border-scientific-border space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-scientific-primary">
            <span>Executing Multi-Source Grounding Pipeline</span>
            <span>Step {pipelineStep} of 4</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className={`p-2.5 rounded-xl border ${pipelineStep >= 1 ? 'bg-blue-50 border-scientific-primary text-scientific-primary font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              1. Intent & Entities
            </div>
            <div className={`p-2.5 rounded-xl border ${pipelineStep >= 2 ? 'bg-blue-50 border-scientific-primary text-scientific-primary font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              2. PubMed / ChEMBL
            </div>
            <div className={`p-2.5 rounded-xl border ${pipelineStep >= 3 ? 'bg-blue-50 border-scientific-primary text-scientific-primary font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              3. Conflict Detection
            </div>
            <div className={`p-2.5 rounded-xl border ${pipelineStep >= 4 ? 'bg-blue-50 border-scientific-primary text-scientific-primary font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              4. Synthesis & Graph
            </div>
          </div>
        </div>
      )}

      {/* Main Research Intelligence Header */}
      {result && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-scientific-border shadow-premium space-y-6">
          <div className="flex items-start justify-between flex-wrap gap-4 border-b border-scientific-border pb-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-scientific-blueLight text-scientific-primary border border-blue-200 rounded-md">
                  Research Intelligence Session #{result.session_id.slice(0, 8)}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded-md">
                  Scope: {result.focus}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded-md">
                  Timeframe: {result.timeframe}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-scientific-text leading-snug">
                "{result.query}"
              </h2>
            </div>

            {/* Top Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportDossier}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-scientific-text bg-white border border-scientific-border hover:border-scientific-primary rounded-xl shadow-2xs transition-all"
              >
                <Download className="w-3.5 h-3.5 text-scientific-primary" />
                <span>Export Dossier (.md)</span>
              </button>
            </div>
          </div>

          {/* Telemetry Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-scientific-muted block">Sources Queried</span>
              <span className="font-extrabold text-scientific-text text-sm">{result.sources_analyzed.join(', ')}</span>
            </div>
            <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-scientific-muted block">Evidence Items</span>
              <span className="font-extrabold text-scientific-text text-sm">{result.citations.length} Indexed Manuscripts</span>
            </div>
            <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-scientific-muted block">Evidence Agreement</span>
              <span className="font-extrabold text-scientific-primary text-sm">{result.agreement_status}</span>
            </div>
            <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-scientific-muted block">Confidence Score</span>
              <span className="font-extrabold text-emerald-600 text-sm">{Math.round(result.confidence.overall_confidence * 100)}% ({result.confidence.label})</span>
            </div>
          </div>

          {/* Intelligence Navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-scientific-border overflow-x-auto pb-1">
            {[
              { id: 'synthesis', label: 'AI Synthesis', icon: Sparkles },
              { id: 'evidence', label: 'Evidence & Citations', icon: FileCheck2 },
              { id: 'graph', label: 'Knowledge Graph', icon: GitFork },
              { id: 'timeline', label: 'Research Timeline', icon: Clock },
              { id: 'compounds', label: 'Compounds & Bioactivity', icon: Pill },
              { id: 'trials', label: 'Clinical Trials', icon: ShieldCheck }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all shrink-0 ${
                    isActive
                      ? 'bg-scientific-primary text-white shadow-premium shadow-scientific-primary/20'
                      : 'text-scientific-muted hover:text-scientific-text hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: AI SYNTHESIS */}
          {activeTab === 'synthesis' && (
            <div className="space-y-6 text-xs text-slate-700 leading-relaxed">
              {/* Executive Summary */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-scientific-blueLight/50 via-white to-scientific-cyanLight/30 border border-blue-200 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-scientific-primary font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Executive Summary</span>
                  </div>
                  <span className="text-[10px] font-bold text-scientific-muted">
                    Click citation badges [1], [2] to inspect supporting evidence
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-800 leading-relaxed">
                  {renderTextWithCitations(result.synthesis.executive_summary)}
                </p>
              </div>

              {/* Analytics & Conflict Matrix Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ConfidenceGauge metrics={result.confidence} />
                <ConflictMatrix status={result.agreement_status} conflicts={result.conflicts} />
              </div>

              {/* Key Findings Section */}
              <div className="glass-card p-6 rounded-2xl border border-scientific-border space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-scientific-muted flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-scientific-primary" />
                  <span>Key Grounded Findings</span>
                </h3>
                <div className="space-y-2.5">
                  {result.synthesis.key_findings.map((f, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                      <span className="w-5 h-5 rounded-full bg-scientific-blueLight text-scientific-primary font-bold flex items-center justify-center shrink-0 text-[11px]">
                        {i + 1}
                      </span>
                      <p className="text-slate-800 font-medium">
                        {renderTextWithCitations(f)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mechanisms & Clinical Evidence Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Molecular Mechanisms */}
                <div className="glass-card p-6 rounded-2xl border border-scientific-border space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-scientific-secondary flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <span>Biological & Cellular Mechanisms</span>
                  </h3>
                  <div className="space-y-2">
                    {result.synthesis.mechanisms.map((m, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-slate-700">
                          {renderTextWithCitations(m)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clinical Evidence */}
                <div className="glass-card p-6 rounded-2xl border border-scientific-border space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-scientific-primary flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Human Clinical & Trial Evidence</span>
                  </h3>
                  <div className="space-y-2">
                    {result.synthesis.clinical_evidence.map((c, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-slate-700">
                          {renderTextWithCitations(c)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preclinical & Contradictory Findings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-2xl border border-scientific-border space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-2">
                    <Pill className="w-4 h-4" />
                    <span>Preclinical In Vitro / Murine Models</span>
                  </h3>
                  <div className="space-y-2">
                    {result.synthesis.preclinical_evidence.map((p, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-slate-700">
                          {renderTextWithCitations(p)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Contradictory Findings & Disagreements</span>
                  </h3>
                  <div className="space-y-2">
                    {result.synthesis.contradictory_findings.map((cf, i) => (
                      <div key={i} className="p-3 bg-white rounded-xl border border-amber-200">
                        <p className="text-slate-700">
                          {renderTextWithCitations(cf)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Research Gaps & What We Cannot Conclude */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-2xl border border-slate-200 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-scientific-primary" />
                    <span>Unresolved Research Gaps</span>
                  </h3>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-600">
                    {result.synthesis.research_gaps.map((rg, i) => (
                      <li key={i}>{rg}</li>
                    ))}
                  </ul>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-rose-200 bg-rose-50/30 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-rose-600" />
                    <span>What We Cannot Conclude</span>
                  </h3>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-700">
                    {result.synthesis.what_we_cannot_conclude.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EVIDENCE & CITATIONS */}
          {activeTab === 'evidence' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-scientific-muted">
                  Indexed Primary Sources ({result.citations.length} Manuscripts)
                </h3>
              </div>

              <div className="space-y-4">
                {result.citations.map((cite) => (
                  <div
                    key={cite.id}
                    className="glass-card p-5 rounded-2xl border border-scientific-border hover:border-scientific-primary/50 transition-all shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-scientific-blueLight text-scientific-primary border border-blue-200">
                          {cite.marker}
                        </span>
                        <span className="text-xs font-bold text-scientific-primary font-mono">
                          {cite.source_type}
                        </span>
                        {cite.journal && (
                          <span className="text-xs text-scientific-muted">
                            • {cite.journal} ({cite.year})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedCitation(cite);
                            setIsCitationDrawerOpen(true);
                          }}
                          className="px-3 py-1 bg-slate-100 hover:bg-scientific-primary hover:text-white rounded-lg text-xs font-semibold text-scientific-text transition-colors"
                        >
                          View Evidence Excerpt
                        </button>
                        <a
                          href={cite.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-scientific-muted hover:text-scientific-primary rounded-lg border border-slate-200"
                          title="Open External URL"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-scientific-text leading-snug">
                      {cite.title}
                    </h4>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 italic font-medium">
                      "{cite.evidence_excerpt}"
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-scientific-muted pt-2 border-t border-slate-100">
                      <span>Authors: {cite.authors.join(', ')}</span>
                      {cite.pmid && <span>PMID: {cite.pmid}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: KNOWLEDGE GRAPH */}
          {activeTab === 'graph' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-scientific-muted">
                    React Flow Biomedical Knowledge Graph
                  </h3>
                  <p className="text-[11px] text-scientific-muted">
                    Interactive topology mapping Disease ➔ Compound ➔ Target ➔ Mechanism ➔ Publication ➔ Clinical Trial
                  </p>
                </div>
              </div>
              <KnowledgeGraphView graph={result.graph} />
            </div>
          )}

          {/* TAB 4: RESEARCH TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <ResearchTimelineView
                timeline={result.timeline}
                onOpenCitation={(marker) => handleOpenCitationByMarker(marker)}
              />
            </div>
          )}

          {/* TAB 5: COMPOUNDS & BIOACTIVITY */}
          {activeTab === 'compounds' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MoleculeViewer
                name={result.compounds[0]?.name || 'Metformin'}
                smiles={result.compounds[0]?.smiles || 'CN(C)C(=N)NC(=N)N'}
                molecularFormula={result.compounds[0]?.molecular_formula || 'C4H11N5'}
                molecularWeight={result.compounds[0]?.molecular_weight || 129.16}
                targets={result.compounds[0]?.targets || ['AMPK', 'Complex I']}
              />

              <div className="glass-card p-6 rounded-2xl border border-scientific-border space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-scientific-primary">
                  Bioactivity & Target Mechanisms
                </h3>
                {result.compounds.map((comp) => (
                  <div key={comp.id} className="space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-scientific-text">{comp.name}</span>
                      <span className="font-mono text-[11px] text-scientific-muted">{comp.chembl_id}</span>
                    </div>

                    <p className="text-slate-600 leading-relaxed">
                      {comp.mechanism_of_action}
                    </p>

                    <div className="space-y-1.5 pt-2">
                      <span className="font-bold text-[10px] uppercase text-scientific-muted block">
                        Molecular Targets
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {comp.targets.map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-medium">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <span className="font-bold text-[10px] uppercase text-scientific-muted block">
                        IC50 & Binding Constants
                      </span>
                      <div className="space-y-1">
                        {comp.ic50_ranges.map((ic, idx) => (
                          <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px]">
                            {ic}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: CLINICAL TRIALS */}
          {activeTab === 'trials' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-scientific-muted">
                Active & Completed Human Clinical Trials ({result.clinical_trials.length} Studies)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.clinical_trials.map((trial) => (
                  <div key={trial.nct_id} className="glass-card p-5 rounded-2xl border border-scientific-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-scientific-primary">
                        {trial.nct_id}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {trial.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-scientific-text leading-snug">
                      {trial.title}
                    </h4>

                    <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div><strong>Phase:</strong> {trial.phase || 'Phase 2'}</div>
                      <div><strong>Condition:</strong> {trial.condition}</div>
                      <div><strong>Intervention:</strong> {trial.intervention}</div>
                      <div><strong>Sponsor:</strong> {trial.sponsor}</div>
                    </div>

                    <a
                      href={trial.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-scientific-primary hover:underline"
                    >
                      <span>View Study Protocol on ClinicalTrials.gov</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Smart Clarification Modal */}
      <ClarificationModal
        isOpen={isClarificationOpen}
        query={query}
        clarificationData={clarificationData}
        onProceedWithPlan={(plan) => executeResearchPlan(plan)}
        onClose={() => setIsClarificationOpen(false)}
      />

      {/* Sliding Citation Drawer */}
      <CitationDrawer
        isOpen={isCitationDrawerOpen}
        citation={selectedCitation}
        onClose={() => setIsCitationDrawerOpen(false)}
        onSaveToCollection={(cite) => handleSaveCitationToCollection(cite)}
      />
    </div>
  );
};
