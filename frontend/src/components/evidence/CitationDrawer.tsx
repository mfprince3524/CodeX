import React from 'react';
import { CitationItem } from '../../types';
import {
  X,
  ExternalLink,
  BookOpen,
  Calendar,
  Building,
  CheckCircle,
  FolderPlus,
  FileCheck2,
  FileText,
  Bookmark,
  Share2
} from 'lucide-react';

interface CitationDrawerProps {
  isOpen: boolean;
  citation: CitationItem | null;
  onClose: () => void;
  onSaveToCollection?: (citation: CitationItem) => void;
}

export const CitationDrawer: React.FC<CitationDrawerProps> = ({
  isOpen,
  citation,
  onClose,
  onSaveToCollection
}) => {
  if (!isOpen || !citation) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-scientific-border shadow-modal flex flex-col justify-between animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-5 border-b border-scientific-border flex items-center justify-between bg-white">
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-1 text-xs font-bold text-scientific-text bg-scientific-sage border border-scientific-sageDark/60 rounded-academic">
            {citation.marker}
          </span>
          <div>
            <h3 className="text-sm font-bold text-scientific-text">
              Evidence Provenance Inspector
            </h3>
            <span className="text-[11px] font-semibold text-scientific-muted">
              {citation.source_type} Verified Record
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-scientific-muted hover:text-scientific-text rounded hover:bg-scientific-surfaceSubtle transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
        {/* Title */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-scientific-muted">
            Manuscript / Study Title
          </span>
          <h4 className="text-sm font-bold text-scientific-text leading-snug">
            {citation.title}
          </h4>
        </div>

        {/* Primary Evidence Excerpt Box */}
        <div className="p-4 rounded-academic bg-scientific-bg border border-scientific-border space-y-2">
          <div className="flex items-center gap-1.5 text-scientific-primary font-bold text-[11px]">
            <FileCheck2 className="w-4 h-4" />
            <span>Direct Scientific Evidence Excerpt</span>
          </div>
          <p className="text-scientific-text leading-relaxed font-normal">
            "{citation.evidence_excerpt}"
          </p>
        </div>

        {/* Why this matters */}
        {citation.why_it_matters && (
          <div className="p-3.5 rounded-academic bg-scientific-sage/50 border border-scientific-sageDark/60 space-y-1 text-scientific-text">
            <span className="text-[10px] font-bold uppercase tracking-wider text-scientific-primary block">
              Why this evidence matters
            </span>
            <p className="leading-relaxed">
              {citation.why_it_matters}
            </p>
          </div>
        )}

        {/* Metadata Details */}
        <div className="space-y-2.5 bg-scientific-surfaceSubtle p-4 rounded-academic border border-scientific-border text-scientific-text">
          <div className="flex items-start justify-between">
            <span className="text-scientific-muted font-medium">Study Methodology:</span>
            <span className="font-semibold text-right max-w-[220px]">
              {citation.study_type}
            </span>
          </div>

          <div className="flex items-start justify-between">
            <span className="text-scientific-muted font-medium">Authors:</span>
            <span className="font-normal text-right max-w-[220px]">
              {citation.authors.join(', ')}
            </span>
          </div>

          {citation.journal && (
            <div className="flex items-center justify-between">
              <span className="text-scientific-muted font-medium">Journal:</span>
              <span className="font-bold text-scientific-primary">{citation.journal}</span>
            </div>
          )}

          {citation.publication_date && (
            <div className="flex items-center justify-between">
              <span className="text-scientific-muted font-medium">Published:</span>
              <span className="font-mono">{citation.publication_date}</span>
            </div>
          )}

          {/* Identifiers */}
          <div className="pt-2 border-t border-scientific-border flex items-center justify-between text-[11px] font-mono">
            {citation.pmid && (
              <div>
                <span className="text-scientific-muted font-sans font-bold">PMID: </span>
                <span className="text-scientific-text font-bold">{citation.pmid}</span>
              </div>
            )}
            {citation.doi && (
              <div>
                <span className="text-scientific-muted font-sans font-bold">DOI: </span>
                <span className="text-scientific-text">{citation.doi}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-scientific-border bg-white flex items-center gap-3">
        <a
          href={citation.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-academic bg-scientific-primary hover:bg-scientific-primaryHover text-white font-semibold text-xs shadow-subtle transition-all"
        >
          <span>Open Verified Source</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        {onSaveToCollection && (
          <button
            onClick={() => onSaveToCollection(citation)}
            title="Add to Research Collection"
            className="p-2 rounded-academic border border-scientific-border text-scientific-text hover:bg-scientific-surfaceSubtle transition-colors flex items-center justify-center"
          >
            <Bookmark className="w-4 h-4 text-scientific-primary" />
          </button>
        )}
      </div>
    </div>
  );
};
