import React, { useState } from 'react';
import { ClarificationResponse } from '../../types';
import {
  HelpCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Filter,
  Compass,
  X
} from 'lucide-react';

interface ClarificationModalProps {
  isOpen: boolean;
  query?: string;
  data?: ClarificationResponse | null;
  clarificationData?: ClarificationResponse | null;
  onSubmitAnswers?: (answers: Record<string, any>) => void;
  onProceedWithPlan?: (plan: {
    focus: string;
    timeframe: string;
    evidence_type: string;
    sources: string[];
  }) => void;
  onClose: () => void;
}

export const ClarificationModal: React.FC<ClarificationModalProps> = ({
  isOpen,
  query = "Biomedical Query",
  data,
  clarificationData,
  onSubmitAnswers,
  onProceedWithPlan,
  onClose
}) => {
  const activeData = data || clarificationData;
  const [selectedFocus, setSelectedFocus] = useState<string>('All Dimensions (Recommended)');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('All Historical Literature');
  const [selectedSources, setSelectedSources] = useState<string[]>([
    'PubMed',
    'Europe PMC',
    'ChEMBL',
    'ClinicalTrials.gov'
  ]);

  if (!isOpen) return null;

  const toggleSource = (src: string) => {
    if (selectedSources.includes(src)) {
      if (selectedSources.length > 1) {
        setSelectedSources(selectedSources.filter((s) => s !== src));
      }
    } else {
      setSelectedSources([...selectedSources, src]);
    }
  };

  const handleExecute = () => {
    if (onSubmitAnswers) {
      onSubmitAnswers({
        q_focus: selectedFocus,
        q_timeframe: selectedTimeframe,
        q_sources: selectedSources
      });
    } else if (onProceedWithPlan) {
      onProceedWithPlan({
        focus: selectedFocus,
        timeframe: selectedTimeframe,
        evidence_type: 'All',
        sources: selectedSources
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-scientific-text/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white max-w-2xl w-full rounded-academic p-6 shadow-modal border border-scientific-border space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-academic bg-scientific-sage text-scientific-primary border border-scientific-sageDark flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-scientific-text">
                  Scientific Research Scoping & Clarification
                </h3>
                <span className="px-1.5 py-0.2 text-[9.5px] font-semibold bg-scientific-sage text-scientific-text rounded border border-scientific-sageDark/60">
                  Targeted Review
                </span>
              </div>
              <p className="text-xs text-scientific-muted">
                Refining strategy for query: <strong className="text-scientific-text">"{query}"</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-scientific-muted hover:text-scientific-text rounded hover:bg-scientific-surfaceSubtle transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message */}
        <div className="p-3 bg-scientific-bg border border-scientific-border rounded-academic text-xs text-scientific-text leading-relaxed">
          {activeData?.clarification_message ||
            "Select specific biological dimensions or proceed with comprehensive multi-source review."}
        </div>

        {/* Clarification Options */}
        <div className="space-y-4 text-xs">
          {/* Dimension Selection */}
          <div className="space-y-1.5">
            <label className="font-bold text-scientific-text uppercase text-[10.5px] tracking-wider block">
              1. Biological & Clinical Priority Focus
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { label: 'All Dimensions (Recommended)', desc: 'Comprehensive review across mechanisms, trials & epidemiology.' },
                { label: 'Molecular Mechanisms & Kinases', desc: 'AMPK pathways, tau phosphorylation & kinase targets.' },
                { label: 'Clinical Trials & Human Cohorts', desc: 'Phase 2/3 interventional trials & patient registries.' },
                { label: 'Preclinical & Animal Models', desc: 'Transgenic rodent models & in vitro organoid assays.' }
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setSelectedFocus(opt.label)}
                  className={`p-3 rounded-academic border text-left transition-all ${
                    selectedFocus === opt.label
                      ? 'bg-scientific-sage border-scientific-sageDark text-scientific-text shadow-subtle font-semibold'
                      : 'bg-white border-scientific-border text-scientific-muted hover:border-scientific-sageDark'
                  }`}
                >
                  <div className="font-bold text-scientific-text text-xs">{opt.label}</div>
                  <div className="text-[11px] text-scientific-muted mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Timeframe */}
          <div className="space-y-1.5">
            <label className="font-bold text-scientific-text uppercase text-[10.5px] tracking-wider block">
              2. Literature Timeframe
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['All Historical Literature', 'Last 5 Years (2021-2026)', 'Last 10 Years (2016-2026)'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTimeframe(t)}
                  className={`p-2 rounded-academic border text-center text-[11px] font-medium transition-all ${
                    selectedTimeframe === t
                      ? 'bg-scientific-sage border-scientific-sageDark text-scientific-primary font-bold shadow-subtle'
                      : 'bg-white border-scientific-border text-scientific-muted hover:border-scientific-sageDark'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Sources */}
          <div className="space-y-1.5">
            <label className="font-bold text-scientific-text uppercase text-[10.5px] tracking-wider block">
              3. Biomedical Data Sources
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'PubMed', label: 'PubMed / MEDLINE' },
                { id: 'Europe PMC', label: 'Europe PMC' },
                { id: 'ChEMBL', label: 'EMBL-EBI ChEMBL' },
                { id: 'ClinicalTrials.gov', label: 'ClinicalTrials.gov' }
              ].map((src) => {
                const isSelected = selectedSources.includes(src.id);
                return (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => toggleSource(src.id)}
                    className={`p-2 rounded-academic border text-center text-[11px] font-medium transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-scientific-sage border-scientific-sageDark text-scientific-text font-semibold'
                        : 'bg-white border-scientific-border text-scientific-muted hover:border-scientific-sageDark'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-scientific-primary' : 'text-slate-300'}`} />
                    <span>{src.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-scientific-border flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-scientific-muted hover:text-scientific-text"
          >
            Cancel
          </button>
          <button
            onClick={handleExecute}
            className="flex items-center gap-1.5 px-5 py-2 rounded-academic bg-scientific-primary hover:bg-scientific-primaryHover text-white font-semibold text-xs shadow-subtle transition-all"
          >
            <span>Execute Grounded Review</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
