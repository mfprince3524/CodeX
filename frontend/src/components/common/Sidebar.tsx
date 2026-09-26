import React from 'react';
import {
  Compass,
  FileSearch,
  Dna,
  Pill,
  GitFork,
  Clock,
  FolderHeart,
  Users,
  Building2,
  Settings,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  activeQueryCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  activeQueryCount = 0
}) => {
  const mainNav = [
    { id: 'workspace', label: 'Research Workspace', icon: FileSearch, badge: activeQueryCount > 0 ? 'Active' : undefined },
    { id: 'command-center', label: 'Command Center', icon: Compass },
    { id: 'compounds', label: 'Compound Explorer', icon: Pill },
    { id: 'diseases', label: 'Disease Explorer', icon: Dna },
    { id: 'clinical-trials', label: 'Clinical Trials', icon: ShieldCheck },
    { id: 'collections', label: 'Saved Collections', icon: FolderHeart }
  ];

  return (
    <aside className="w-64 glass-panel border-r border-scientific-border flex flex-col justify-between py-5 px-3 min-h-[calc(100vh-65px)]">
      <div className="space-y-6">
        <div>
          <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-scientific-muted">
            Intelligence Modules
          </span>
          <nav className="mt-2 space-y-1">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-scientific-primary text-white shadow-premium shadow-scientific-primary/20'
                      : 'text-scientific-text hover:bg-slate-100/80 hover:text-scientific-primary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-scientific-muted group-hover:text-scientific-primary'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Demo Quick Launcher */}
        <div className="p-3.5 bg-gradient-to-br from-scientific-blueLight to-scientific-cyanLight rounded-2xl border border-blue-100">
          <div className="flex items-center gap-2 text-scientific-primary font-bold text-xs mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Benchmark Demos</span>
          </div>
          <p className="text-[11px] text-scientific-muted leading-relaxed mb-3">
            Load verified multimodal evidence studies with pre-indexed citations.
          </p>
          <div className="space-y-1.5">
            <button
              onClick={() => {
                onNavigate('workspace');
              }}
              className="w-full text-left px-2.5 py-1.5 bg-white/90 hover:bg-white text-[11px] font-medium text-scientific-text rounded-lg border border-blue-100 hover:border-scientific-primary/40 transition-colors shadow-xs flex items-center justify-between"
            >
              <span className="truncate">Metformin & Alzheimer's</span>
              <ChevronRight className="w-3 h-3 text-scientific-primary shrink-0" />
            </button>
            <button
              onClick={() => {
                onNavigate('compounds');
              }}
              className="w-full text-left px-2.5 py-1.5 bg-white/90 hover:bg-white text-[11px] font-medium text-scientific-text rounded-lg border border-blue-100 hover:border-scientific-primary/40 transition-colors shadow-xs flex items-center justify-between"
            >
              <span className="truncate">Imatinib Target Affinity</span>
              <ChevronRight className="w-3 h-3 text-scientific-primary shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-3 pt-4 border-t border-scientific-border text-[11px] text-scientific-muted space-y-2">
        <div className="flex items-center justify-between">
          <span>Sources Connected:</span>
          <span className="font-bold text-scientific-text">4 Adapters</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Evidence Mode:</span>
          <span className="font-bold text-scientific-primary">Strict Grounding</span>
        </div>
      </div>
    </aside>
  );
};
