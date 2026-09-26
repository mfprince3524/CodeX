import React, { useState } from 'react';
import {
  Search,
  Activity,
  ShieldCheck,
  BookmarkCheck,
  Compass,
  FileText,
  HelpCircle,
  ExternalLink,
  Sparkles,
  Layers
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenDisclaimer: () => void;
  onTriggerQuickSearch: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  onOpenDisclaimer,
  onTriggerQuickSearch
}) => {
  const [searchVal, setSearchVal] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      onTriggerQuickSearch(searchVal.trim());
      setSearchVal('');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-scientific-border/80 px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 group text-left focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-scientific-primary to-scientific-secondary flex items-center justify-center text-white shadow-premium shadow-scientific-primary/20 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-scientific-text">
                  BioMind<span className="text-scientific-primary">Q</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-scientific-blueLight text-scientific-primary rounded border border-blue-200">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] font-medium text-scientific-muted -mt-0.5 hidden sm:block">
                Biomedical Intelligence. Grounded in Evidence.
              </p>
            </div>
          </button>

          {/* Quick Nav Links */}
          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-scientific-border">
            <button
              onClick={() => onNavigate('workspace')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'workspace'
                  ? 'bg-scientific-primary text-white shadow-sm'
                  : 'text-scientific-text hover:bg-slate-100'
              }`}
            >
              Research Workspace
            </button>
            <button
              onClick={() => onNavigate('command-center')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'command-center'
                  ? 'bg-scientific-primary text-white shadow-sm'
                  : 'text-scientific-text hover:bg-slate-100'
              }`}
            >
              Command Center
            </button>
            <button
              onClick={() => onNavigate('compounds')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'compounds'
                  ? 'bg-scientific-primary text-white shadow-sm'
                  : 'text-scientific-text hover:bg-slate-100'
              }`}
            >
              Compounds
            </button>
            <button
              onClick={() => onNavigate('diseases')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'diseases'
                  ? 'bg-scientific-primary text-white shadow-sm'
                  : 'text-scientific-text hover:bg-slate-100'
              }`}
            >
              Diseases
            </button>
            <button
              onClick={() => onNavigate('clinical-trials')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'clinical-trials'
                  ? 'bg-scientific-primary text-white shadow-sm'
                  : 'text-scientific-text hover:bg-slate-100'
              }`}
            >
              Clinical Trials
            </button>
            <button
              onClick={() => onNavigate('collections')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'collections'
                  ? 'bg-scientific-primary text-white shadow-sm'
                  : 'text-scientific-text hover:bg-slate-100'
              }`}
            >
              Collections
            </button>
          </nav>
        </div>

        {/* Global Search & Action Controls */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative hidden lg:block w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-scientific-muted" />
            <input
              type="text"
              placeholder="Search diseases, compounds, PMIDs..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-scientific-border bg-white/90 text-scientific-text focus:outline-none focus:ring-2 focus:ring-scientific-primary/20 focus:border-scientific-primary transition-all"
            />
          </form>

          {/* Live Adapter Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>PubMed & ChEMBL Live</span>
          </div>

          {/* Safety Disclaimer Button */}
          <button
            onClick={onOpenDisclaimer}
            title="Biomedical Research Safety Notice"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-scientific-muted hover:text-scientific-text hover:bg-slate-100 rounded-lg border border-scientific-border transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-scientific-primary" />
            <span className="hidden sm:inline">Safety Notice</span>
          </button>
        </div>
      </div>
    </header>
  );
};
