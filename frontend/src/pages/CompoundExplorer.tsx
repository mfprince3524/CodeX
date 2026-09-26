import React, { useState, useEffect } from 'react';
import { CompoundDetail } from '../types';
import { api } from '../services/api';
import { MoleculeViewer } from '../components/molecule/MoleculeViewer';
import {
  Pill,
  Search,
  ExternalLink,
  Target,
  Sparkles,
  Layers,
  ChevronRight,
  Activity,
  Award
} from 'lucide-react';

interface CompoundExplorerProps {
  onStartResearch: (query: string) => void;
}

export const CompoundExplorer: React.FC<CompoundExplorerProps> = ({ onStartResearch }) => {
  const [compounds, setCompounds] = useState<CompoundDetail[]>([]);
  const [selectedCompound, setSelectedCompound] = useState<CompoundDetail | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCompounds();
  }, []);

  const loadCompounds = async (q?: string) => {
    setIsLoading(true);
    try {
      const data = await api.getCompounds(q);
      setCompounds(data);
      if (data.length > 0 && !selectedCompound) {
        setSelectedCompound(data[0]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCompounds(searchQuery);
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-scientific-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-scientific-text">
              Compound Intelligence & Bioactivity Explorer
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-scientific-primary border border-blue-200 rounded-full">
              EMBL-EBI ChEMBL Live
            </span>
          </div>
          <p className="text-xs text-scientific-muted mt-1">
            Explore chemical structures, canonical SMILES, validated molecular targets, and binding constants.
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="relative w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-scientific-muted" />
          <input
            type="text"
            placeholder="Search compound name, targets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-scientific-border bg-white text-scientific-text focus:outline-none focus:ring-2 focus:ring-scientific-primary/20"
          />
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Compounds Directory Sidebar */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-scientific-muted block">
            Indexed Small Molecules & Biologics ({compounds.length})
          </span>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {compounds.map((comp) => {
              const isSelected = selectedCompound?.id === comp.id;
              return (
                <div
                  key={comp.id}
                  onClick={() => setSelectedCompound(comp)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-scientific-blueLight/60 border-scientific-primary shadow-xs'
                      : 'bg-white border-scientific-border hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-scientific-text">{comp.name}</span>
                    <span className="font-mono text-[10px] text-scientific-primary">{comp.chembl_id}</span>
                  </div>
                  <div className="text-[11px] text-scientific-muted truncate">
                    {comp.drug_type} • {comp.molecular_weight ? `${comp.molecular_weight} g/mol` : 'MW N/A'}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {comp.targets.slice(0, 2).map((t, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 text-[9px] font-medium bg-slate-100 rounded text-slate-700">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Compound Intelligence Panel */}
        {selectedCompound ? (
          <div className="lg:col-span-2 space-y-6">
            <MoleculeViewer
              name={selectedCompound.name}
              smiles={selectedCompound.smiles}
              molecularFormula={selectedCompound.molecular_formula}
              molecularWeight={selectedCompound.molecular_weight}
              targets={selectedCompound.targets}
            />

            <div className="glass-card p-6 rounded-2xl border border-scientific-border space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-scientific-text">
                    {selectedCompound.name}
                  </h2>
                  <span className="text-xs font-semibold text-scientific-primary">
                    {selectedCompound.clinical_phase}
                  </span>
                </div>

                <button
                  onClick={() => onStartResearch(`What research exists on ${selectedCompound.name} and related clinical targets?`)}
                  className="px-4 py-2 bg-scientific-primary text-white font-bold text-xs rounded-xl shadow-premium shadow-scientific-primary/20 hover:bg-blue-600 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Deep Research</span>
                </button>
              </div>

              {/* Mechanism of Action */}
              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-scientific-muted block">
                  Mechanism of Action
                </span>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-medium">
                  {selectedCompound.mechanism_of_action}
                </p>
              </div>

              {/* Targets & IC50 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-scientific-secondary block">
                    Validated Biological Targets
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCompound.targets.map((t, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-semibold text-scientific-text">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-scientific-primary block">
                    Assay Bioactivity (IC50 / Kd)
                  </span>
                  <div className="space-y-1">
                    {selectedCompound.ic50_ranges.map((ic, idx) => (
                      <div key={idx} className="p-1.5 bg-white rounded border border-slate-200 font-mono text-[11px] text-slate-700">
                        {ic}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* External Provenance */}
              <div className="pt-4 border-t border-scientific-border flex items-center justify-between text-xs">
                <span className="text-scientific-muted">
                  Source Provenance: <strong className="text-scientific-text">{selectedCompound.provenance}</strong>
                </span>
                {selectedCompound.chembl_id && (
                  <a
                    href={`https://www.ebi.ac.uk/chembl/compound_report_card/${selectedCompound.chembl_id}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-scientific-primary font-bold hover:underline"
                  >
                    <span>View on EMBL-EBI ChEMBL</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 p-12 glass-card rounded-2xl text-center text-scientific-muted text-xs">
            Select a compound to inspect molecular structure and binding affinities.
          </div>
        )}
      </div>
    </div>
  );
};
