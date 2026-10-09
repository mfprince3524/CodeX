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
  BookmarkCheck,
  Download,
  Share2,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Info,
  RefreshCw,
  Compass,
  Network,
  HelpCircle,
  GitCompare,
  BookOpen,
  Scale,
  ArrowRight,
  Plus,
  ChevronDown,
  RotateCcw,
  Lightbulb,
  FileSpreadsheet,
  TrendingUp
} from 'lucide-react';

interface ResearchWorkspaceProps {
  initialQuery?: string;
  onNavigate: (tab: string) => void;
}

export const ResearchWorkspace: React.FC<ResearchWorkspaceProps> = ({
  initialQuery = "",
  onNavigate
}) => {
  const [query, setQuery] = useState(initialQuery || "Mechanisms of resistance to PD-1 inhibitors in non-small cell lung cancer");
  const [selectedAgent, setSelectedAgent] = useState<'Research agent' | 'Conflict radar agent' | 'Gap finder agent'>('Research agent');
  const [isAgentMenuOpen, setIsAgentMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<number>(0);
  const [result, setResult] = useState<ResearchQueryResult | null>(null);

  // Modals & Drawers
  const [isClarificationOpen, setIsClarificationOpen] = useState(false);
  const [clarificationData, setClarificationData] = useState<ClarificationResponse | null>(null);
  const [selectedCitation, setSelectedCitation] = useState<CitationItem | null>(null);
  const [isCitationDrawerOpen, setIsCitationDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'synthesis' | 'evidence' | 'conflicts' | 'graph' | 'compounds' | 'timeline'>('synthesis');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialQuery && initialQuery !== query) {
      setQuery(initialQuery);
      handleInitiateResearch(initialQuery);
    }
  }, [initialQuery]);

  const handleInitiateResearch = async (qText: string) => {
    if (!qText.trim()) return;
    setQuery(qText);
    setIsLoading(true);
    setPipelineStep(1);

    try {
      const clarifyRes = await api.clarifyQuery(qText);
      setClarificationData(clarifyRes);

      await executeResearchPlan({
        query: qText,
        focus: 'All Dimensions',
        timeframe: 'All',
        sources: ['PubMed', 'Europe PMC', 'ChEMBL', 'ClinicalTrials.gov']
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
    sources: string[];
    answers?: Record<string, any>;
  }) => {
    setIsLoading(true);
    setPipelineStep(2);
    setTimeout(() => setPipelineStep(3), 400);
    setTimeout(() => setPipelineStep(4), 800);

    try {
      const researchRes = await api.runResearchQuery({
        query: plan.query || query,
        focus: plan.focus,
        timeframe: plan.timeframe,
        sources: plan.sources,
        clarification_answers: plan.answers
      });
      setResult(researchRes);
    } catch (err) {
      console.error('Research execution error:', err);
    } finally {
      setIsLoading(false);
      setPipelineStep(0);
    }
  };

  const handleCitationClick = (cite: CitationItem) => {
    setSelectedCitation(cite);
    setIsCitationDrawerOpen(true);
  };

  const handleSaveToCollection = async () => {
    if (!result) return;
    const collections = await api.getCollections();
    if (collections.length > 0) {
      await api.addToCollection(collections[0].id, {
        item_type: 'query',
        title: result.query,
        reference_id: result.session_id,
        metadata: {
          citations_count: result.citations.length,
          timestamp: result.timestamp
        },
        notes: result.synthesis.executive_summary.slice(0, 180) + '...'
      });
    }
    setSaveSuccessMsg('Research session saved to Library!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleExportMarkdown = () => {
    if (!result) return;
    let md = `# BioMindQ Research Intelligence Report\n\n`;
    md += `**Query:** ${result.query}\n`;
    md += `**Generated:** ${new Date(result.timestamp).toUTCString()}\n`;
    md += `**Agreement Status:** ${result.agreement_status}\n\n`;
    md += `## Executive Summary\n${result.synthesis.executive_summary}\n\n`;
    md += `## Key Findings\n`;
    result.synthesis.key_findings.forEach((kf) => (md += `- ${kf}\n`));
    md += `\n## Molecular Mechanisms\n`;
    result.synthesis.mechanisms.forEach((m) => (md += `- ${m}\n`));
    md += `\n## Clinical & Epidemiological Evidence\n`;
    result.synthesis.clinical_evidence.forEach((ce) => (md += `- ${ce}\n`));
    md += `\n## Conflicting or Inconclusive Findings\n`;
    result.synthesis.contradictory_findings.forEach((cf) => (md += `- ${cf}\n`));
    md += `\n## Identified Research Gaps\n`;
    result.synthesis.research_gaps.forEach((rg) => (md += `- ${rg}\n`));
    md += `\n## Limitations & Uncertainty\n`;
    result.synthesis.what_we_cannot_conclude.forEach((lim) => (md += `- ${lim}\n`));
    md += `\n## References & Citations\n`;
    result.citations.forEach((c) => {
      md += `${c.marker} ${c.authors.join(', ')} (${c.year || 2024}). ${c.title}. *${c.journal || 'Journal'}*. ${c.pmid ? `PMID: ${c.pmid}` : ''} ${c.doi ? `https://doi.org/${c.doi}` : ''}\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BioMindQ-Research-${result.session_id.slice(0, 8)}.md`;
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {saveSuccessMsg && (
        <div className="fixed top-16 right-6 z-50 bg-[#202522] text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main Elicit-Style Query Card */}
      <div className="w-full max-w-2xl mx-auto space-y-4">
        <div className="rounded-2xl border border-[#D5D9D3] bg-white shadow-sm overflow-hidden">
          {/* Card Top Header Bar */}
          <div className="bg-[#2D605E] px-4 py-2.5 flex items-center justify-between text-white">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAgentMenuOpen(!isAgentMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/15 hover:bg-white/25 text-xs font-medium transition-colors"
              >
                <span>⚏</span>
                <span>{selectedAgent}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {isAgentMenuOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-[#E6E8E3] py-1 text-xs text-[#202522] z-30">
                  {[
                    { id: 'Research agent', desc: 'PubMed & ChEMBL RAG synthesis' },
                    { id: 'Conflict radar agent', desc: 'Scientific disagreements & models' },
                    { id: 'Gap finder agent', desc: 'Underexplored hypotheses' }
                  ].map((ag) => (
                    <button
                      key={ag.id}
                      type="button"
                      onClick={() => {
                        setSelectedAgent(ag.id as any);
                        setIsAgentMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-[#F5F5F2] flex flex-col"
                    >
                      <span className="font-semibold">{ag.id}</span>
                      <span className="text-[10.5px] text-[#737873]">{ag.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Textarea Input Body */}
          <div className="p-4 space-y-4 bg-white">
            <textarea
              rows={3}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a biomedical research question (e.g. Mechanisms of resistance to PD-1 inhibitors)..."
              className="w-full resize-none border-none outline-none text-sm sm:text-base text-[#202522] placeholder:text-[#9A9E9A] leading-relaxed bg-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleInitiateResearch(query);
                }
              }}
            />

            {/* Bottom Toolbar inside card */}
            <div className="flex items-center justify-between pt-2 border-t border-[#F0F2ED]">
              <button
                type="button"
                onClick={() => setIsClarificationOpen(true)}
                title="Add scope, filters, or specific study dimensions"
                className="w-7 h-7 rounded-full border border-[#D5D9D3] text-[#737873] hover:text-[#202522] hover:bg-[#F5F5F2] flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleInitiateResearch(query)}
                disabled={isLoading || !query.trim()}
                className="w-8 h-8 rounded-lg bg-[#739E9B] hover:bg-[#2D605E] text-white flex items-center justify-center transition-colors disabled:opacity-40"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Action Pills Row */}
        <div className="flex items-center justify-center gap-2 flex-wrap text-xs pt-1">
          <button
            onClick={() => handleInitiateResearch(`Draft comprehensive literature review on ${query}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F5F5F2] text-[#4A504A] rounded-lg border border-[#E0E2DC] transition-colors shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-[#737873]" />
            <span>Draft report</span>
          </button>
          <button
            onClick={() => onNavigate('compounds')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F5F5F2] text-[#4A504A] rounded-lg border border-[#E0E2DC] transition-colors shadow-2xs"
          >
            <Pill className="w-3.5 h-3.5 text-[#737873]" />
            <span>Compound lookup</span>
          </button>
          <button
            onClick={() => onNavigate('literature')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F5F5F2] text-[#4A504A] rounded-lg border border-[#E0E2DC] transition-colors shadow-2xs"
          >
            <Search className="w-3.5 h-3.5 text-[#737873]" />
            <span>Find papers</span>
          </button>
          <button
            onClick={() => onNavigate('conflicts')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F5F5F2] text-[#4A504A] rounded-lg border border-[#E0E2DC] transition-colors shadow-2xs"
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#737873]" />
            <span>Strategy</span>
          </button>
          <button
            onClick={() => onNavigate('graph')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F5F5F2] text-[#4A504A] rounded-lg border border-[#E0E2DC] transition-colors shadow-2xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#737873]" />
            <span>Landscapes</span>
          </button>
        </div>

        {/* 3 Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4">
          {/* Card 1: Resume */}
          <div
            onClick={() => {
              const q = "Recent advancements in cancer research";
              setQuery(q);
              handleInitiateResearch(q);
            }}
            className="bg-white border border-[#E0E2DC] hover:border-[#2D605E]/50 rounded-xl p-3.5 cursor-pointer transition-all shadow-2xs space-y-2 flex flex-col justify-between"
          >
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10.5px] font-semibold text-[#555A55] bg-[#F5F5F2] rounded border border-[#E6E8E3]">
                <RotateCcw className="w-3 h-3" />
                <span>Resume</span>
              </span>
              <h4 className="text-xs font-semibold text-[#202522] leading-snug">
                Recent advancements in cancer research
              </h4>
            </div>
            <div className="text-[10.5px] text-[#737873] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2D605E]"></span>
              <span>Research agent · 39 minutes ago</span>
            </div>
          </div>

          {/* Card 2: Suggested */}
          <div
            onClick={() => {
              const q = "Mechanisms of resistance to PD-1 inhibitors in non-small cell lung cancer";
              setQuery(q);
              handleInitiateResearch(q);
            }}
            className="bg-white border border-[#E0E2DC] hover:border-[#2D605E]/50 rounded-xl p-3.5 cursor-pointer transition-all shadow-2xs space-y-2 flex flex-col justify-between"
          >
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10.5px] font-semibold text-[#555A55] bg-[#F5F5F2] rounded border border-[#E6E8E3]">
                <Lightbulb className="w-3 h-3" />
                <span>Suggested</span>
              </span>
              <h4 className="text-xs font-semibold text-[#202522] leading-snug">
                Mechanisms of resistance to PD-1 inhibitors in non-small cell lung cancer
              </h4>
            </div>
            <div className="text-[10.5px] text-[#737873]">
              Click to run analysis
            </div>
          </div>

          {/* Card 3: Suggested */}
          <div
            onClick={() => {
              const q = "Compare efficacy and side effects of CAR-T therapies in hematologic malignancies";
              setQuery(q);
              handleInitiateResearch(q);
            }}
            className="bg-white border border-[#E0E2DC] hover:border-[#2D605E]/50 rounded-xl p-3.5 cursor-pointer transition-all shadow-2xs space-y-2 flex flex-col justify-between"
          >
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10.5px] font-semibold text-[#555A55] bg-[#F5F5F2] rounded border border-[#E6E8E3]">
                <Lightbulb className="w-3 h-3" />
                <span>Suggested</span>
              </span>
              <h4 className="text-xs font-semibold text-[#202522] leading-snug">
                Compare efficacy and side effects of CAR-T therapies in hematologic malignancies
              </h4>
            </div>
            <div className="text-[10.5px] text-[#737873]">
              Click to run analysis
            </div>
          </div>
        </div>
      </div>

      {/* Loading Progress State */}
      {isLoading && (
        <div className="bg-white border border-[#E6E8E3] rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#202522]">
              <RefreshCw className="w-4 h-4 text-[#2D605E] animate-spin" />
              <span>Multi-Source Literature & Bioassay Retrieval...</span>
            </div>
            <span className="text-[11px] text-[#737873]">Step {pipelineStep} of 4</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-[10.5px]">
            <div className={`p-2 rounded border ${pipelineStep >= 1 ? 'bg-[#E5EBE5] border-[#D0DAD0] font-semibold text-[#202522]' : 'bg-[#FAFAF9] border-[#E6E8E3] text-[#737873]'}`}>
              1. Intent Scoping
            </div>
            <div className={`p-2 rounded border ${pipelineStep >= 2 ? 'bg-[#E5EBE5] border-[#D0DAD0] font-semibold text-[#202522]' : 'bg-[#FAFAF9] border-[#E6E8E3] text-[#737873]'}`}>
              2. PubMed / ChEMBL
            </div>
            <div className={`p-2 rounded border ${pipelineStep >= 3 ? 'bg-[#E5EBE5] border-[#D0DAD0] font-semibold text-[#202522]' : 'bg-[#FAFAF9] border-[#E6E8E3] text-[#737873]'}`}>
              3. Conflict Detection
            </div>
            <div className={`p-2 rounded border ${pipelineStep >= 4 ? 'bg-[#E5EBE5] border-[#D0DAD0] font-semibold text-[#202522]' : 'bg-[#FAFAF9] border-[#E6E8E3] text-[#737873]'}`}>
              4. Grounded Synthesis
            </div>
          </div>
        </div>
      )}

      {/* Research Results Dashboard */}
      {result && !isLoading && (
        <div className="space-y-6 pt-4">
          {/* Top Session Action Bar */}
          <div className="bg-white border border-[#E6E8E3] rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#737873]">
                  Grounded Intelligence Synthesis
                </span>
                <span className="px-2 py-0.5 bg-[#E5EBE5] text-[#2D605E] border border-[#D0DAD0] text-[10px] font-bold rounded">
                  {result.agreement_status}
                </span>
              </div>
              <h2 className="text-base font-bold text-[#202522]">
                {result.query}
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSaveToCollection}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#FAFAF9] hover:bg-[#EFEFEA] text-[#202522] text-xs font-semibold rounded-lg border border-[#E0E2DC] transition-colors"
              >
                <Bookmark className="w-3.5 h-3.5 text-[#2D605E]" />
                <span>Save Session</span>
              </button>
              <button
                onClick={handleExportMarkdown}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#2D605E] hover:bg-[#24504E] text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Markdown</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-[#E6E8E3] text-xs overflow-x-auto">
            {[
              { id: 'synthesis', label: '1. Structured Synthesis', count: undefined },
              { id: 'evidence', label: '2. Citations & Records', count: result.citations.length },
              { id: 'conflicts', label: '3. Evidence Conflicts', count: result.conflicts.length },
              { id: 'graph', label: '4. Knowledge Network', count: result.graph.nodes.length },
              { id: 'compounds', label: '5. Molecule Dossier', count: result.compounds.length },
              { id: 'timeline', label: '6. Research Timeline', count: result.timeline.length }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3.5 py-2 font-semibold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === t.id
                    ? 'border-[#2D605E] text-[#2D605E]'
                    : 'border-transparent text-[#737873] hover:text-[#202522]'
                }`}
              >
                <span>{t.label}</span>
                {t.count !== undefined && (
                  <span className="px-1.5 py-0.2 text-[9.5px] rounded bg-[#FAFAF9] border border-[#E6E8E3] font-mono">
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab 1: Grounded Scientific Synthesis */}
          {activeTab === 'synthesis' && (
            <div className="space-y-5">
              {/* Executive Summary Card */}
              <div className="bg-white border border-[#E6E8E3] rounded-xl p-5 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2D605E]">
                  <FileText className="w-4 h-4" />
                  <span>Executive Summary</span>
                </div>
                <p className="text-xs sm:text-sm text-[#202522] leading-relaxed font-normal">
                  {result.synthesis.executive_summary}
                </p>
              </div>

              {/* Key Findings */}
              <div className="bg-white border border-[#E6E8E3] rounded-xl p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2D605E]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Key Findings</span>
                </div>
                <div className="space-y-2 text-xs text-[#202522]">
                  {result.synthesis.key_findings.map((kf, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-[#FAFAF9] border border-[#E6E8E3]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2D605E] mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{kf}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Supporting Mechanisms & Clinical Evidence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-[#E6E8E3] rounded-xl p-5 shadow-xs space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2D605E]">
                    <Activity className="w-4 h-4 text-[#2D605E]" />
                    <span>Molecular & Signaling Mechanisms</span>
                  </div>
                  <ul className="space-y-2 text-xs text-[#202522]">
                    {result.synthesis.mechanisms.map((m, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#2D605E] font-bold">•</span>
                        <span className="leading-relaxed">{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white border border-[#E6E8E3] rounded-xl p-5 shadow-xs space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2D605E]">
                    <ShieldCheck className="w-4 h-4 text-[#2D605E]" />
                    <span>Clinical & Epidemiological Evidence</span>
                  </div>
                  <ul className="space-y-2 text-xs text-[#202522]">
                    {result.synthesis.clinical_evidence.map((ce, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#2D605E] font-bold">•</span>
                        <span className="leading-relaxed">{ce}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Conflicting Findings & Limitations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-5 shadow-xs space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>Conflicting / Inconclusive Findings</span>
                  </div>
                  <ul className="space-y-2 text-xs text-amber-900">
                    {result.synthesis.contradictory_findings.map((cf, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-700 font-bold">•</span>
                        <span className="leading-relaxed">{cf}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#F7F7F5] border border-[#E6E8E3] rounded-xl p-5 shadow-xs space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4A504A]">
                    <Scale className="w-4 h-4 text-[#737873]" />
                    <span>Limitations & What We Cannot Conclude</span>
                  </div>
                  <ul className="space-y-2 text-xs text-[#4A504A]">
                    {result.synthesis.what_we_cannot_conclude.map((lim, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#737873] font-bold">•</span>
                        <span className="leading-relaxed">{lim}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Knowledge Gaps */}
              <div className="bg-white border border-[#E6E8E3] rounded-xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2D605E]">
                    <HelpCircle className="w-4 h-4" />
                    <span>Identified Research Gaps</span>
                  </div>
                  <button
                    onClick={() => onNavigate('gaps')}
                    className="text-[11px] text-[#2D605E] font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Open Gap Finder</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2 text-xs text-[#202522]">
                  {result.synthesis.research_gaps.map((rg, i) => (
                    <div key={i} className="p-3 bg-[#FAFAF9] rounded-lg border border-[#E6E8E3] flex items-start gap-2.5">
                      <span className="px-1.5 py-0.5 text-[9.5px] font-bold bg-[#E5EBE5] rounded text-[#202522] shrink-0">
                        Gap {i + 1}
                      </span>
                      <span className="leading-relaxed">{rg}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Citations */}
          {activeTab === 'evidence' && (
            <div className="space-y-3">
              {result.citations.map((cite) => (
                <div
                  key={cite.id}
                  onClick={() => handleCitationClick(cite)}
                  className="bg-white border border-[#E6E8E3] hover:border-[#2D605E]/50 rounded-xl p-4 shadow-xs transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 bg-[#E5EBE5] text-[#202522] font-semibold text-[10.5px] rounded border border-[#D0DAD0]">
                        {cite.marker}
                      </span>
                      <span className="text-[11px] font-semibold text-[#2D605E]">
                        {cite.journal} ({cite.year || 2024})
                      </span>
                      <span className="text-[11px] text-[#737873]">
                        {cite.study_type}
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-[#737873]" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-[#202522]">
                    {cite.title}
                  </h3>
                  <p className="text-xs text-[#4A504A] bg-[#FAFAF9] p-2.5 rounded border border-[#E6E8E3] leading-relaxed">
                    {cite.evidence_excerpt}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Conflicts */}
          {activeTab === 'conflicts' && (
            <div className="space-y-4">
              <ConflictMatrix conflicts={result.conflicts} />
            </div>
          )}

          {/* Tab 4: Knowledge Graph */}
          {activeTab === 'graph' && (
            <div className="space-y-4">
              <KnowledgeGraphView graph={result.graph} />
            </div>
          )}

          {/* Tab 5: Compounds */}
          {activeTab === 'compounds' && (
            <div className="space-y-4">
              {result.compounds.map((comp) => (
                <div key={comp.id} className="space-y-3">
                  <MoleculeViewer
                    name={comp.name}
                    smiles={comp.smiles}
                    molecularFormula={comp.molecular_formula}
                    molecularWeight={comp.molecular_weight}
                    targets={comp.targets}
                  />
                  <div className="bg-white border border-[#E6E8E3] rounded-xl p-4 shadow-xs space-y-2 text-xs">
                    <h4 className="font-bold text-[#202522]">{comp.name} Mechanism</h4>
                    <p className="text-[#4A504A] leading-relaxed">{comp.mechanism_of_action}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 6: Timeline */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <ResearchTimelineView events={result.timeline} />
            </div>
          )}
        </div>
      )}

      {/* Clarification Modal */}
      {clarificationData && (
        <ClarificationModal
          isOpen={isClarificationOpen}
          data={clarificationData}
          onClose={() => setIsClarificationOpen(false)}
          onSubmitAnswers={(answers) => {
            setIsClarificationOpen(false);
            executeResearchPlan({
              query,
              focus: answers.q_focus || 'All Dimensions',
              timeframe: answers.q_timeframe || 'All',
              sources: answers.q_sources || ['PubMed', 'ChEMBL', 'ClinicalTrials.gov'],
              answers
            });
          }}
        />
      )}

      {/* Citation Drawer */}
      <CitationDrawer
        isOpen={isCitationDrawerOpen}
        citation={selectedCitation}
        onClose={() => setIsCitationDrawerOpen(false)}
      />
    </div>
  );
};
