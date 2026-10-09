import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Layers,
  Bookmark,
  TrendingUp,
  FileText,
  Clock,
  ExternalLink,
  Plus,
  Check,
  Dna,
  ShieldCheck,
  GitCompare,
  Pill,
  BookOpen,
  ArrowRight,
  Activity,
  History,
  Database,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { api } from '../services/api';
import type { CitationItem, CompoundDetail } from '../types';

interface ResearchHomeOverviewProps {
  onNavigate: (tab: string) => void;
  onStartResearch: (query: string) => void;
  userName?: string;
  onOpenAuth?: () => void;
  initialQuery?: string;
  onUpdateSearchQuery?: (query: string) => void;
}

export const ResearchHomeOverview: React.FC<ResearchHomeOverviewProps> = ({
  onNavigate,
  onStartResearch,
  userName = "Farhan",
  onOpenAuth,
  initialQuery,
  onUpdateSearchQuery
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [isSearching, setIsSearching] = useState(false);
  const [liveSearchResults, setLiveSearchResults] = useState<CitationItem[]>([]);
  const [liveCompounds, setLiveCompounds] = useState<CompoundDetail[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const executeSearch = async (q: string) => {
    if (!q.trim()) return;
    if (onUpdateSearchQuery) {
      onUpdateSearchQuery(q.trim());
    }
    setIsSearching(true);
    setHasSearched(true);

    try {
      // Fetch live real data from PubMed/Europe PMC and ChEMBL
      const [litRes, compRes] = await Promise.allSettled([
        api.searchLiterature({ query: q.trim(), limit: 6 }),
        api.getCompounds(q.trim())
      ]);

      if (litRes.status === 'fulfilled' && litRes.value?.papers) {
        setLiveSearchResults(litRes.value.papers);
      } else {
        setLiveSearchResults([]);
      }

      if (compRes.status === 'fulfilled' && Array.isArray(compRes.value)) {
        setLiveCompounds(compRes.value.slice(0, 3));
      } else {
        setLiveCompounds([]);
      }
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  const sampleSearches = [
    "Metformin longevity AMPK",
    "Olaparib BRCA synthetic lethality",
    "Semaglutide cardiovascular risk",
    "SGLT2 inhibitors chronic kidney disease",
    "EGFR T790M resistance Osimertinib"
  ];

  const flagshipCards = [
    {
      id: 'simulator',
      title: 'AI Future Life Simulator',
      subtitle: 'Predict 1, 3, 5, 10-Year Multi-Scenario Health',
      description: 'Simulate health outcomes based on lifestyle changes, lab reports, and habit adjustments with live risk meters.',
      icon: Sparkles,
      tag: '⭐ Signature Engine',
      bgGradient: 'from-[#002B2E] to-[#054347]',
      accentColor: 'text-[#00D1C1]',
      borderHover: 'hover:border-[#00D1C1]',
      onClick: () => onNavigate('simulator')
    },
    {
      id: 'evolution',
      title: 'Evidence Evolution Timeline',
      subtitle: '1994–2026 Discovery Arc & Star Ratings',
      description: 'Track how scientific breakthroughs progressed from initial discovery to clinical validation with 1-to-5 star strength ratings.',
      icon: History,
      tag: '⭐⭐⭐⭐⭐ 1994-2026',
      bgGradient: 'from-[#023E45] to-[#0A545C]',
      accentColor: 'text-amber-400',
      borderHover: 'hover:border-amber-400',
      onClick: () => onNavigate('evolution')
    },
    {
      id: 'conflicts',
      title: 'Evidence Conflict Radar',
      subtitle: 'In Vitro vs Clinical Trial Disagreements',
      description: 'Analyze conflicting studies, experimental model divergences, and context-dependent outcomes with direct PubMed citations.',
      icon: GitCompare,
      tag: '3-Way Matrix',
      bgGradient: 'from-[#03343A] to-[#084950]',
      accentColor: 'text-emerald-400',
      borderHover: 'hover:border-emerald-400',
      onClick: () => onNavigate('conflicts')
    },
    {
      id: 'compounds',
      title: 'ChEMBL Molecule Explorer',
      subtitle: 'Bioactivity Assays & 2D Chemical Structures',
      description: 'Access real-world chemical structures (SMILES), IC50 binding metrics, and therapeutic mechanisms from EMBL-EBI ChEMBL.',
      icon: Pill,
      tag: 'ChEMBL Live API',
      bgGradient: 'from-[#012629] to-[#043E42]',
      accentColor: 'text-teal-300',
      borderHover: 'hover:border-teal-300',
      onClick: () => onNavigate('compounds')
    }
  ];

  return (
    <div className="max-w-[1360px] mx-auto py-7 px-3 sm:px-6 space-y-8">
      {/* Brand Hero Banner */}
      <div className="bg-gradient-to-r from-[#002B2E] via-[#003B3F] to-[#05464A] text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-[#0A4E54] relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D1C1]/20 border border-[#00D1C1]/40 text-[#00D1C1] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#00D1C1] animate-pulse"></span>
            <span>AI-Assisted Personalized Preventive Healthcare & Biomedical RAG</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            BioMind<span className="text-[#00D1C1]">Q</span> Intelligence Hub
          </h1>

          <p className="text-xs sm:text-sm text-[#B2D8D6] leading-relaxed">
            Predict future health trajectories across 1, 3, 5, and 10 years, simulate habit interventions, 
            and search real-world clinical datasets from NCBI PubMed, Europe PMC, and EMBL-EBI ChEMBL.
          </p>
        </div>

        {/* Floating Background Hexagons */}
        <div className="absolute right-4 -bottom-6 text-white/5 font-mono text-9xl select-none pointer-events-none hidden lg:block">
          ⬡
        </div>
      </div>

      {/* Live Dataset Search Engine */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Search className="w-4 h-4 text-[#00606B]" />
            Live Biomedical Data Search (NCBI PubMed & ChEMBL)
          </span>
          <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-medium">
            Live Connected APIs
          </span>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search diseases, genes (BRCA1, EGFR), drugs (Metformin, Olaparib), or lifestyle mechanisms..."
              className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00606B] focus:border-transparent transition-all shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-3 rounded-xl bg-[#00606B] hover:bg-[#004D56] text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shrink-0 shadow-md cursor-pointer disabled:opacity-50"
          >
            {isSearching ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Retrieve Real Data</span>
          </button>
        </form>

        {/* Quick Query Pills */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs pt-1">
          <span className="text-slate-400 font-medium text-[11px]">Popular Searches:</span>
          {sampleSearches.map((sq) => (
            <button
              key={sq}
              onClick={() => {
                setSearchQuery(sq);
                executeSearch(sq);
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-[#E0F5F4] hover:text-[#00606B] text-slate-700 rounded-lg text-[11px] font-medium transition-colors border border-slate-200 cursor-pointer"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Live Search Results Section (Renders when user searches) */}
      {hasSearched && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Live Retrieved Data for: <span className="text-[#00606B]">"{searchQuery}"</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Retrieved {liveSearchResults.length} peer-reviewed publications and {liveCompounds.length} chemical records from live databases.
              </p>
            </div>
            <button
              onClick={() => onNavigate('literature')}
              className="text-xs font-semibold text-[#00606B] hover:underline flex items-center gap-1"
            >
              <span>Open in Literature Explorer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Retrieved Publications List */}
          {liveSearchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveSearchResults.map((paper) => (
                <div
                  key={paper.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-[#00606B] hover:shadow-md transition-all space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 bg-[#002B2E] text-[#00D1C1] text-[10px] font-mono font-bold rounded">
                      {paper.pmid ? `PMID: ${paper.pmid}` : 'Record'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      {paper.year || '2025'} • {paper.journal}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    <a
                      href={paper.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#00606B] transition-colors inline-flex items-start gap-1"
                    >
                      <span>{paper.title}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                    </a>
                  </h3>

                  <p className="text-[11.5px] text-slate-600 line-clamp-2">
                    {paper.evidence_excerpt || paper.abstract || 'Peer-reviewed clinical evidence record.'}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px]">
                    <span className="text-slate-500 truncate max-w-[200px]">
                      {paper.authors?.slice(0, 2).join(', ')} et al.
                    </span>
                    <button
                      onClick={() => onStartResearch(paper.title)}
                      className="text-[#00606B] font-semibold hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-[#00A896]" />
                      <span>Synthesize</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
              No direct records found for this term. Try querying common biomedical terms like "Metformin", "Olaparib", or "Semaglutide".
            </div>
          )}
        </div>
      )}

      {/* 4 Flagship Feature Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Core BioMindQ Capabilities
          </h2>
          <span className="text-xs text-slate-500">
            Select an engine to start simulation or discovery
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {flagshipCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={card.onClick}
                className={`bg-gradient-to-br ${card.bgGradient} text-white rounded-2xl p-6 border border-slate-700/60 ${card.borderHover} transition-all shadow-md hover:shadow-xl cursor-pointer group space-y-4`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className={`w-5 h-5 ${card.accentColor}`} />
                  </div>
                  <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
                    {card.tag}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-[#00D1C1] transition-colors">
                    {card.title}
                  </h3>
                  <div className="text-xs font-semibold text-[#A3C6C6]">
                    {card.subtitle}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pt-1">
                    {card.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-semibold text-[#00D1C1]">
                  <span>Launch Module</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Verified Scientific Data Sources Footer Info */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
          Connected Authoritative Scientific Data Sources
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#00606B]" />
              <span>NCBI PubMed / MEDLINE</span>
            </div>
            <p className="text-[11px] text-slate-500">
              36M+ biomedical citations, peer-reviewed clinical trials, and structured abstracts.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#00606B]" />
              <span>Europe PMC</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Open access full-text articles and life sciences preprints.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-[#00606B]" />
              <span>EMBL-EBI ChEMBL</span>
            </div>
            <p className="text-[11px] text-slate-500">
              2.4M+ bioactive molecules, SMILES structures, and IC50 assay measurements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
