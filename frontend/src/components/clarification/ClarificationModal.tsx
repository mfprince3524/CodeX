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
  query: string;
  clarificationData: ClarificationResponse | null;
  onProceedWithPlan: (plan: {
    focus: string;
    timeframe: string;
    evidence_type: string;
    sources: string[];
  }) => void;
  onClose: () => void;
}

export const ClarificationModal: React.FC<ClarificationModalProps> = ({
  isOpen,
  query,
  clarificationData,
  onProceedWithPlan,
  onClose
}) => {
  const [selectedFocus, setSelectedFocus] = useState<string>('All Dimensions (Recommended)');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('All Historical Literature');
  const [selectedSources, setSelectedSources] = useState<string[]>([
    'PubMed',
    'ChEMBL',
    'ClinicalTrials.gov',
    'DrugBank'
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
    onProceedWithPlan({
      focus: selectedFocus,
      timeframe: selectedTimeframe,
      evidence_type: 'All',
      sources: selectedSources
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="glass-card max-w-2xl w-full rounded-2xl p-6 shadow-2xl border border-scientific-border space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-scientific-blueLight text-scientific-primary border border-blue-200 flex items-center justify-center">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-scientific-text">
                  Smart Research Clarification
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-scientific-blueLight text-scientific-primary rounded border border-blue-200">
                  Precision Scoping
                </span>
              </div>
              <p className="text-xs text-scientific-muted">
                Refining research strategy for: <strong className="text-scientific-text">"{query}"</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-scientific-muted hover:text-scientific-text rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational Message */}
        <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-slate-700 leading-relaxed">
          {clarificationData?.clarification_message ||
            "Select specific biological dimensions or proceed with a comprehensive multi-source review."}
        </div>

        {/* Clarification Questions */}
        <div className="space-y-4 text-xs">
          {/* Dimension Selection */}
          <div className="space-y-2">
            <label className="font-bold text-scientific-text uppercase text-[11px] tracking-wider block">
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
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedFocus === opt.label
                      ? 'bg-scientific-blueLight/60 border-scientific-primary text-scientific-text shadow-xs font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-scientific-text">{opt.label}</div>
                  <div className="text-[11px] text-scientific-muted mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Timeframe */}
          <div className="space-y-2">
            <label className="font-bold text-scientific-text uppercase text-[11px] tracking-wider block">
              2. Literature Timeframe
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['All Historical Literature', 'Last 5 Years (2021-2026)', 'Last 10 Years (2016-2026)'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTimeframe(t)}
                  className={`p-2.5 rounded-xl border text-center text-xs font-medium transition-all ${
                    selectedTimeframe === t
                      ? 'bg-scientific-blueLight/60 border-scientific-primary text-scientific-primary font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Source Preference */}
          <div className="space-y-2">
            <label className="font-bold text-scientific-text uppercase text-[11px] tracking-wider block">
              3. Biomedical Data Sources
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'PubMed', label: 'PubMed / MEDLINE' },
                { id: 'ChEMBL', label: 'EMBL-EBI ChEMBL' },
                { id: 'ClinicalTrials.gov', label: 'ClinicalTrials.gov' },
                { id: 'DrugBank', label: 'DrugBank' }
              ].map((src) => {
                const isSelected = selectedSources.includes(src.id);
                return (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => toggleSource(src.id)}
                    className={`p-2.5 rounded-xl border text-center text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-scientific-blueLight/70 border-scientific-primary text-scientific-primary font-bold'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
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

        {/* Footer Actions */}
        <div className="pt-3 border-t border-scientific-border flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-scientific-muted hover:text-scientific-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExecute}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-scientific-primary text-white font-bold text-xs shadow-premium shadow-scientific-primary/20 hover:bg-blue-600 transition-all"
          >
            <span>Execute Grounded Research Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
