import React, { useState, useEffect } from 'react';
import { CollectionResponse } from '../types';
import { api } from '../services/api';
import {
  FolderHeart,
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
  CheckCircle2
} from 'lucide-react';

interface CollectionsPageProps {
  onStartResearch: (query: string) => void;
}

export const CollectionsPage: React.FC<CollectionsPageProps> = ({ onStartResearch }) => {
  const [collections, setCollections] = useState<CollectionResponse[]>([]);
  const [selectedCol, setSelectedCol] = useState<CollectionResponse | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    const data = await api.getCollections();
    setCollections(data);
    if (data.length > 0 && !selectedCol) {
      setSelectedCol(data[0]);
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const created = await api.createCollection({
      title: newTitle.trim(),
      description: newDesc.trim()
    });
    setCollections([...collections, created]);
    setSelectedCol(created);
    setNewTitle('');
    setNewDesc('');
    setIsCreating(false);
  };

  const handleExportCollection = () => {
    if (!selectedCol) return;
    const markdown = `# Research Collection: ${selectedCol.title}\n\n` +
      `**Description:** ${selectedCol.description || 'No description provided.'}\n` +
      `**Items Count:** ${selectedCol.items.length}\n` +
      `**Exported:** ${new Date().toISOString()}\n\n` +
      `## Curated Evidence & Records\n\n` +
      selectedCol.items.map((it, idx) => (
        `### ${idx + 1}. [${it.item_type.toUpperCase()}] ${it.title}\n` +
        `- **Reference ID:** ${it.reference_id}\n` +
        `- **Notes:** ${it.notes || 'N/A'}\n` +
        `- **Added:** ${it.added_at}\n`
      )).join('\n');

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCol.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-dossier.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'compound': return <Pill className="w-4 h-4 text-blue-500" />;
      case 'paper': return <BookOpen className="w-4 h-4 text-emerald-500" />;
      case 'trial': return <ShieldCheck className="w-4 h-4 text-amber-500" />;
      default: return <FileText className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-scientific-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-scientific-text">
              Saved Research Collections & Curation
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 rounded-full">
              Export Ready (.md / JSON)
            </span>
          </div>
          <p className="text-xs text-scientific-muted mt-1">
            Organize peer-reviewed manuscripts, active trials, compounds, and notes into structured research dossiers.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-scientific-primary text-white font-bold text-xs rounded-xl shadow-premium shadow-scientific-primary/20 hover:bg-blue-600 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      {/* Creation Modal */}
      {isCreating && (
        <div className="glass-card p-6 rounded-2xl border border-scientific-primary shadow-premium space-y-4 animate-in fade-in">
          <h3 className="text-sm font-bold text-scientific-text">Create Research Collection</h3>
          <form onSubmit={handleCreateCollection} className="space-y-3">
            <input
              type="text"
              placeholder="Collection Title (e.g., 'Metformin & Alzheimer's Translational Review')"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-scientific-border bg-white text-scientific-text focus:outline-none focus:ring-2 focus:ring-scientific-primary/20"
              required
            />
            <textarea
              placeholder="Description & Project Scope..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={2}
              className="w-full p-2.5 text-xs rounded-xl border border-scientific-border bg-white text-scientific-text focus:outline-none focus:ring-2 focus:ring-scientific-primary/20"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 text-xs font-semibold text-scientific-muted hover:text-scientific-text"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-scientific-primary text-white font-bold text-xs rounded-lg hover:bg-blue-600"
              >
                Save Collection
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Collections Sidebar */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-scientific-muted block">
            Your Project Dossiers ({collections.length})
          </span>
          <div className="space-y-2">
            {collections.map((col) => {
              const isSelected = selectedCol?.id === col.id;
              return (
                <div
                  key={col.id}
                  onClick={() => setSelectedCol(col)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-scientific-blueLight/60 border-scientific-primary shadow-xs'
                      : 'bg-white border-scientific-border hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-scientific-text">{col.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {col.items_count} items
                    </span>
                  </div>
                  {col.description && (
                    <p className="text-[11px] text-scientific-muted line-clamp-2">
                      {col.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Collection Items */}
        {selectedCol ? (
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6 rounded-2xl border border-scientific-border space-y-6">
              <div className="flex items-start justify-between flex-wrap gap-4 border-b border-scientific-border pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-scientific-text">
                    {selectedCol.title}
                  </h2>
                  <p className="text-xs text-scientific-muted mt-0.5">
                    {selectedCol.description || 'Curated evidence collection.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportCollection}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-scientific-text bg-white border border-scientific-border hover:border-scientific-primary rounded-xl shadow-2xs transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-scientific-primary" />
                    <span>Export Markdown Dossier</span>
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-scientific-muted block">
                  Saved Evidence Records ({selectedCol.items.length})
                </span>

                {selectedCol.items.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCol.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getItemIcon(item.item_type)}
                            <span className="text-[10px] font-bold uppercase tracking-wider text-scientific-muted">
                              {item.item_type}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-500">
                            {item.reference_id}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-scientific-text">
                          {item.title}
                        </h4>

                        {item.notes && (
                          <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-700 italic">
                            "{item.notes}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-scientific-muted bg-slate-50 rounded-xl border border-slate-200">
                    No items in this collection yet. Add evidence from the Research Workspace using the bookmark button.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 p-12 glass-card rounded-2xl text-center text-scientific-muted text-xs">
            Select or create a collection to view items.
          </div>
        )}
      </div>
    </div>
  );
};
