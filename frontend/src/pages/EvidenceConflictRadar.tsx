import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  Search,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  FlaskConical,
  Scale,
  Sparkles,
  Bookmark,
  UserCheck,
  ChevronRight,
  Filter
} from 'lucide-react';
import type { ConflictRadarAnalysis, StudyEvidenceItem } from '../types';
import { api } from '../services/api';

interface EvidenceConflictRadarProps {
  onStartResearch: (query: string) => void;
  initialQuery?: string;
  onUpdateSearchQuery?: (query: string) => void;
}

export const EvidenceConflictRadar: React.FC<EvidenceConflictRadarProps> = ({
  onStartResearch,
  initialQuery,
  onUpdateSearchQuery
}) => {
  const [query, setQuery] = useState(initialQuery || '');
  const [analysis, setAnalysis] = useState<ConflictRadarAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'supporting' | 'conflicting' | 'inconclusive'>('all');
  const [hasSearched, setHasSearched] = useState(false);

  const exampleTargets = [
    "Metformin in Alzheimer's Disease",
    "EGFR T790M vs C797S resistance Osimertinib",
    "PD-L1 expression as predictor for Pembrolizumab",
    "Olaparib in BRCA-proficient vs deficient tumors",
    "GLP-1 receptor agonists in neurodegeneration"
  ];

  const handleAnalyze = async (searchTopic?: string) => {
    const q = searchTopic !== undefined ? searchTopic : query;
    if (!q.trim()) return;
    if (onUpdateSearchQuery) {
      onUpdateSearchQuery(q.trim());
    }
    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await api.analyzeConflicts(q.trim());
      setAnalysis(res);
    } catch (err) {
      console.error('Conflict analysis failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      setQuery(initialQuery.trim());
      handleAnalyze(initialQuery.trim());
    }
  }, [initialQuery]);

  const getFilteredStudies = (): StudyEvidenceItem[] => {
    if (!analysis) return [];
    if (activeFilter === 'supporting') return analysis.supporting_studies;
    if (activeFilter === 'conflicting') return analysis.conflicting_studies;
    if (activeFilter === 'inconclusive') return analysis.inconclusive_studies;
    return [
      ...analysis.supporting_studies,
      ...analysis.conflicting_studies,
      ...analysis.inconclusive_studies
    ];
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-[#00606B] font-semibold text-xs uppercase tracking-wider">
          <GitCompare className="w-4 h-4" />
          <span>Biomedical Consensus Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Evidence Conflict Radar
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
          Search any drug, target, or disease controversy to compare supporting, opposing, and inconclusive clinical findings.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAnalyze();
          }}
          className="flex flex-col sm:flex-row gap-2.5"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search controversy (e.g. Metformin in Alzheimer's, Olaparib in BRCA-proficient)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00606B]"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-6 py-2.5 bg-[#00606B] hover:bg-[#004D56] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <GitCompare className="w-4 h-4" />
            )}
            <span>Analyze Evidence</span>
          </button>
        </form>

        {/* Suggestion tags */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs pt-1">
          <span className="text-slate-400 font-medium text-[11px]">Controversy Topics:</span>
          {exampleTargets.map((et) => (
            <button
              key={et}
              onClick={() => {
                setQuery(et);
                handleAnalyze(et);
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-[#E0F5F4] hover:text-[#00606B] text-slate-700 rounded-lg text-[11px] font-medium transition-colors border border-slate-200 cursor-pointer"
            >
              {et}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
          <div className="inline-block w-7 h-7 border-3 border-[#00606B] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Extracting and categorizing study findings from PubMed...</p>
        </div>
      ) : analysis ? (
        <div className="space-y-5">
          {/* Quick Result Summary Header */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Evidence Breakdown for: <span className="text-[#00606B]">{analysis.target_topic}</span>
              </h2>
              <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold rounded-lg self-start sm:self-auto">
                {analysis.overall_classification}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {analysis.consensus_summary}
            </p>
          </div>

          {/* 3-Way Category Filter Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Evidence ({analysis.citations_count})
            </button>
            <button
              onClick={() => setActiveFilter('supporting')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeFilter === 'supporting'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Supporting ({analysis.supporting_studies.length})</span>
            </button>
            <button
              onClick={() => setActiveFilter('conflicting')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeFilter === 'conflicting'
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Conflicting ({analysis.conflicting_studies.length})</span>
            </button>
            <button
              onClick={() => setActiveFilter('inconclusive')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeFilter === 'inconclusive'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Inconclusive ({analysis.inconclusive_studies.length})</span>
            </button>
          </div>

          {/* Evidence Cards List */}
          <div className="space-y-3">
            {getFilteredStudies().map((study) => {
              const isSup = study.classification === 'supporting';
              const isConf = study.classification === 'conflicting';

              const badgeColor = isSup
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : isConf
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-slate-50 text-slate-700 border-slate-200';

              const badgeLabel = isSup
                ? 'Supporting Evidence'
                : isConf
                ? 'Conflicting Finding'
                : 'Inconclusive Finding';

              return (
                <div
                  key={study.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 hover:border-[#00606B] transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 text-[10.5px] font-bold rounded border ${badgeColor}`}>
                          {badgeLabel}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {study.study_type} • {study.year}
                        </span>
                        <span className="text-[11px] font-bold text-[#00606B]">
                          {study.journal}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        <a
                          href={study.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#00606B] transition-colors inline-flex items-center gap-1.5"
                        >
                          <span>{study.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </a>
                      </h3>
                      {study.authors && (
                        <p className="text-[11px] text-slate-500">
                          {study.authors.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Model & Finding */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <div>
                      <span className="font-semibold text-slate-500 block text-[11px]">Experimental Model:</span>
                      <span className="text-slate-900 font-medium">{study.experimental_model}</span>
                    </div>
                    {study.dosage_or_concentration && (
                      <div>
                        <span className="font-semibold text-slate-500 block text-[11px]">Dose / Concentration:</span>
                        <span className="text-slate-900 font-medium">{study.dosage_or_concentration}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <span className="font-semibold text-slate-800 block">Reported Finding:</span>
                    <p className="text-slate-700 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                      {study.main_finding}
                    </p>
                  </div>

                  {/* Footnote */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                    <span className="font-mono">
                      {study.pmid ? `PMID: ${study.pmid}` : 'Source Record'} {study.doi ? `• DOI: ${study.doi}` : ''}
                    </span>
                    <a
                      href={study.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00606B] hover:underline font-semibold flex items-center gap-1"
                    >
                      <span>PubMed Paper</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <GitCompare className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">Ready to Analyze Controversies</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Type a drug, target, or disease topic above or click one of the suggested controversy topics to analyze scientific agreements and disagreements.
          </p>
        </div>
      )}
    </div>
  );
};
