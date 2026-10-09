import React from 'react';
import {
  LayoutGrid,
  Search,
  Bookmark,
  Sparkles,
  Pill,
  GitCompare,
  Network,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Settings,
  Database,
  History,
  UserCheck,
  User
} from 'lucide-react';
import type { UserProfile } from './AuthModal';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onNewResearch: () => void;
  onOpenDisclaimer: () => void;
  currentUser?: UserProfile;
  onOpenAuth?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  onNewResearch,
  onOpenDisclaimer,
  currentUser = {
    name: 'Farhan',
    email: 'farhan@biomindq.ai',
    role: 'Biomedical Researcher',
    age: 32,
    gender: 'male',
    height_cm: 175,
    weight_kg: 78,
    blood_group: 'O+'
  },
  onOpenAuth
}) => {
  const simulationNav = [
    { id: 'simulator', label: '🔮 Future Life Simulator', icon: Sparkles, badge: 'PREDICTIVE' },
    { id: 'evolution', label: '📜 Evidence Evolution', icon: History, badge: '1994-2026' },
  ];

  const primaryNav = [
    { id: 'overview', label: 'Overview & Search', icon: LayoutGrid },
    { id: 'conflicts', label: 'Conflict Radar', icon: GitCompare },
    { id: 'compounds', label: 'Compound Explorer', icon: Pill },
  ];

  const discoveryNav = [
    { id: 'graph', label: 'Connection Graph', icon: Network },
    { id: 'gaps', label: 'Gap Finder', icon: HelpCircle },
    { id: 'saved', label: 'Saved Collections', icon: Bookmark },
    { id: 'settings', label: 'Data Sources & RAG', icon: Database },
  ];

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <aside className="w-64 bg-[#002B2E] text-white flex flex-col justify-between h-screen sticky top-0 py-4 px-3 select-none border-r border-[#003B3F]">
      <div className="space-y-5">
        {/* Brand Header */}
        <div className="px-3 pt-1 pb-1">
          <button
            onClick={() => onNavigate('overview')}
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#00A896] via-[#028090] to-[#F0F3BD] flex items-center justify-center text-white font-bold text-xs shadow-md">
              <span className="text-white text-xs">⬡</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              BioMind<span className="text-[#00D1C1]">Q</span>
            </span>
          </button>
        </div>

        {/* Section Heading: AI PREVENTIVE SIMULATOR */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold tracking-wider text-[#00D1C1] uppercase flex items-center justify-between">
            <span>PREVENTIVE AI</span>
            <span className="text-[9px] bg-[#00D1C1]/20 text-[#00D1C1] px-1.5 py-0.2 rounded font-mono">2026-2036</span>
          </div>

          <nav className="space-y-1">
            {simulationNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#00A896]/30 to-[#08474B] text-white border border-[#00D1C1]/50 shadow-md ring-1 ring-[#00D1C1]/30'
                      : 'text-white hover:bg-[#00383C] bg-[#002225]/40 border border-[#054347]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#00D1C1]' : 'text-[#00D1C1]'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] bg-[#00D1C1] text-[#002B2E] font-extrabold px-1.5 py-0.5 rounded shrink-0">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Section Heading: SCIENTIFIC INTELLIGENCE */}
        <div className="space-y-1 pt-1 border-t border-[#043E42]">
          <div className="px-3 text-[10px] font-bold tracking-wider text-[#6BA8A7] uppercase">
            SCIENTIFIC INTELLIGENCE
          </div>

          {/* Primary Navigation Menu */}
          <nav className="space-y-1">
            {primaryNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#08474B] text-white font-semibold border border-[#0E5B60] shadow-sm'
                      : 'text-[#A3C6C6] hover:bg-[#00383C] hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#00D1C1]' : 'text-[#7CA9A8]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Discovery & Analytical Modules */}
        <div className="space-y-1 pt-2 border-t border-[#043E42]">
          <div className="px-3 text-[10px] font-bold tracking-wider text-[#6BA8A7] uppercase">
            ADVANCED MODULES
          </div>

          <nav className="space-y-1">
            {discoveryNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#08474B] text-white font-semibold border border-[#0E5B60] shadow-sm'
                      : 'text-[#A3C6C6] hover:bg-[#00383C] hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#00D1C1]' : 'text-[#7CA9A8]'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Profile & Footer */}
      <div className="space-y-3 pt-3 border-t border-[#043E42]">
        {/* Medical Safety Pill */}
        <button
          onClick={onOpenDisclaimer}
          className="w-full py-1.5 px-3 rounded-lg bg-[#05383B] hover:bg-[#08474B] text-[#7CA9A8] hover:text-white text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors border border-[#0A484D] cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#00D1C1]" />
          <span>Evidence Grounded RAG</span>
        </button>

        {/* User Account Profile Box (Click to Login / Switch Profile) */}
        <div
          onClick={onOpenAuth}
          className="px-2.5 py-2 rounded-xl bg-[#002326]/80 hover:bg-[#00383C] border border-[#063F44] hover:border-[#00D1C1]/50 flex items-center justify-between cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00A896] to-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-white/20">
              {getInitials(currentUser.name)}
            </div>
            <div className="min-w-0">
              <div className="truncate font-semibold text-white text-xs group-hover:text-[#00D1C1] transition-colors">
                {currentUser.name}
              </div>
              <div className="truncate text-[#7CA9A8] text-[10px]">
                {currentUser.role}
              </div>
            </div>
          </div>

          <span className="text-[10px] text-[#00D1C1] bg-[#00D1C1]/10 px-1.5 py-0.5 rounded font-medium shrink-0">
            Profile
          </span>
        </div>
      </div>
    </aside>
  );
};
