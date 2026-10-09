import React, { useState } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  User,
  LogIn
} from 'lucide-react';
import type { UserProfile } from './AuthModal';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenDisclaimer: () => void;
  onTriggerQuickSearch: (query: string) => void;
  currentUser?: UserProfile;
  onOpenAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  onOpenDisclaimer,
  onTriggerQuickSearch,
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
  const [searchVal, setSearchVal] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      onTriggerQuickSearch(searchVal.trim());
      setSearchVal('');
    }
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E6ECEA] px-4 sm:px-6 py-2.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#7A9394]" />
            <input
              type="text"
              placeholder="Search BioMindQ (PubMed & ChEMBL)..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-[#D5E1DE] bg-[#F7FAFA] text-[#1C2826] placeholder:text-[#889E9F] focus:outline-none focus:ring-1 focus:ring-[#00666B] focus:border-[#00666B] transition-all"
            />
          </form>
        </div>

        {/* Right: Notifications, Data Sources, User Avatar / Login */}
        <div className="flex items-center gap-3">
          {/* Data Sources Active Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-[#F0F8F7] text-[#00606B] border border-[#CDECE8] rounded-lg text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>PubMed • Europe PMC • ChEMBL</span>
          </div>

          {/* Quick Disclaimer Modal */}
          <button
            onClick={onOpenDisclaimer}
            title="Biomedical Disclaimer"
            className="p-1.5 text-[#55696C] hover:text-[#0F2E33] hover:bg-[#F2F6F5] rounded-lg border border-[#DCE4E2] transition-colors cursor-pointer text-xs flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#00A896]" />
            <span className="hidden sm:inline text-[11px] font-medium">Safety</span>
          </button>

          {/* User Account / Login Button */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-slate-50 hover:bg-[#E0F5F4] border border-slate-200 hover:border-[#00A896] transition-all cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#00A896] to-teal-700 text-white font-bold text-xs flex items-center justify-center shadow-xs border border-[#CDECE8]">
              {getInitials(currentUser.name)}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-slate-800 group-hover:text-[#00606B] leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-500 leading-tight">
                {currentUser.role}
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
