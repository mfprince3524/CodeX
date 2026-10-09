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
  timeline?: ResearchTimelineEvent[];
  events?: ResearchTimelineEvent[];
  onOpenCitation?: (marker: string) => void;
}

export const ResearchTimelineView: React.FC<ResearchTimelineViewProps> = ({
  timeline,
  events,
  onOpenCitation
}) => {
  const [filterType, setFilterType] = useState<string>('All');
  const items = events || timeline || [];

  const filteredEvents = items.filter((item) => {
    if (filterType === 'All') return true;
    if (filterType === 'Trials') return item.event_type.toLowerCase().includes('trial') || item.event_type.toLowerCase().includes('phase');
    if (filterType === 'Publications') return item.event_type.toLowerCase().includes('publication') || item.event_type.toLowerCase().includes('meta');
    if (filterType === 'Mechanism') return item.event_type.toLowerCase().includes('mechanism') || item.event_type.toLowerCase().includes('preclinical');
    return true;
  });

  return (
    <div className="bg-scientific-surface p-5 sm:p-6 rounded-academic border border-scientific-border space-y-6 shadow-subtle">
      {/* Header & Filter Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-scientific-border">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-scientific-primary" />
          <div>
            <h3 className="text-sm font-bold text-scientific-text">
              Interactive Research Timeline
            </h3>
            <p className="text-[11px] text-scientific-muted">
              Chronological progression from foundational discoveries to clinical investigations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-scientific-bg p-1 rounded-academic border border-scientific-border">
          {['All', 'Publications', 'Trials', 'Mechanism'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-3 py-1 text-xs font-semibold rounded transition-all ${
                filterType === f
                  ? 'bg-white text-scientific-primary shadow-subtle font-bold border border-scientific-border'
                  : 'text-scientific-muted hover:text-scientific-text'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Progression Stream */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-scientific-sageDark">
        {filteredEvents.map((evt) => (
          <div key={evt.id} className="relative group">
            {/* Timeline bullet dot */}
            <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-scientific-primary group-hover:scale-125 group-hover:bg-scientific-primary transition-all" />

            <div className="p-4 rounded-academic bg-scientific-bg hover:bg-white border border-scientific-border hover:border-scientific-sageDark transition-all space-y-2 shadow-subtle">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-scientific-sage text-scientific-text border border-scientific-sageDark/60">
                    {evt.year}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-scientific-surfaceSubtle text-scientific-muted border border-scientific-border">
                    {evt.event_type}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {evt.citation_marker && (
                    <button
                      onClick={() => onOpenCitation && onOpenCitation(evt.citation_marker!)}
                      className="px-2 py-0.5 text-[10px] font-semibold bg-white border border-scientific-border rounded text-scientific-primary"
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

              <p className="text-xs text-scientific-text/80 leading-relaxed font-normal">
                {evt.summary}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
