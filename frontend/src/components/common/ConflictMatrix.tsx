import React from 'react';
import { ConflictRecord, AgreementStatus } from '../../types';
import { GitCompare, AlertCircle, HelpCircle, CheckCircle2, ChevronRight } from 'lucide-react';

interface ConflictMatrixProps {
  status: AgreementStatus;
  conflicts: ConflictRecord[];
  onOpenSourceDetail?: (sourceId: string) => void;
}

export const ConflictMatrix: React.FC<ConflictMatrixProps> = ({
  status,
  conflicts,
  onOpenSourceDetail
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'Mostly Consistent':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
          icon: CheckCircle2,
          desc: 'High concordance across published literature and preclinical models.'
        };
      case 'Mixed Evidence':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-700',
          icon: AlertCircle,
          desc: 'Divergence observed between observational human registries and interventional trials.'
        };
      case 'Conflicting Evidence':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-700',
          icon: AlertCircle,
          desc: 'Direct contradictory outcomes reported in peer-reviewed trials.'
        };
      default:
        return {
          bg: 'bg-slate-50 border-slate-200 text-slate-700',
          icon: HelpCircle,
          desc: 'Limited volume of indexed publications.'
        };
    }
  };

  const badge = getStatusBadge();
  const Icon = badge.icon;

  return (
    <div className="glass-card p-5 rounded-2xl border border-scientific-border space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-scientific-accent" />
          <span className="text-xs font-bold uppercase tracking-wider text-scientific-muted">
            Evidence Agreement & Conflict Detection
          </span>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
          <Icon className="w-3.5 h-3.5" />
          <span>{status}</span>
        </div>
      </div>

      <p className="text-xs text-scientific-muted leading-relaxed">
        {badge.desc}
      </p>

      {conflicts.length > 0 ? (
        <div className="space-y-3 pt-2">
          {conflicts.map((conf) => (
            <div key={conf.id} className="p-4 rounded-xl bg-slate-50/90 border border-slate-200/90 space-y-3">
              <h4 className="text-xs font-bold text-scientific-text flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                {conf.topic}
              </h4>

              {/* Side-by-side Evidence findings comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 shadow-2xs">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block tracking-wider">
                    Observation / Cohort Signal
                  </span>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {conf.finding_a}
                  </p>
                  <p className="text-[11px] text-scientific-muted font-mono italic pt-1 border-t border-slate-100">
                    Source: {conf.source_a}
                  </p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 shadow-2xs">
                  <span className="text-[10px] font-bold text-amber-700 uppercase block tracking-wider">
                    Interventional Trial Variance
                  </span>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {conf.finding_b}
                  </p>
                  <p className="text-[11px] text-scientific-muted font-mono italic pt-1 border-t border-slate-100">
                    Source: {conf.source_b}
                  </p>
                </div>
              </div>

              {/* Mechanistic Explanation */}
              <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-100 text-xs space-y-1 text-slate-700">
                <span className="text-[10px] font-bold uppercase text-scientific-primary tracking-wider block">
                  Plausible Scientific Explanation
                </span>
                <p className="leading-relaxed">
                  {conf.possible_explanation}
                </p>
              </div>

              <div className="text-[11px] text-slate-600 bg-amber-50/60 p-2.5 rounded-lg border border-amber-100">
                <strong>Clinical & Research Significance:</strong> {conf.clinical_significance}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 text-center bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs text-emerald-800 font-medium">
          No significant irreconcilable scientific conflicts identified across indexed clinical studies.
        </div>
      )}
    </div>
  );
};
