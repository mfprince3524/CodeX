import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Search,
  Sparkles,
  Lightbulb,
  ArrowRight,
  Bookmark,
  ExternalLink,
  FlaskConical,
  Compass,
  AlertCircle,
  BookmarkCheck,
  Plus,
  X,
  CheckCircle2,
  FileSpreadsheet,
  Stethoscope,
  Microscope,
  Dna
} from 'lucide-react';
import type { ResearchGapAnalysis, ResearchGapItem } from '../types';
import { api } from '../services/api';

interface ResearchGapFinderPageProps {
  onStartResearch: (query: string) => void;
  initialTopic?: string;
  onUpdateSearchQuery?: (query: string) => void;
}

export const ResearchGapFinderPage: React.FC<ResearchGapFinderPageProps> = ({
  onStartResearch,
  initialTopic,
  onUpdateSearchQuery
}) => {
  const [topic, setTopic] = useState(initialTopic || '');
  const [gapAnalysis, setGapAnalysis] = useState<ResearchGapAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedGapIds, setSavedGapIds] = useState<Record<string, boolean>>({});
  const [investigationGap, setInvestigationGap] = useState<ResearchGapItem | null>(null);

  const sampleTopics = [
    "Metformin in Alzheimer's Disease",
    "EGFR TKI Resistance in Non-Small Cell Lung Cancer",
    "Immunotherapy Response in PD-L1 Negative Melanoma",
    "PARP Inhibitor Synthetic Lethality in HR-Proficient Tumors",
    "GLP-1 Receptor Agonists in Neurodegenerative Microglia"
  ];

  const handleIdentifyGaps = async (searchTopic?: string) => {
    const t = searchTopic !== undefined ? searchTopic : topic;
    if (!t.trim()) return;
    if (onUpdateSearchQuery) {
      onUpdateSearchQuery(t.trim());
    }
    setIsSearchingTrueAndFetch(t.trim());
  };

  const setIsSearchingTrueAndFetch = async (queryTerm: string) => {
    setIsLoading(true);
    try {
      const res = await api.identifyGaps(queryTerm);
      setGapAnalysis(res);
    } catch (err) {
      console.error('Gap analysis failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialTopic && initialTopic.trim()) {
      setTopic(initialTopic.trim());
      setIsSearchingTrueAndFetch(initialTopic.trim());
    }
  }, [initialTopic]);

  const handleSaveGap = async (gap: ResearchGapItem) => {
    setSavedGapIds(prev => ({ ...prev, [gap.id]: true }));
    const collections = await api.getCollections();
    if (collections.length > 0) {
      await api.addToCollection(collections[0].id, {
        item_type: 'query',
        title: gap.research_question,
        reference_id: gap.id,
        metadata: {
          category: gap.gap_category,
          citations: gap.relevant_citations
        },
        notes: `Research Gap: ${gap.why_it_matters}`
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-[#00606B] font-semibold text-xs uppercase tracking-wider">
          <HelpCircle className="w-4 h-4" />
          <span>Biomedical Discovery Tool</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Research Gap Finder
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
          Detect underexplored questions, missing experimental evidence, and unverified hypotheses in the retrieved literature to guide next-generation investigations.
        </p>
      </div>

      {/* Topic Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleIdentifyGaps();
          }}
          className="flex flex-col sm:flex-row gap-2.5"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter disease, biological target, or compound to discover research gaps..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00606B]"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !topic.trim()}
            className="px-6 py-2.5 bg-[#00606B] hover:bg-[#004D56] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Lightbulb className="w-4 h-4" />
            )}
            <span>Find Gaps</span>
          </button>
        </form>

        {/* Suggestion tags */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs pt-1">
          <span className="text-slate-400 font-medium text-[11px]">Example Discovery Areas:</span>
          {sampleTopics.map((st) => (
            <button
              key={st}
              onClick={() => {
                setTopic(st);
                handleIdentifyGaps(st);
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-[#E0F5F4] hover:text-[#00606B] text-slate-700 rounded-lg text-[11px] font-medium transition-colors border border-slate-200 cursor-pointer"
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Gap Analysis Results */}
      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
          <div className="inline-block w-7 h-7 border-3 border-[#00606B] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Synthesizing underexplored questions from peer-reviewed literature...</p>
        </div>
      ) : gapAnalysis ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Identified <strong className="text-slate-900 font-bold">{gapAnalysis.identified_gaps.length}</strong> scientific gaps for <strong className="text-[#00606B]">"{gapAnalysis.topic}"</strong>
            </span>
            <span>Based on {gapAnalysis.retrieved_papers_count} retrieved studies</span>
          </div>

          <div className="space-y-4">
            {gapAnalysis.identified_gaps.map((gap, idx) => {
              const isSaved = savedGapIds[gap.id];

              return (
                <div
                  key={gap.id || idx}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-[#00606B] transition-all space-y-3"
                >
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#E0F5F4] text-[#00606B] rounded-md border border-[#BDE8E4]">
                          {gap.gap_category}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">
                          Gap #{idx + 1}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        {gap.research_question}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleSaveGap(gap)}
                        title="Save to Research Collections"
                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                          isSaved
                            ? 'bg-[#E0F5F4] text-[#00606B] border-[#00606B]'
                            : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        {isSaved ? <BookmarkCheck className="w-4 h-4 text-[#00606B]" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setInvestigationGap(gap)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00606B] hover:bg-[#004D56] text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#00D1C1]" />
                        <span>Investigate</span>
                      </button>
                    </div>
                  </div>

                  {/* Why it Matters */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1">
                    <span className="font-semibold text-[#00606B] block">Why This Question Matters:</span>
                    <p className="text-slate-700 leading-relaxed">{gap.why_it_matters}</p>
                  </div>

                  {/* Evidence Comparison Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200 space-y-1">
                      <span className="font-semibold text-slate-700 block">What Literature Shows:</span>
                      <p className="text-slate-600 text-[11.5px] leading-relaxed">
                        {gap.what_literature_shows}
                      </p>
                    </div>

                    <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200 space-y-1">
                      <span className="font-semibold text-amber-900 block">Missing / Limited Evidence:</span>
                      <p className="text-amber-800 text-[11.5px] leading-relaxed">
                        {gap.missing_or_limited_evidence}
                      </p>
                    </div>
                  </div>

                  {/* Suggested Experiments */}
                  <div className="bg-[#F0FBF9] rounded-xl p-3 border border-[#CDECE8] text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#00606B]">
                      <FlaskConical className="w-3.5 h-3.5" />
                      <span>Suggested Experimental / Clinical Investigations:</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed text-[11.5px]">
                      {gap.suggested_investigation_or_experiments}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">Ready to Discover Research Gaps</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Search any disease, biological target, or therapy above to identify unexplored research questions and missing clinical validation.
          </p>
        </div>
      )}

      {/* In-Page Investigation Protocol Modal */}
      {investigationGap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#E0F5F4] text-[#00606B] rounded-md border border-[#BDE8E4]">
                    {investigationGap.gap_category} Protocol
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Translational Deep-Dive</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {investigationGap.research_question}
                </h2>
              </div>
              <button
                onClick={() => setInvestigationGap(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scientific Rationale */}
            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                1. Scientific Rationale & Hypothesis
              </span>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {investigationGap.why_it_matters}
              </p>
            </div>

            {/* Proposed Experimental Trial Protocol */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-[#00606B]" />
                2. Proposed Study Protocol & Methodology
              </span>
              <div className="bg-[#F0FBF9] p-4 rounded-xl border border-[#CDECE8] space-y-2.5">
                <div className="font-semibold text-slate-900 text-xs">
                  {investigationGap.suggested_investigation_or_experiments}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-0.5">
                    <span className="font-bold text-[#00606B] block">Primary Endpoint:</span>
                    <span>Longitudinal biomarker separation vs. placebo at 24-36 months.</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-0.5">
                    <span className="font-bold text-[#00606B] block">Assay Methods:</span>
                    <span>High-sensitivity immunoassay, PET imaging & pharmacokinetic sampling.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Literature Evidence Context */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block flex items-center gap-1.5">
                <Microscope className="w-4 h-4 text-[#00606B]" />
                3. Current Literature Baseline
              </span>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11.5px] leading-relaxed">
                {investigationGap.what_literature_shows}
              </div>
            </div>

            {/* Key Citations */}
            {investigationGap.relevant_citations && investigationGap.relevant_citations.length > 0 && (
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-slate-700 text-[11px] block">Referenced Studies:</span>
                <div className="flex flex-wrap gap-1.5">
                  {investigationGap.relevant_citations.map((cite, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-mono border border-slate-200">
                      {cite}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 flex-wrap">
              <button
                onClick={() => {
                  handleSaveGap(investigationGap);
                  setInvestigationGap(null);
                }}
                className="px-4 py-2 bg-[#00606B] hover:bg-[#004D56] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <BookmarkCheck className="w-4 h-4" />
                <span>Save Protocol to Collections</span>
              </button>

              <button
                onClick={() => {
                  onStartResearch(investigationGap.research_question);
                  setInvestigationGap(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#00606B]" />
                <span>Analyze in Conflict Radar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
