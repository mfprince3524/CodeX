import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Filter,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Calendar,
  Layers,
  ArrowUpDown,
  Download,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Building2,
  Sparkles
} from 'lucide-react';
import type { CitationItem, LiteratureSearchRequest } from '../types';
import { api } from '../services/api';

interface LiteratureSearchPageProps {
  onStartResearch: (query: string) => void;
  onSaveCitation?: (citation: CitationItem) => void;
}

export const LiteratureSearchPage: React.FC<LiteratureSearchPageProps> = ({
  onStartResearch,
  onSaveCitation
}) => {
  const [query, setQuery] = useState('metformin AMPK activation');
  const [yearStart, setYearStart] = useState<number | undefined>(undefined);
  const [yearEnd, setYearEnd] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'relevance' | 'date_desc'>('relevance');
  const [papers, setPapers] = useState<CitationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedAbstracts, setExpandedAbstracts] = useState<Record<string, boolean>>({});
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const sampleQueries = [
    'metformin AMPK activation',
    'EGFR C797S resistance non-small cell lung cancer',
    'pembrolizumab PD-L1 biomarker response melanoma',
    'olaparib BRCA homologous recombination deficiency',
    'microglial pyroptosis neurodegeneration'
  ];

  const handleSearch = async (overrideQuery?: string) => {
    const q = overrideQuery !== undefined ? overrideQuery : query;
    if (!q.trim()) return;
    setIsLoading(true);
    try {
      const res = await api.searchLiterature({
        query: q,
        year_start: yearStart,
        year_end: yearEnd,
        sort_by: sortBy,
        limit: 15
      });
      setPapers(res.papers || []);
    } catch (err) {
      console.error('Literature search failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleSearch('metformin AMPK activation');
  }, [sortBy]);

  const toggleAbstract = (id: string) => {
    setExpandedAbstracts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = async (paper: CitationItem) => {
    setSavedIds(prev => ({ ...prev, [paper.id]: true }));
    if (onSaveCitation) {
      onSaveCitation(paper);
    }
    const collections = await api.getCollections();
    if (collections.length > 0) {
      await api.addToCollection(collections[0].id, {
        item_type: 'paper',
        title: paper.title,
        reference_id: paper.pmid || paper.id,
        metadata: {
          journal: paper.journal,
          year: paper.year,
          doi: paper.doi,
          pmid: paper.pmid
        },
        notes: paper.why_it_matters || 'Saved from Literature Search'
      });
    }
  };

  const handleCopyCitation = (paper: CitationItem) => {
    const text = `${paper.authors.join(', ')} (${paper.year || 2024}). ${paper.title}. ${paper.journal || 'Biomedical Journal'}. ${paper.pmid ? `PMID: ${paper.pmid}` : ''} ${paper.doi ? `https://doi.org/${paper.doi}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(paper.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-scientific-primary font-semibold text-xs uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Biomedical Literature Search</span>
        </div>
        <h1 className="text-2xl font-bold text-scientific-text tracking-tight">
          Explore Peer-Reviewed Publications
        </h1>
        <p className="text-xs text-scientific-muted leading-relaxed max-w-2xl">
          Retrieve peer-reviewed scientific studies and meta-analyses directly from NCBI PubMed / MEDLINE and Europe PMC with grounded abstracts and verified metadata.
        </p>
      </div>

      {/* Search Bar & Filters */}
      <div className="bg-scientific-surface border border-scientific-border rounded-academic p-4 shadow-subtle space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row gap-2.5"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-scientific-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search literature by gene, target, compound, disease, or PMID..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-academic border border-scientific-border bg-scientific-bg text-scientific-text focus:outline-none focus:ring-1 focus:ring-scientific-primary focus:border-scientific-primary"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2 bg-scientific-primary hover:bg-scientific-primaryHover text-white text-xs font-semibold rounded-academic transition-colors flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
            <span>Search Literature</span>
          </button>
        </form>

        {/* Example prompts */}
        <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
          <span className="text-scientific-muted font-medium">Try:</span>
          {sampleQueries.map((sq) => (
            <button
              key={sq}
              onClick={() => {
                setQuery(sq);
                handleSearch(sq);
              }}
              className="px-2 py-0.5 bg-scientific-bg hover:bg-scientific-sage text-scientific-text rounded border border-scientific-border transition-colors truncate max-w-xs"
            >
              {sq}
            </button>
          ))}
        </div>

        {/* Filter controls */}
        <div className="pt-3 border-t border-scientific-border flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-scientific-muted" />
              <span className="text-scientific-muted">Years:</span>
              <input
                type="number"
                placeholder="From (e.g. 2018)"
                value={yearStart || ''}
                onChange={(e) => setYearStart(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-24 px-2 py-1 text-[11px] rounded border border-scientific-border bg-scientific-bg text-scientific-text"
              />
              <span className="text-scientific-muted">-</span>
              <input
                type="number"
                placeholder="To (e.g. 2026)"
                value={yearEnd || ''}
                onChange={(e) => setYearEnd(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-24 px-2 py-1 text-[11px] rounded border border-scientific-border bg-scientific-bg text-scientific-text"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-scientific-muted" />
            <span className="text-scientific-muted">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'relevance' | 'date_desc')}
              className="px-2.5 py-1 text-[11px] rounded border border-scientific-border bg-scientific-bg text-scientific-text focus:outline-none"
            >
              <option value="relevance">Most Relevant</option>
              <option value="date_desc">Newest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-scientific-muted px-1">
        <span>
          Showing <strong className="text-scientific-text">{papers.length}</strong> peer-reviewed records
        </span>
        <span>Sources: NCBI PubMed & Europe PMC</span>
      </div>

      {/* Results List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-scientific-surface border border-scientific-border rounded-academic p-5 animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              <div className="h-12 bg-gray-50 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : papers.length === 0 ? (
        <div className="bg-scientific-surface border border-scientific-border rounded-academic p-12 text-center space-y-3">
          <BookOpen className="w-8 h-8 text-scientific-muted mx-auto" />
          <h3 className="text-sm font-semibold text-scientific-text">No publications retrieved</h3>
          <p className="text-xs text-scientific-muted max-w-md mx-auto">
            Try adjusting your search terms or expanding the publication year filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {papers.map((paper, idx) => {
            const isExpanded = expandedAbstracts[paper.id];
            const isSaved = savedIds[paper.id];
            const isCopied = copiedId === paper.id;

            return (
              <article
                key={paper.id || idx}
                className="bg-scientific-surface border border-scientific-border rounded-academic p-5 shadow-subtle hover:border-scientific-sageDark transition-all space-y-3"
              >
                {/* Top badges & actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-scientific-sage text-scientific-text font-semibold text-[10px] rounded border border-scientific-sageDark/60">
                      {paper.marker || `[${idx + 1}]`}
                    </span>
                    <span className="px-2 py-0.5 bg-scientific-surfaceSubtle text-scientific-text text-[10px] font-medium rounded border border-scientific-border">
                      {paper.study_type || 'Peer-Reviewed Study'}
                    </span>
                    {paper.year && (
                      <span className="text-[11px] text-scientific-muted font-medium">
                        {paper.year}
                      </span>
                    )}
                    {paper.journal && (
                      <span className="text-[11px] font-semibold text-scientific-primary truncate max-w-xs">
                        {paper.journal}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCopyCitation(paper)}
                      title="Copy Citation"
                      className="p-1.5 text-scientific-muted hover:text-scientific-text hover:bg-scientific-surfaceSubtle rounded border border-scientific-border transition-colors text-[11px]"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileText className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleSave(paper)}
                      title="Save to Research"
                      className={`p-1.5 rounded border transition-colors ${
                        isSaved
                          ? 'bg-scientific-sage text-scientific-primary border-scientific-sageDark'
                          : 'text-scientific-muted hover:text-scientific-text hover:bg-scientific-surfaceSubtle border-scientific-border'
                      }`}
                    >
                      {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => onStartResearch(paper.title)}
                      title="Analyze with AI RAG Assistant"
                      className="flex items-center gap-1 px-2.5 py-1 bg-scientific-sage text-scientific-text hover:bg-scientific-sageDark/60 text-[10.5px] font-medium rounded border border-scientific-sageDark/60 transition-colors"
                    >
                      <Sparkles className="w-3 h-3 text-scientific-primary" />
                      <span>Synthesize</span>
                    </button>
                  </div>
                </div>

                {/* Article Title */}
                <h2 className="text-sm sm:text-base font-semibold text-scientific-text leading-snug">
                  <a
                    href={paper.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-scientific-primary transition-colors flex items-start gap-1.5"
                  >
                    <span>{paper.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-scientific-muted shrink-0 mt-1" />
                  </a>
                </h2>

                {/* Authors */}
                {paper.authors && paper.authors.length > 0 && (
                  <p className="text-[11.5px] text-scientific-muted">
                    {paper.authors.join(', ')}
                  </p>
                )}

                {/* Excerpt / Abstract Preview */}
                <div className="bg-scientific-bg rounded-academic p-3.5 border border-scientific-border text-xs text-scientific-text/90 leading-relaxed">
                  <p className="font-medium text-[11px] text-scientific-primary mb-1">
                    Key Reported Evidence:
                  </p>
                  <p>
                    {isExpanded && paper.abstract
                      ? paper.abstract
                      : paper.evidence_excerpt || paper.abstract || 'Abstract details available via primary PubMed link.'}
                  </p>

                  {paper.abstract && paper.abstract.length > 280 && (
                    <button
                      onClick={() => toggleAbstract(paper.id)}
                      className="mt-2 text-[11px] font-semibold text-scientific-primary hover:underline flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'Show less' : 'Read full abstract'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}
                </div>

                {/* Footer Identifiers */}
                <div className="flex items-center gap-4 text-[10.5px] text-scientific-muted pt-1">
                  {paper.pmid && (
                    <a
                      href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-scientific-primary font-mono"
                    >
                      PMID: {paper.pmid}
                    </a>
                  )}
                  {paper.doi && (
                    <a
                      href={`https://doi.org/${paper.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-scientific-primary font-mono truncate max-w-xs"
                    >
                      DOI: {paper.doi}
                    </a>
                  )}
                  <span className="ml-auto text-emerald-700 font-medium">
                    Peer-Reviewed Record
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
