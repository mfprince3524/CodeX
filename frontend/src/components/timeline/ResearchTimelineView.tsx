import React, { useState } from 'react';
import { ResearchTimelineEvent } from '../../types';
import {
  Calendar,
  Clock,
  BookOpen,
  ShieldCheck,
  ExternalLink,
  Filter,
  Layers
} from 'lucide-react';

interface ResearchTimelineViewProps {
  timeline: ResearchTimelineEvent[];
  onOpenCitation?: (marker: string) => void;
}

export const ResearchTimelineView: React.FC<ResearchTimelineViewProps> = ({
  timeline,
  onOpenCitation
}) => {
  const [filterType, setFilterType] = useState<string>('All');

  const filteredEvents = timeline.filter((item) => {
    if (filterType === 'All') return true;
    if (filterType === 'Trials') return item.event_type.toLowerCase().includes('trial');
    if (filterType === 'Publications') return item.event_type.toLowerCase().includes('publication') || item.event_type.toLowerCase().includes('meta');
    if (filterType === 'Mechanism') return item.event_type.toLowerCase().includes('mechanism') || item.event_type.toLowerCase().includes('preclinical');
    return true;
  });

  return (
    <div className="glass-card p-6 rounded-2xl border border-scientific-border space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-scientific-border">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-scientific-primary" />
          <div>
            <h3 className="text-sm font-bold text-scientific-text">
              Interactive Research Timeline
            </h3>
            <p className="text-[11px] text-scientific-muted">
              Chronological progression from preclinical discoveries to clinical investigations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {['All', 'Publications', 'Trials', 'Mechanism'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                filterType === f
                  ? 'bg-white text-scientific-primary shadow-xs font-bold'
                  : 'text-scientific-muted hover:text-scientific-text'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Progression Stream */}
      <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-scientific-primary before:via-scientific-secondary before:to-scientific-accent">
        {filteredEvents.map((evt, idx) => (
          <div key={evt.id} className="relative group">
            {/* Timeline bullet dot */}
            <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-scientific-primary group-hover:scale-125 group-hover:bg-scientific-primary transition-all shadow-xs" />

            <div className="p-4 rounded-xl bg-slate-50/80 hover:bg-white border border-slate-200/90 hover:border-scientific-primary/30 transition-all shadow-xs space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-extrabold bg-scientific-blueLight text-scientific-primary border border-blue-200">
                    {evt.year}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-200/70 text-slate-700">
                    {evt.event_type}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {evt.citation_marker && (
                    <button
                      onClick={() => onOpenCitation && onOpenCitation(evt.citation_marker!)}
                      className="citation-chip"
                    >
                      {evt.citation_marker}
                    </button>
                  )}
                  {evt.source_url && (
                    <a
                      href={evt.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-scientific-muted hover:text-scientific-primary text-xs flex items-center gap-1 font-medium"
                    >
                      <span>{evt.source_name}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              <h4 className="text-xs font-bold text-scientific-text leading-snug">
                {evt.title}
              </h4>

              <p className="text-xs text-slate-600 leading-relaxed">
                {evt.summary}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
