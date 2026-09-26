import React, { useState } from 'react';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { MedicalDisclaimerModal } from './components/common/MedicalDisclaimerModal';
import { LandingPage } from './pages/LandingPage';
import { CommandCenter } from './pages/CommandCenter';
import { ResearchWorkspace } from './pages/ResearchWorkspace';
import { CompoundExplorer } from './pages/CompoundExplorer';
import { DiseaseExplorer } from './pages/DiseaseExplorer';
import { ClinicalTrialsExplorer } from './pages/ClinicalTrialsExplorer';
import { CollectionsPage } from './pages/CollectionsPage';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [activeResearchQuery, setActiveResearchQuery] = useState<string>(
    "What research exists on metformin and Alzheimer's disease?"
  );
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  const handleStartResearch = (query?: string) => {
    if (query) {
      setActiveResearchQuery(query);
    }
    setCurrentTab('workspace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGlobalSearch = (query: string) => {
    handleStartResearch(query);
  };

  return (
    <div className="min-h-screen bg-scientific-bg text-scientific-text flex flex-col selection:bg-scientific-primary/10">
      {/* Header */}
      <Header
        currentTab={currentTab}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenDisclaimer={() => setIsDisclaimerOpen(true)}
        onTriggerQuickSearch={handleGlobalSearch}
      />

      {/* Main Content Layout */}
      {currentTab === 'landing' ? (
        <main className="flex-1">
          <LandingPage
            onStartResearch={handleStartResearch}
            onExploreExplorer={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </main>
      ) : (
        <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
          {/* Left Sidebar */}
          <div className="hidden md:block">
            <Sidebar
              currentTab={currentTab}
              onNavigate={(tab) => {
                setCurrentTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              activeQueryCount={1}
            />
          </div>

          {/* Main App Workspace */}
          <main className="flex-1 min-w-0 pb-16">
            {currentTab === 'workspace' && (
              <ResearchWorkspace
                initialQuery={activeResearchQuery}
                onNavigate={(tab) => setCurrentTab(tab)}
              />
            )}
            {currentTab === 'command-center' && (
              <CommandCenter
                onStartResearch={handleStartResearch}
                onNavigate={(tab) => setCurrentTab(tab)}
              />
            )}
            {currentTab === 'compounds' && (
              <CompoundExplorer onStartResearch={handleStartResearch} />
            )}
            {currentTab === 'diseases' && (
              <DiseaseExplorer onStartResearch={handleStartResearch} />
            )}
            {currentTab === 'clinical-trials' && (
              <ClinicalTrialsExplorer onStartResearch={handleStartResearch} />
            )}
            {currentTab === 'collections' && (
              <CollectionsPage onStartResearch={handleStartResearch} />
            )}
          </main>
        </div>
      )}

      {/* Medical Safety Disclaimer Modal */}
      <MedicalDisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
      />
    </div>
  );
}

export default App;
