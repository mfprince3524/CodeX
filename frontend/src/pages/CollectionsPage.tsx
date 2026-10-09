import React, { useState, useEffect } from 'react';
import { CollectionResponse } from '../types';
import { api } from '../services/api';
import {
  BookmarkCheck,
  Plus,
  Download,
  BookOpen,
  Pill,
  ShieldCheck,
  FileText,
  Trash2,
  Share2,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Printer,
  FolderOpen,
  X,
  Search
} from 'lucide-react';

interface CollectionsPageProps {
  onStartResearch: (query: string) => void;
}

const STORAGE_KEY = 'biomindq_user_collections';

export const CollectionsPage: React.FC<CollectionsPageProps> = ({ onStartResearch }) => {
  const [collections, setCollections] = useState<CollectionResponse[]>([]);
  const [selectedCol, setSelectedCol] = useState<CollectionResponse | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Initial load with localStorage fallback and rich starter collections
  useEffect(() => {
    loadCollections();

    const handleSync = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCollections(parsed);
            setSelectedCol(prev => {
              if (!prev) return parsed[0];
              const match = parsed.find(c => c.id === prev.id);
              return match || parsed[0];
            });
          }
        }
      } catch (e) {
        console.error('Error syncing collections', e);
      }
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('biomindq_collections_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('biomindq_collections_updated', handleSync);
    };
  }, []);

  const loadCollections = async () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCollections(parsed);
          setSelectedCol(parsed[0]);
          return;
        }
      }
    } catch (e) {
      console.error('Error loading collections from storage', e);
    }

    // Default starter collections if none saved
    const starterCols: CollectionResponse[] = [
      {
        id: 'col-1',
        title: "Metformin & Alzheimer's Translational Review",
        description: 'Curation of preclinical kinase targets, observational cohorts, and active NIA clinical trials.',
        color: '#00606B',
        created_at: '2026-10-09',
        items_count: 4,
        items: [
          {
            id: 'item-1',
            item_type: 'paper',
            title: 'Metformin activates AMPK/mTOR axis to attenuate tau hyperphosphorylation in cortical neurons',
            reference_id: 'PMID: 32152640',
            notes: 'Strong in vitro/in vivo mechanistic proof of tau reduction via AMPK activation.',
            added_at: '2026-10-09'
          },
          {
            id: 'item-2',
            item_type: 'compound',
            title: 'Metformin Hydrochloride (CHEMBL1431)',
            reference_id: 'ChEMBL: CHEMBL1431',
            notes: 'Mitochondrial Complex I inhibitor & PRKAA1 allosteric regulator.',
            added_at: '2026-10-09'
          },
          {
            id: 'item-3',
            item_type: 'paper',
            title: 'Metformin in amnestic mild cognitive impairment: Phase 2 double-blind RCT',
            reference_id: 'PMID: 27725902',
            notes: 'Executive function improvement in human non-diabetic pilot cohort.',
            added_at: '2026-10-09'
          },
          {
            id: 'item-4',
            item_type: 'query',
            title: 'Does long-term metformin exposure alter CSF tau phosphorylation in non-diabetic adults?',
            reference_id: 'GAP-001',
            notes: 'Identified research gap for clinical validation.',
            added_at: '2026-10-09'
          }
        ]
      },
      {
        id: 'col-2',
        title: 'Targeted Kinase & Checkpoint Inhibitors',
        description: 'Comparative dossiers on Imatinib (Bcr-Abl), Osimertinib (EGFR), and Pembrolizumab (PD-1).',
        color: '#00A896',
        created_at: '2026-10-09',
        items_count: 2,
        items: [
          {
            id: 'item-5',
            item_type: 'compound',
            title: 'Osimertinib (CHEMBL3353410)',
            reference_id: 'ChEMBL: CHEMBL3353410',
            notes: '3rd-generation EGFR T790M inhibitor with CNS penetrance.',
            added_at: '2026-10-09'
          },
          {
            id: 'item-6',
            item_type: 'paper',
            title: 'Mechanisms of resistance to 3rd-generation EGFR TKIs in NSCLC',
            reference_id: 'PMID: 34120984',
            notes: 'C797S tertiary mutation and MET amplification pathways.',
            added_at: '2026-10-09'
          }
        ]
      },
      {
        id: 'col-3',
        title: 'Personalized Preventive Health Roadmaps',
        description: 'Saved multi-scenario metabolic health projections, fasting glucose targets, and lifestyle micro-plans.',
        color: '#028090',
        created_at: '2026-10-09',
        items_count: 2,
        items: [
          {
            id: 'item-7',
            item_type: 'query',
            title: '5-Year Cardiovascular Risk Delta on Daily 30-min Walking',
            reference_id: 'SIM-2026',
            notes: 'Risk reduced from 28% to 8% with 8kg weight normalization.',
            added_at: '2026-10-09'
          },
          {
            id: 'item-8',
            item_type: 'query',
            title: '4-Week Micro-Habits Metabolic Reset Plan',
            reference_id: 'HABIT-04',
            notes: 'Gradual ramp: 6,000 steps/day, 2.5L water, zero fast food.',
            added_at: '2026-10-09'
          }
        ]
      }
    ];

    setCollections(starterCols);
    setSelectedCol(starterCols[0]);
    saveToStorage(starterCols);
  };

  const saveToStorage = (updated: CollectionResponse[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving collections', e);
    }
  };

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newCol: CollectionResponse = {
      id: `col-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || 'Custom curated research dossier.',
      color: '#00606B',
      created_at: new Date().toISOString().split('T')[0],
      items_count: 0,
      items: []
    };

    const updated = [newCol, ...collections];
    setCollections(updated);
    setSelectedCol(newCol);
    saveToStorage(updated);

    setNewTitle('');
    setNewDesc('');
    setIsCreating(false);
  };

  const handleDeleteCollection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = collections.filter(c => c.id !== id);
    setCollections(updated);
    if (selectedCol?.id === id) {
      setSelectedCol(updated.length > 0 ? updated[0] : null);
    }
    saveToStorage(updated);
  };

  const handleDeleteItem = (itemId: string) => {
    if (!selectedCol) return;
    const updatedItems = selectedCol.items.filter(it => it.id !== itemId);
    const updatedCol = {
      ...selectedCol,
      items: updatedItems,
      items_count: updatedItems.length
    };
    const updatedAll = collections.map(c => c.id === selectedCol.id ? updatedCol : c);
    setCollections(updatedAll);
    setSelectedCol(updatedCol);
    saveToStorage(updatedAll);
  };

  const handleExportMarkdown = () => {
    if (!selectedCol) return;
    const markdown = `# BioMindQ Saved Research Collection: ${selectedCol.title}\n\n` +
      `**Description:** ${selectedCol.description || 'No description provided.'}\n` +
      `**Items Count:** ${selectedCol.items.length}\n` +
      `**Export Date:** ${new Date().toUTCString()}\n\n` +
      `## Curated Evidence & Records\n\n` +
      selectedCol.items.map((it, idx) => (
        `### ${idx + 1}. [${it.item_type.toUpperCase()}] ${it.title}\n` +
        `- **Reference Identifier:** ${it.reference_id}\n` +
        `- **Annotated Notes:** ${it.notes || 'N/A'}\n` +
        `- **Saved Date:** ${it.added_at}\n`
      )).join('\n');

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCol.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-dossier.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'compound': return <Pill className="w-4 h-4 text-[#00606B]" />;
      case 'paper': return <BookOpen className="w-4 h-4 text-emerald-700" />;
      case 'trial': return <ShieldCheck className="w-4 h-4 text-amber-700" />;
      default: return <FileText className="w-4 h-4 text-teal-700" />;
    }
  };

  const filteredItems = selectedCol?.items.filter(it =>
    it.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (it.notes && it.notes.toLowerCase().includes(searchFilter.toLowerCase())) ||
    it.reference_id.toLowerCase().includes(searchFilter.toLowerCase())
  ) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#00606B] font-semibold text-xs uppercase tracking-wider">
            <BookmarkCheck className="w-4 h-4" />
            <span>Saved Collections & Dossiers</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Research Collections & Export
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Organize publications, compound profiles, future health roadmaps, and research gaps with full Markdown export.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#00606B] hover:bg-[#004D56] text-white font-semibold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      {/* Creation Modal / Form */}
      {isCreating && (
        <div className="bg-white border border-[#00606B] rounded-2xl p-5 shadow-lg space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Create New Collection</h3>
            <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleCreateCollection} className="space-y-3 text-xs">
            <input
              type="text"
              placeholder="Collection Title (e.g., 'GLP-1 & Metabolic Cardiomyopathy Review')..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#00606B]"
              required
            />
            <textarea
              placeholder="Description & Research Scope..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={2}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#00606B]"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#00606B] hover:bg-[#004D56] text-white font-semibold rounded-xl cursor-pointer"
              >
                Save Collection
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collections Directory Sidebar */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block px-1">
            Collections ({collections.length})
          </span>
          <div className="space-y-2">
            {collections.map((col) => {
              const isSelected = selectedCol?.id === col.id;
              return (
                <div
                  key={col.id}
                  onClick={() => setSelectedCol(col)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'bg-[#EBF7F6] border-[#00A896] shadow-sm ring-1 ring-[#00A896]/30'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{col.title}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#00606B] border border-slate-200">
                        {col.items_count} records
                      </span>
                      {collections.length > 1 && (
                        <button
                          onClick={(e) => handleDeleteCollection(col.id, e)}
                          title="Delete Collection"
                          className="text-slate-400 hover:text-rose-600 p-0.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  {col.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {col.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Collection Items View */}
        {selectedCol ? (
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
              <div className="flex items-start justify-between flex-wrap gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-slate-900">
                    {selectedCol.title}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {selectedCol.description || 'Curated evidence collection.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportMarkdown}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#00606B]" />
                    <span>Export Markdown</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#00606B]" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              {/* Search Inside Collection */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter records in this collection..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#00606B]"
                />
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Saved Records ({filteredItems.length})
                </span>

                {filteredItems.length > 0 ? (
                  <div className="space-y-3">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getItemIcon(item.item_type)}
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              {item.item_type}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10.5px] text-slate-500 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {item.reference_id}
                            </span>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              title="Remove item"
                              className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          {item.title}
                        </h4>

                        {item.notes && (
                          <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11.5px] text-slate-700 leading-relaxed">
                            {item.notes}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                          <span>Added {item.added_at}</span>
                          <button
                            onClick={() => onStartResearch(item.title)}
                            className="text-[#00606B] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-[#00A896]" />
                            <span>Analyze in Conflict Radar</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                    No items match your search filter in this collection.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            Select or create a collection to view items.
          </div>
        )}
      </div>
    </div>
  );
};
