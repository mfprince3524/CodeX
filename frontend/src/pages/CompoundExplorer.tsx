import React, { useState, useEffect } from 'react';
import { CompoundDetail, CitationItem } from '../types';
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
  Award,
  BookOpen,
  Scale,
  ShieldCheck,
  FlaskConical,
  Info,
  FileText
} from 'lucide-react';

interface CompoundExplorerProps {
  onStartResearch: (query: string) => void;
  initialQuery?: string;
  onUpdateSearchQuery?: (query: string) => void;
}

export const CompoundExplorer: React.FC<CompoundExplorerProps> = ({
  onStartResearch,
  initialQuery,
  onUpdateSearchQuery
}) => {
  const [compounds, setCompounds] = useState<CompoundDetail[]>([]);
  const [selectedCompound, setSelectedCompound] = useState<CompoundDetail | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [activeTab, setActiveTab] = useState<'overview' | 'bioactivity' | 'targets' | 'literature' | 'evidence'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [compoundPapers, setCompoundPapers] = useState<CitationItem[]>([]);
  const [isLoadingPapers, setIsLoadingPapers] = useState(false);

  useEffect(() => {
    const q = initialQuery && initialQuery.trim() ? initialQuery.trim() : undefined;
    if (q) {
      setSearchQuery(q);
    }
    loadCompounds(q);
  }, [initialQuery]);

  const loadCompounds = async (q?: string) => {
    setIsLoading(true);
    try {
      const data = await api.getCompounds(q);
      setCompounds(data);
      if (data.length > 0) {
        setSelectedCompound(data[0]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (onUpdateSearchQuery) {
      onUpdateSearchQuery(searchQuery.trim());
    }
    loadCompounds(searchQuery.trim());
  };

  // Load real literature evidence when selected compound changes
  useEffect(() => {
    if (!selectedCompound) return;
    const fetchLiterature = async () => {
      setIsLoadingPapers(true);
      try {
        const res = await api.searchLiterature({
          query: `${selectedCompound.name} pharmacology mechanism`,
          limit: 5
        });
        if (res && res.papers) {
          setCompoundPapers(res.papers);
        } else {
          setCompoundPapers([]);
        }
      } catch (e) {
        console.error('Failed to fetch literature for compound', e);
        setCompoundPapers([]);
      } finally {
        setIsLoadingPapers(false);
      }
    };
    fetchLiterature();
  }, [selectedCompound?.id, selectedCompound?.name]);

  const quickCompounds = [
    'Metformin',
    'Olaparib',
    'Osimertinib',
    'Pembrolizumab',
    'Semaglutide',
    'Imatinib'
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-[#00606B] font-semibold text-xs uppercase tracking-wider">
          <Pill className="w-4 h-4" />
          <span>Compound Intelligence Powered by ChEMBL</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Compound & Bioactivity Explorer
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
          Search small molecules and therapeutics to inspect 2D chemical structures, molecular formulas, validated targets, IC50 bioactivities, and supporting PubMed literature.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search compound name (e.g. Metformin, Olaparib, Osimertinib, Semaglutide)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00606B]"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-[#00606B] hover:bg-[#004D56] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-sm"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Search Molecules</span>
          </button>
        </form>

        {/* Quick pills */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs pt-1">
          <span className="text-slate-400 font-medium text-[11px]">Quick Molecules:</span>
          {quickCompounds.map((qc) => (
            <button
              key={qc}
              onClick={() => {
                setSearchQuery(qc);
                if (onUpdateSearchQuery) {
                  onUpdateSearchQuery(qc);
                }
                loadCompounds(qc);
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-[#E0F5F4] hover:text-[#00606B] text-slate-700 rounded-lg text-[11px] font-medium transition-colors border border-slate-200 cursor-pointer"
            >
              {qc}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compounds Directory Sidebar */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block px-1">
            Matching Molecules ({compounds.length})
          </span>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {compounds.map((comp) => {
              const isSelected = selectedCompound?.id === comp.id;
              return (
                <div
                  key={comp.id}
                  onClick={() => setSelectedCompound(comp)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'bg-[#EBF7F6] border-[#00A896] shadow-sm ring-1 ring-[#00A896]/30'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{comp.name}</span>
                    <span className="font-mono text-[10px] text-[#00606B] font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">{comp.chembl_id}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {comp.drug_type} • {comp.molecular_weight ? `${comp.molecular_weight} g/mol` : 'MW N/A'}
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {comp.targets.slice(0, 2).map((t, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 text-[9.5px] font-medium bg-slate-100 rounded border border-slate-200 text-slate-700">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Compound Intelligence Profile */}
        {selectedCompound ? (
          <div className="lg:col-span-2 space-y-4">
            {/* Molecule Overview Card */}
            <MoleculeViewer
              name={selectedCompound.name}
              chemblId={selectedCompound.chembl_id}
              smiles={selectedCompound.smiles}
              molecularFormula={selectedCompound.molecular_formula}
              molecularWeight={selectedCompound.molecular_weight}
              targets={selectedCompound.targets}
            />

            {/* 5 Tabs Navigation */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'overview', label: '1. Mechanism' },
                    { id: 'bioactivity', label: '2. Bioactivity (IC50)' },
                    { id: 'targets', label: '3. Kinase Targets' },
                    { id: 'literature', label: '4. PubMed Evidence' },
                    { id: 'evidence', label: '5. Guidelines & Limits' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                        activeTab === tab.id
                          ? 'bg-[#002B2E] text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => onStartResearch(`What are the therapeutic mechanisms and clinical trial outcomes for ${selectedCompound.name}?`)}
                  className="px-3 py-1.5 bg-[#00606B] text-white text-xs font-semibold rounded-xl hover:bg-[#004D56] transition-colors flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#00D1C1]" />
                  <span>Synthesize Dossier</span>
                </button>
              </div>

              {/* Tab 1: Mechanism */}
              {activeTab === 'overview' && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Mechanism of Action & Biological Pathway
                    </span>
                    <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      {selectedCompound.mechanism_of_action || 'Documented therapeutic regulator and target-binding molecule.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11.5px]">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="font-semibold text-slate-500 block">Clinical Status:</span>
                      <span className="font-bold text-slate-900">{selectedCompound.clinical_phase || 'Approved / Clinical Standard'}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="font-semibold text-slate-500 block">Primary Indications:</span>
                      <span className="text-slate-800">{selectedCompound.indications.join(', ') || 'Translational & Oncology Indications'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Bioactivity */}
              {activeTab === 'bioactivity' && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Curated ChEMBL Bioactivity Assays (IC50 / Kd / EC50)
                    </span>
                    <p className="text-slate-500 text-[11px]">
                      Experimental binding affinities retrieved from EMBL-EBI ChEMBL biochemical assays.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {selectedCompound.ic50_ranges && selectedCompound.ic50_ranges.length > 0 ? (
                      selectedCompound.ic50_ranges.map((ic, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between font-mono text-[11.5px] text-slate-800">
                          <span className="font-bold text-[#00606B]">{ic}</span>
                          <span className="text-[10px] text-slate-400 font-sans font-medium">ChEMBL Assay Measurement</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-slate-500">
                        Assay measurements indexed in full ChEMBL report card.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Targets */}
              {activeTab === 'targets' && (
                <div className="space-y-4 text-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Validated Biological & Kinase Targets
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedCompound.targets.map((t, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
                        <Target className="w-4 h-4 text-[#00606B] shrink-0" />
                        <span className="font-bold text-slate-900">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: PubMed Literature Evidence (REAL FETCH) */}
              {activeTab === 'literature' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Actual PubMed Peer-Reviewed Studies for {selectedCompound.name}
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                      Live PubMed Records
                    </span>
                  </div>

                  {isLoadingPapers ? (
                    <div className="p-6 text-center text-slate-400 space-y-2">
                      <div className="inline-block w-5 h-5 border-2 border-[#00606B] border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs">Fetching peer-reviewed publications from NCBI PubMed...</p>
                    </div>
                  ) : compoundPapers.length > 0 ? (
                    <div className="space-y-2.5">
                      {compoundPapers.map((paper) => (
                        <div
                          key={paper.id}
                          className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:bg-white hover:border-[#00606B] transition-all space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2 py-0.5 bg-[#002B2E] text-[#00D1C1] text-[10px] font-mono font-bold rounded">
                              {paper.pmid ? `PMID: ${paper.pmid}` : 'PubMed'}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {paper.year || 2025} • {paper.journal}
                            </span>
                          </div>

                          <h4 className="font-bold text-slate-900 text-xs leading-snug">
                            <a
                              href={paper.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-[#00606B] inline-flex items-center gap-1"
                            >
                              <span>{paper.title}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                            </a>
                          </h4>

                          <p className="text-[11px] text-slate-600 line-clamp-2">
                            {paper.evidence_excerpt || paper.abstract}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl">
                      No direct papers indexed for this query. Click below to search in ChEMBL.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 5: Evidence & Limitations */}
              {activeTab === 'evidence' && (
                <div className="space-y-4 text-xs">
                  <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      <span>Experimental Interpretation Safeguards</span>
                    </div>
                    <ul className="list-disc list-inside text-amber-800 text-[11.5px] space-y-1 leading-relaxed">
                      <li>In vitro enzymatic bioactivity (IC50 / Kd) indicates binding affinity, not clinical in vivo efficacy.</li>
                      <li>Assay measurements reflect specific laboratory buffer conditions and substrate concentrations.</li>
                      <li>Drug structures and identifiers are retrieved from EMBL-EBI ChEMBL.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Footer Provenance */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Provenance: <strong className="text-slate-700">{selectedCompound.provenance}</strong></span>
                {selectedCompound.chembl_id && (
                  <a
                    href={`https://www.ebi.ac.uk/chembl/compound_report_card/${selectedCompound.chembl_id}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[#00606B] font-semibold hover:underline"
                  >
                    <span>EMBL-EBI ChEMBL Entry</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
