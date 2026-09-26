import React, { useState, useEffect } from 'react';
import { DiseaseDetail } from '../types';
import { api } from '../services/api';
import {
  Dna,
  Search,
  ExternalLink,
  Sparkles,
  Pill,
  TrendingUp,
  Activity,
  BarChart2,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface DiseaseExplorerProps {
  onStartResearch: (query: string) => void;
}

export const DiseaseExplorer: React.FC<DiseaseExplorerProps> = ({ onStartResearch }) => {
  const [diseases, setDiseases] = useState<DiseaseDetail[]>([]);
  const [selectedDisease, setSelectedDisease] = useState<DiseaseDetail | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDiseases();
  }, []);

  const loadDiseases = async (q?: string) => {
    setIsLoading(true);
    try {
      const data = await api.getDiseases(q);
      setDiseases(data);
      if (data.length > 0 && !selectedDisease) {
        setSelectedDisease(data[0]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadDiseases(searchQuery);
  };

  const chartData = selectedDisease
    ? Object.entries(selectedDisease.research_volume_annual).map(([year, count]) => ({
        year,
        publications: count
      }))
    : [];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-scientific-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-scientific-text">
              Disease Pathology & Literature Volume Explorer
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
              MeSH & NCBI Indexed
            </span>
          </div>
          <p className="text-xs text-scientific-muted mt-1">
            Explore disease pathophysiology, annual peer-reviewed publication trends, and associated therapeutic classes.
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="relative w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-scientific-muted" />
          <input
            type="text"
            placeholder="Search disease name, MeSH..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-scientific-border bg-white text-scientific-text focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          />
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Diseases Directory */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-scientific-muted block">
            Indexed Pathology Profiles ({diseases.length})
          </span>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {diseases.map((d) => {
              const isSelected = selectedDisease?.id === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDisease(d)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-rose-50/60 border-rose-400 shadow-xs'
                      : 'bg-white border-scientific-border hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-scientific-text">{d.name}</span>
                    <span className="font-mono text-[10px] text-rose-600">{d.mesh_id}</span>
                  </div>
                  <div className="text-[11px] text-scientific-muted">
                    {d.category}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-semibold">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{d.active_trials_count} Active Trials</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Disease Intelligence Panel */}
        {selectedDisease ? (
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6 rounded-2xl border border-scientific-border space-y-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-scientific-text">
                      {selectedDisease.name}
                    </h2>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 rounded">
                      {selectedDisease.mesh_id}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-rose-600">
                    {selectedDisease.category}
                  </span>
                </div>

                <button
                  onClick={() => onStartResearch(`What research exists on ${selectedDisease.name} and current therapeutic approaches?`)}
                  className="px-4 py-2 bg-scientific-primary text-white font-bold text-xs rounded-xl shadow-premium shadow-scientific-primary/20 hover:bg-blue-600 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Deep Research</span>
                </button>
              </div>

              {/* Disease Overview */}
              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-scientific-muted block">
                  Pathology & Clinical Overview
                </span>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {selectedDisease.overview}
                </p>
              </div>

              {/* Pathophysiology */}
              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
                  Molecular Pathophysiology & Etiology
                </span>
                <p className="text-slate-700 leading-relaxed bg-rose-50/40 p-4 rounded-xl border border-rose-200">
                  {selectedDisease.pathophysiology}
                </p>
              </div>

              {/* Annual Publication Volume Chart (Recharts) */}
              <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-scientific-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-scientific-muted">
                      Annual Research Publication Volume (PubMed)
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600">
                    Consistent Growth
                  </span>
                </div>

                <div className="w-full h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748B' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '8px', fontSize: '12px' }}
                        formatter={(val: any) => [`${val.toLocaleString()} Publications`, 'Volume']}
                      />
                      <Bar dataKey="publications" fill="#0A5BFF" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Associated Compounds & Targets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-scientific-primary block">
                    Associated Therapeutics
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDisease.associated_compounds.map((c, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-semibold text-scientific-text">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-scientific-secondary block">
                    Key Biological Targets
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDisease.key_targets.map((t, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-semibold text-scientific-text">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 p-12 glass-card rounded-2xl text-center text-scientific-muted text-xs">
            Select a disease to inspect pathophysiology and literature metrics.
          </div>
        )}
      </div>
    </div>
  );
};
