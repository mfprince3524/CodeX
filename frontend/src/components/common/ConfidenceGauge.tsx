import React from 'react';
import { ConfidenceMetrics } from '../../types';
import { Info, CheckCircle2, AlertTriangle, Layers, Clock, Award } from 'lucide-react';

interface ConfidenceGaugeProps {
  metrics: ConfidenceMetrics;
}

export const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = ({ metrics }) => {
  const percentage = Math.round(metrics.overall_confidence * 100);
  
  // Color determination based on score
  const getColor = (val: number) => {
    if (val >= 80) return 'text-scientific-success border-emerald-300 bg-emerald-50';
    if (val >= 60) return 'text-scientific-warning border-amber-300 bg-amber-50';
    return 'text-scientific-danger border-rose-300 bg-rose-50';
  };

  return (
    <div className="glass-card p-5 rounded-2xl border border-scientific-border space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-scientific-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-scientific-muted">
            Evidence Confidence Analytics
          </span>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getColor(percentage)}`}>
          {metrics.label} ({percentage}%)
        </span>
      </div>

      {/* Progress Bar & Sub-factors */}
      <div className="space-y-2">
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-scientific-primary via-scientific-secondary to-emerald-500 transition-all duration-700 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-[11px] text-scientific-muted italic">
          {metrics.explanation}
        </p>
      </div>

      {/* Detailed metrics breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-scientific-border/80 text-xs">
        <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
          <span className="text-[10px] font-bold text-scientific-muted uppercase block">Sources</span>
          <span className="font-extrabold text-scientific-text text-sm">{metrics.relevant_sources_count} Indexed</span>
        </div>
        <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
          <span className="text-[10px] font-bold text-scientific-muted uppercase block">Diversity</span>
          <span className="font-extrabold text-scientific-text text-sm">{Math.round(metrics.source_diversity * 100)}% Multi-DB</span>
        </div>
        <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
          <span className="text-[10px] font-bold text-scientific-muted uppercase block">Directness</span>
          <span className="font-extrabold text-scientific-text text-sm">{Math.round(metrics.directness_score * 100)}% Primary</span>
        </div>
        <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
          <span className="text-[10px] font-bold text-scientific-muted uppercase block">Consistency</span>
          <span className="font-extrabold text-scientific-text text-sm">{Math.round(metrics.consistency_score * 100)}% Concordance</span>
        </div>
      </div>
    </div>
  );
};
