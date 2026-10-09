import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { MedicalDisclaimerModal } from './components/common/MedicalDisclaimerModal';
import { AuthModal, UserProfile } from './components/common/AuthModal';

import { ResearchHomeOverview } from './pages/ResearchHomeOverview';
import { CompoundExplorer } from './pages/CompoundExplorer';
import { EvidenceConflictRadar } from './pages/EvidenceConflictRadar';
import { BiologicalConnectionExplorer } from './pages/BiologicalConnectionExplorer';
import { ResearchGapFinderPage } from './pages/ResearchGapFinderPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { SettingsDataSourcesPage } from './pages/SettingsDataSourcesPage';
import { FutureLifeSimulatorPage } from './pages/FutureLifeSimulatorPage';
import { EvidenceEvolutionPage } from './pages/EvidenceEvolutionPage';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>('');

  // User Profile State with LocalStorage Persistence
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('biomindq_user');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading user from localStorage', e);
    }
    return {
      name: 'Farhan',
      email: 'farhan@biomindq.ai',
      role: 'Biomedical Researcher',
      age: 32,
      gender: 'male',
      height_cm: 175,
      weight_kg: 78,
      blood_group: 'O+'
    };
  });

  const handleSaveUser = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('biomindq_user', JSON.stringify(updatedUser));
    } catch (e) {
      console.error('Error saving user to localStorage', e);
    }
  };

  const handleStartResearch = (query?: string, targetTab: string = 'conflicts') => {
    if (query && query.trim()) {
      setActiveSearchQuery(query.trim());
    }
    setCurrentTab(targetTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGlobalSearch = (query: string) => {
    handleStartResearch(query, 'conflicts');
  };

  return (
    <div className="min-h-screen bg-[#F4FAF9] text-[#1C2826] flex font-sans selection:bg-[#D5EFEB] selection:text-[#004D56]">
      {/* Full-Height Dark Teal Sidebar */}
      <div className="hidden md:block shrink-0">
        <Sidebar
          currentTab={currentTab}
          onNavigate={(tab) => {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNewResearch={() => handleStartResearch()}
          onOpenDisclaimer={() => setIsDisclaimerOpen(true)}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      </div>

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onNavigate={(tab) => {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenDisclaimer={() => setIsDisclaimerOpen(true)}
          onTriggerQuickSearch={handleGlobalSearch}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
        />

        {/* Viewport */}
        <main className="flex-1 pb-16 px-3 sm:px-6">
          {currentTab === 'overview' && (
            <ResearchHomeOverview
              onNavigate={(tab) => {
                setCurrentTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onStartResearch={(q) => handleStartResearch(q, 'conflicts')}
              userName={currentUser.name}
              onOpenAuth={() => setIsAuthOpen(true)}
              initialQuery={activeSearchQuery}
              onUpdateSearchQuery={setActiveSearchQuery}
            />
          )}

          {currentTab === 'simulator' && (
            <FutureLifeSimulatorPage
              onStartResearch={(q) => handleStartResearch(q, 'conflicts')}
            />
          )}

          {currentTab === 'evolution' && (
            <EvidenceEvolutionPage
              onStartResearch={(q) => handleStartResearch(q, 'conflicts')}
              initialTopic={activeSearchQuery}
              onUpdateSearchQuery={setActiveSearchQuery}
            />
          )}

          {currentTab === 'conflicts' && (
            <EvidenceConflictRadar
              onStartResearch={(q) => handleStartResearch(q, 'conflicts')}
              initialQuery={activeSearchQuery}
              onUpdateSearchQuery={setActiveSearchQuery}
            />
          )}

          {currentTab === 'compounds' && (
            <CompoundExplorer
              onStartResearch={(q) => handleStartResearch(q, 'conflicts')}
              initialQuery={activeSearchQuery}
              onUpdateSearchQuery={setActiveSearchQuery}
            />
          )}

          {currentTab === 'graph' && (
            <BiologicalConnectionExplorer
              onStartResearch={(q) => handleStartResearch(q, 'conflicts')}
              initialEntity={activeSearchQuery}
              onUpdateSearchQuery={setActiveSearchQuery}
            />
          )}

          {currentTab === 'gaps' && (
            <ResearchGapFinderPage
              onStartResearch={(q) => handleStartResearch(q, 'conflicts')}
              initialTopic={activeSearchQuery}
              onUpdateSearchQuery={setActiveSearchQuery}
            />
          )}

          {currentTab === 'saved' && (
            <CollectionsPage
              onStartResearch={(q) => handleStartResearch(q, 'conflicts')}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsDataSourcesPage />
          )}
        </main>
      </div>

      {/* Medical Safety Disclaimer Modal */}
      <MedicalDisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
      />

      {/* Authentication & Profile Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onSaveUser={handleSaveUser}
      />
    </div>
  );
}

export default App;
