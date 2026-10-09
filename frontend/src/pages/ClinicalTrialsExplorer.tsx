import React, { useState, useEffect } from 'react';
import { ClinicalTrialDetail } from '../types';
import { api } from '../services/api';
import {
  ShieldCheck,
  Search,
  ExternalLink,
  Filter,
  Sparkles,
  Calendar,
  Building,
  Activity,
  Layers
} from 'lucide-react';

interface ClinicalTrialsExplorerProps {
  onStartResearch: (query: string) => void;
}

export const ClinicalTrialsExplorer: React.FC<ClinicalTrialsExplorerProps> = ({ onStartResearch }) => {
  const [trials, setTrials] = useState<ClinicalTrialDetail[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTrials();
  }, [selectedStatus]);

  const loadTrials = async (q?: string) => {
    setIsLoading(true);
    try {
      const data = await api.getClinicalTrials(
        q || searchQuery,
        undefined,
        selectedStatus === 'All' ? undefined : selectedStatus
      );
      setTrials(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadTrials(searchQuery);
  };

  const getStatusBadge = (status: string) => {
    if (status.toLowerCase().includes('recruiting')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (status.toLowerCase().includes('active')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (status.toLowerCase().includes('completed')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-scientific-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-scientific-text">
              Clinical Trial Protocol Registry
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
              ClinicalTrials.gov v2 REST
            </span>
          </div>
          <p className="text-xs text-scientific-muted mt-1">
            Search human interventional studies, multi-center trials, eligibility criteria, and sponsor organizations.
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="relative w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-scientific-muted" />
          <input
            type="text"
            placeholder="Search NCT ID, condition, drug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-scientific-border bg-white text-scientific-text focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </form>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold uppercase text-scientific-muted mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Status:
        </span>
        {['All', 'Recruiting', 'Active, not recruiting', 'Completed', 'Terminated'].map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              selectedStatus === st
                ? 'bg-scientific-primary text-white shadow-xs font-bold'
                : 'bg-white border border-scientific-border text-scientific-text hover:bg-slate-50'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Trials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {trials.map((trial) => (
          <div
            key={trial.nct_id}
            className="glass-card p-6 rounded-2xl border border-scientific-border hover:border-amber-400 transition-all shadow-xs flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-extrabold text-xs text-scientific-primary">
                  {trial.nct_id}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(trial.status)}`}>
                  {trial.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-scientific-text leading-snug group-hover:text-scientific-primary transition-colors">
                {trial.title}
              </h3>

              <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/90 space-y-2 text-xs text-slate-700">
                <div className="flex items-start justify-between">
                  <span className="text-scientific-muted font-medium">Phase:</span>
                  <span className="font-bold text-scientific-text">{trial.phase || 'Phase 2'}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-scientific-muted font-medium">Target Condition:</span>
                  <span className="font-semibold text-right max-w-[240px] text-slate-800">{trial.condition}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-scientific-muted font-medium">Intervention Arm:</span>
                  <span className="font-semibold text-right max-w-[240px] text-scientific-primary">{trial.intervention}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-scientific-muted font-medium">Lead Sponsor:</span>
                  <span className="font-medium text-right max-w-[240px] text-slate-700">{trial.sponsor}</span>
                </div>
              </div>

              {trial.eligibility_summary && (
                <p className="text-[11px] text-slate-600 italic">
                  <strong>Eligibility:</strong> {trial.eligibility_summary}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-scientific-border/80">
              <a
                href={trial.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-bold text-scientific-primary hover:underline"
              >
                <span>View on ClinicalTrials.gov</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => onStartResearch(`What is the clinical evidence and status of trial ${trial.nct_id} for ${trial.condition}?`)}
                className="px-3 py-1.5 bg-scientific-blueLight text-scientific-primary hover:bg-scientific-primary hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Synthesize Trial</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
