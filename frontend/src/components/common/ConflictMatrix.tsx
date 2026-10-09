import React from 'react';
import { ConflictRecord, AgreementStatus } from '../../types';
import { GitCompare, AlertCircle, HelpCircle, CheckCircle2, ChevronRight, Scale } from 'lucide-react';

interface ConflictMatrixProps {
  status?: AgreementStatus;
  conflicts: ConflictRecord[];
  onOpenSourceDetail?: (sourceId: string) => void;
}

export const ConflictMatrix: React.FC<ConflictMatrixProps> = ({
  status = 'Mixed Evidence',
  conflicts,
  onOpenSourceDetail
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'Mostly Consistent':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          icon: CheckCircle2,
          desc: 'High concordance across published literature and preclinical models.'
        };
      case 'Mixed Evidence':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-800',
          icon: AlertCircle,
          desc: 'Divergence observed between observational human registries and interventional trials.'
        };
      case 'Conflicting Evidence':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
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
    <div className="bg-scientific-surface p-5 rounded-academic border border-scientific-border space-y-4 shadow-subtle">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-scientific-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-scientific-muted">
            Evidence Agreement & Conflict Detection
          </span>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold border ${badge.bg}`}>
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
            <div key={conf.id} className="p-4 rounded-academic bg-scientific-bg border border-scientific-border space-y-3">
              <h4 className="text-xs font-bold text-scientific-text flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                {conf.topic}
              </h4>

              {/* Side-by-side Evidence findings comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded border border-scientific-border space-y-1.5">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block tracking-wider">
                    Observation / Primary Finding
                  </span>
                  <p className="text-scientific-text leading-relaxed">
                    {conf.finding_a}
                  </p>
                  <p className="text-[11px] text-scientific-muted font-mono pt-1 border-t border-scientific-border">
                    Source: {conf.source_a}
                  </p>
                </div>

                <div className="p-3 bg-white rounded border border-scientific-border space-y-1.5">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block tracking-wider">
                    Interventional / Discordant Finding
                  </span>
                  <p className="text-scientific-text leading-relaxed">
                    {conf.finding_b}
                  </p>
                  <p className="text-[11px] text-scientific-muted font-mono pt-1 border-t border-scientific-border">
                    Source: {conf.source_b}
                  </p>
                </div>
              </div>

              {/* Mechanistic Explanation */}
              <div className="p-3 bg-scientific-sage/50 rounded border border-scientific-sageDark/60 text-xs space-y-1 text-scientific-text">
                <span className="text-[10px] font-bold uppercase text-scientific-primary tracking-wider block">
                  Plausible Scientific Context & Model Differences
                </span>
                <p className="leading-relaxed">
                  {conf.possible_explanation}
                </p>
              </div>

              <div className="text-[11px] text-amber-900 bg-amber-50/70 p-2.5 rounded border border-amber-200">
                <strong>Clinical & Research Significance:</strong> {conf.clinical_significance}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 text-center bg-emerald-50/60 border border-emerald-200 rounded text-xs text-emerald-800 font-medium">
          No significant irreconcilable scientific conflicts identified across indexed clinical studies.
        </div>
      )}
    </div>
  );
};
