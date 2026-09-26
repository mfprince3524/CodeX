import React from 'react';
import {
  Compass,
  FileSearch,
  Dna,
  Pill,
  ShieldCheck,
  FolderHeart,
  TrendingUp,
  Activity,
  ArrowRight,
  Clock,
  Sparkles,
  ChevronRight,
  Layers,
  Award
} from 'lucide-react';

interface CommandCenterProps {
  onStartResearch: (query?: string) => void;
  onNavigate: (tab: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  onStartResearch,
  onNavigate
}) => {
  const trendingTopics = [
    {
      title: "AMPK Agonism & Alzheimer's Pathology",
      category: "Neurodegenerative / Metabolic",
      volume: "25.9k Annual Studies",
      compound: "Metformin (CHEMBL1431)",
      trend: "+14.2% YoY",
      query: "What research exists on metformin and Alzheimer's disease?"
    },
    {
      title: "BCR-ABL Kinase Inhibition Resistance",
      category: "Hematologic Oncology",
      volume: "3.9k Annual Studies",
      compound: "Imatinib (CHEMBL941)",
      trend: "+8.1% YoY",
      query: "What are the known targets and bioactivities of imatinib?"
    },
    {
      title: "PD-1 Checkpoint Blockade & Biomarkers",
      category: "Immuno-Oncology",
      volume: "16.2k Annual Studies",
      compound: "Pembrolizumab (CHEMBL3137343)",
      trend: "+22.5% YoY",
      query: "What clinical trials are investigating immunotherapy for melanoma?"
    },
    {
      title: "Synthetic Lethality in BRCA1/2 Tumors",
      category: "Precision Oncology",
      volume: "35.4k Annual Studies",
      compound: "Olaparib (CHEMBL474663)",
      trend: "+18.9% YoY",
      query: "What does literature and ChEMBL report on olaparib and BRCA1?"
    }
  ];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-scientific-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-scientific-text">
              Biomedical Intelligence Command Center
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
              4 Active Adapters
            </span>
          </div>
          <p className="text-xs text-scientific-muted mt-1">
            Real-time telemetry across PubMed, ChEMBL, ClinicalTrials.gov, and curated drug records.
          </p>
        </div>

        <button
          onClick={() => onStartResearch()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-scientific-primary text-white font-bold text-xs shadow-premium shadow-scientific-primary/20 hover:bg-blue-600 transition-all"
        >
          <FileSearch className="w-4 h-4" />
          <span>Launch New Research Session</span>
        </button>
      </div>

      {/* Quick Stat Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-scientific-border space-y-2">
          <div className="flex items-center justify-between text-scientific-muted">
            <span className="text-xs font-bold uppercase">Evidence Index</span>
            <Activity className="w-4 h-4 text-scientific-primary" />
          </div>
          <div className="text-2xl font-extrabold text-scientific-text">36.2M+</div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Live PubMed & MEDLINE syncing
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-scientific-border space-y-2">
          <div className="flex items-center justify-between text-scientific-muted">
            <span className="text-xs font-bold uppercase">Bioactivity Assays</span>
            <Pill className="w-4 h-4 text-scientific-secondary" />
          </div>
          <div className="text-2xl font-extrabold text-scientific-text">20.8M+</div>
          <span className="text-[11px] text-scientific-muted font-medium">
            EMBL-EBI ChEMBL Bioassay records
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-scientific-border space-y-2">
          <div className="flex items-center justify-between text-scientific-muted">
            <span className="text-xs font-bold uppercase">Clinical Protocols</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-scientific-text">480,000+</div>
          <span className="text-[11px] text-scientific-muted font-medium">
            ClinicalTrials.gov Global Registry
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-scientific-border space-y-2">
          <div className="flex items-center justify-between text-scientific-muted">
            <span className="text-xs font-bold uppercase">Saved Dossiers</span>
            <FolderHeart className="w-4 h-4 text-scientific-accent" />
          </div>
          <div className="text-2xl font-extrabold text-scientific-text">2 Active</div>
          <span className="text-[11px] text-scientific-primary font-semibold cursor-pointer" onClick={() => onNavigate('collections')}>
            View Collections →
          </span>
        </div>
      </div>

      {/* Trending Research & Benchmark Studies */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-scientific-primary" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-scientific-muted">
              Trending Biomedical Investigation Domains
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trendingTopics.map((topic, idx) => (
            <div
              key={idx}
              className="glass-card p-5 rounded-2xl border border-scientific-border hover:border-scientific-primary/40 transition-all shadow-xs flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                    {topic.category}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600">
                    {topic.trend}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-scientific-text group-hover:text-scientific-primary transition-colors">
                  {topic.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-scientific-muted">
                  <span>Lead Compound:</span>
                  <span className="font-semibold text-scientific-text">{topic.compound}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-scientific-border/80">
                <span className="text-[11px] text-scientific-muted font-mono">
                  {topic.volume}
                </span>
                <button
                  onClick={() => onStartResearch(topic.query)}
                  className="px-3 py-1.5 rounded-lg bg-scientific-blueLight text-scientific-primary font-bold text-xs hover:bg-scientific-primary hover:text-white transition-all flex items-center gap-1"
                >
                  <span>Launch Grounded Intelligence</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Direct Intelligence Module Access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => onNavigate('compounds')}
          className="glass-card p-6 rounded-2xl border border-scientific-border hover:border-scientific-primary shadow-xs transition-all cursor-pointer space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-scientific-blueLight text-scientific-primary flex items-center justify-center">
            <Pill className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-scientific-text">Compound Intelligence</h4>
          <p className="text-xs text-scientific-muted leading-relaxed">
            Examine molecular structures in 2D/3D, SMILES notations, verified target binding affinities, and IC50 ranges.
          </p>
        </div>

        <div
          onClick={() => onNavigate('diseases')}
          className="glass-card p-6 rounded-2xl border border-scientific-border hover:border-scientific-primary shadow-xs transition-all cursor-pointer space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Dna className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-scientific-text">Disease Pathophysiology</h4>
          <p className="text-xs text-scientific-muted leading-relaxed">
            Review annual research publication volumes, disease mechanisms, key targets, and associated experimental therapeutics.
          </p>
        </div>

        <div
          onClick={() => onNavigate('clinical-trials')}
          className="glass-card p-6 rounded-2xl border border-scientific-border hover:border-scientific-primary shadow-xs transition-all cursor-pointer space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-scientific-text">Clinical Trial Registry</h4>
          <p className="text-xs text-scientific-muted leading-relaxed">
            Search Phase 1-4 clinical protocols, recruitment status badges, intervention arms, and sponsor institutional profiles.
          </p>
        </div>
      </div>
    </div>
  );
};
