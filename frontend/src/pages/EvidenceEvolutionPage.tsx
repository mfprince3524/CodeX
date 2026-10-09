import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Sparkles,
  ExternalLink,
  Star,
  FileText,
  Activity,
  CheckCircle2,
  TrendingUp,
  FlaskConical,
  Award,
  ChevronRight,
  Filter,
  Layers,
  BookOpen,
  Calendar
} from 'lucide-react';
import type { EvidenceEvolutionTopic, EvidenceEvolutionNode } from '../types';
import { api } from '../services/api';

interface EvidenceEvolutionPageProps {
  onStartResearch: (query: string) => void;
  initialTopic?: string;
  onUpdateSearchQuery?: (query: string) => void;
}

export const EvidenceEvolutionPage: React.FC<EvidenceEvolutionPageProps> = ({
  onStartResearch,
  initialTopic,
  onUpdateSearchQuery
}) => {
  const [topics, setTopics] = useState<EvidenceEvolutionTopic[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>(initialTopic || '');
  const [selectedTopicId, setSelectedTopicId] = useState<string>(initialTopic || '');
  const [timeline, setTimeline] = useState<EvidenceEvolutionTopic | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<EvidenceEvolutionNode | null>(null);

  // Load available curated topics
  useEffect(() => {
    const loadTopics = async () => {
      try {
        const data = await api.getEvolutionTopics();
        setTopics(data);
      } catch (err) {
        console.error('Failed to load evolution topics', err);
      }
    };
    loadTopics();
  }, []);

  // Update when initialTopic prop changes
  useEffect(() => {
    if (initialTopic && initialTopic.trim()) {
      setSearchQuery(initialTopic.trim());
      setSelectedTopicId(initialTopic.trim());
    }
  }, [initialTopic]);

  const fetchTimeline = async (topicId: string) => {
    if (!topicId || !topicId.trim()) {
      setTimeline(null);
      return;
    }
    setIsLoading(true);
    try {
      const data = await api.getEvolutionTimeline(topicId.trim());
      setTimeline(data);
      if (data.timeline_nodes && data.timeline_nodes.length > 0) {
        setSelectedNode(data.timeline_nodes[data.timeline_nodes.length - 1]); // default to latest milestone
      }
    } catch (err) {
      console.error('Failed to fetch timeline for topic', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load timeline for selected topic
  useEffect(() => {
    if (selectedTopicId) {
      fetchTimeline(selectedTopicId);
    }
  }, [selectedTopicId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    if (onUpdateSearchQuery) {
      onUpdateSearchQuery(query);
    }
    setSelectedTopicId(query);
    fetchTimeline(query);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1 text-amber-500">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= rating ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
            }`}
          />
        ))}
        <span className="text-[11px] font-bold text-slate-700 ml-1">
          {rating}/5
        </span>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-7">
      {/* Header Banner */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[#00A896] font-semibold text-xs uppercase tracking-wider">
          <History className="w-4 h-4" />
          <span>Longitudinal Biomedical Knowledge Evolution</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1C2826] tracking-tight">
          Evidence Evolution Timeline ⭐⭐⭐⭐⭐
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
          Track the historical arc of biomedical breakthroughs from first discovery to clinical standard-of-care. 
          See how evidence strength evolved year-by-year through clinical trials, meta-analyses, and AI-assisted discoveries.
        </p>
      </div>

      {/* Topic Search & Selection Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search biomedical breakthrough (e.g. Olaparib, BRCA1, Metformin, EGFR, CRISPR)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00606B]"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !searchQuery.trim()}
            className="px-6 py-2.5 bg-[#00606B] hover:bg-[#004D56] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <History className="w-4 h-4" />
            )}
            <span>Track Evolution</span>
          </button>
        </form>

        <div className="space-y-2 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#00A896]" />
            Or Select a Curated Breakthrough Discovery Track
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {topics.map((t) => {
              const isSelected = t.topic_id === selectedTopicId;
              return (
                <button
                  key={t.topic_id}
                  onClick={() => {
                    setSelectedTopicId(t.topic_id);
                    setSearchQuery(t.title);
                    if (onUpdateSearchQuery) {
                      onUpdateSearchQuery(t.title);
                    }
                    fetchTimeline(t.topic_id);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#002B2E] border-[#002B2E] text-white shadow-md'
                      : 'bg-[#F9FCFC] border-slate-200 hover:border-[#00A896] hover:bg-[#EBF7F6] text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {t.title}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-[#00D1C1]/20 text-[#00D1C1]' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {t.milestones_count || t.timeline_nodes?.length || 6} Stages
                    </span>
                  </div>
                  <p className={`text-[11px] line-clamp-2 ${isSelected ? 'text-[#A3C6C6]' : 'text-slate-500'}`}>
                    {t.subtitle || t.summary_of_evolution}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Timeline View */}
      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4">
          <div className="inline-block w-8 h-8 border-3 border-[#00A896] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500">Loading historical evidence milestones...</p>
        </div>
      ) : timeline ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Vertical Discovery Tree (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {timeline.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Chronological progression from {timeline.timeline_nodes[0]?.year} to {timeline.timeline_nodes[timeline.timeline_nodes.length - 1]?.year}
                  </p>
                </div>
                <button
                  onClick={() => onStartResearch(timeline.title)}
                  className="px-3 py-1.5 bg-[#00A896] hover:bg-[#028090] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Synthesize Arc</span>
                </button>
              </div>

              {/* Discovery Timeline Tree Nodes */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-teal-400 before:via-teal-600 before:to-emerald-500">
                {timeline.timeline_nodes.map((node, idx) => {
                  const isSelected = selectedNode?.year === node.year;
                  const isLatest = idx === timeline.timeline_nodes.length - 1;

                  return (
                    <div
                      key={node.year}
                      onClick={() => setSelectedNode(node)}
                      className={`relative cursor-pointer transition-all rounded-xl p-4 border ${
                        isSelected
                          ? 'bg-[#EBF7F6] border-[#00A896] ring-2 ring-[#00A896]/20 shadow-md'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Timeline Node Dot */}
                      <div
                        className={`absolute -left-[30px] top-4 w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                          isSelected
                            ? 'bg-[#00A896] border-white ring-4 ring-[#00A896]/30'
                            : isLatest
                            ? 'bg-emerald-500 border-white'
                            : 'bg-slate-300 border-white'
                        }`}
                      >
                        {isLatest && <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
                      </div>

                      {/* Card Content */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 bg-[#002B2E] text-[#00D1C1] font-mono text-xs font-bold rounded-md">
                              {node.year}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              {node.title}
                            </span>
                          </div>
                          {renderStars(node.evidence_strength_stars)}
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {node.description}
                        </p>

                        {/* Evidence Badge Bar */}
                        <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-500 border-t border-slate-100/80">
                          <div className="flex items-center gap-1 font-medium">
                            <FileText className="w-3 h-3 text-[#00A896]" />
                            <span>{node.publications_count.toLocaleString()} papers</span>
                          </div>
                          <div className="flex items-center gap-1 font-medium">
                            <Activity className="w-3 h-3 text-emerald-600" />
                            <span>{node.clinical_trials_count} clinical trials</span>
                          </div>
                          {node.meta_analyses_count > 0 && (
                            <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded border border-emerald-200">
                              {node.meta_analyses_count} Meta-analyses
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Deep-Dive Milestone Details (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {selectedNode ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5 sticky top-20">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-[#002B2E] text-[#00D1C1] font-mono text-sm font-bold rounded-lg">
                      {selectedNode.year}
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Milestone Deep Dive
                    </span>
                  </div>
                  {renderStars(selectedNode.evidence_strength_stars)}
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {selectedNode.title}
                  </h3>
                  <div className="inline-block px-2 py-0.5 bg-[#F0FDF4] text-emerald-800 text-[11px] font-semibold rounded border border-emerald-200">
                    {selectedNode.evidence_strength_label}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2">
                    {selectedNode.description}
                  </p>
                </div>

                {/* Evidence Strength Breakdown Meter */}
                <div className="bg-[#F8FAFA] rounded-xl p-4 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-[#00A896]" />
                      Evidence Strength Index
                    </span>
                    <span className="text-slate-900 font-bold">
                      {selectedNode.evidence_strength_stars * 20}% Cumulative
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-400 via-teal-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${selectedNode.evidence_strength_stars * 20}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600">
                    <div>
                      <span className="text-slate-400 block">Publications:</span>
                      <span className="font-bold text-slate-800">
                        {selectedNode.publications_count.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Clinical Trials:</span>
                      <span className="font-bold text-slate-800">
                        {selectedNode.clinical_trials_count}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Meta-Analyses:</span>
                      <span className="font-bold text-slate-800">
                        {selectedNode.meta_analyses_count}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Era:</span>
                      <span className="font-bold text-slate-800">
                        {selectedNode.era_label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Breakthrough Paper & Citations */}
                <div className="space-y-3 text-xs">
                  {selectedNode.key_breakthrough_paper && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Landmark Publication
                      </span>
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-800 text-[11.5px] leading-snug">
                          {selectedNode.key_breakthrough_paper}
                        </p>
                      </div>

                      {selectedNode.pmid && (
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                          <span className="text-[10.5px] text-slate-400 font-mono">
                            PMID: {selectedNode.pmid} {selectedNode.doi ? `• DOI: ${selectedNode.doi}` : ''}
                          </span>
                          <a
                            href={`https://pubmed.ncbi.nlm.nih.gov/${selectedNode.pmid}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#00A896] hover:text-[#028090] font-semibold text-[11px] flex items-center gap-1"
                          >
                            <span>Open in PubMed</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedNode.tags && selectedNode.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedNode.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-[#E6F7F5] text-[#00606B] text-[10.5px] font-medium rounded-md border border-[#C6ECE8]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => onStartResearch(`${timeline.title} ${selectedNode.title} ${selectedNode.year}`)}
                  className="w-full py-2.5 bg-[#002B2E] hover:bg-[#003B3F] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#00D1C1]" />
                  <span>Explore {selectedNode.year} Literature & Trials</span>
                </button>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-xs">
                Select a milestone from the timeline on the left to inspect its evidence strength breakdown.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <History className="w-8 h-8 text-[#00A896] mx-auto opacity-70" />
          <h3 className="text-sm font-bold text-slate-800">Ready to Explore Longitudinal Evidence</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Search any drug, gene, or disease above, or click one of the curated discovery tracks to trace its longitudinal evidence evolution from early discovery to modern clinical trials.
          </p>
        </div>
      )}
    </div>
  );
};
