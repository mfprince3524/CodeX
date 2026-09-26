import React, { useEffect, useRef } from 'react';
import {
  Activity,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Dna,
  Pill,
  GitFork,
  Clock,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  FileCheck,
  Search,
  ChevronRight,
  Network
} from 'lucide-react';

interface LandingPageProps {
  onStartResearch: (query?: string) => void;
  onExploreExplorer: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartResearch,
  onExploreExplorer
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animated biomedical particle network in the background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = 700);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = 700;
    };
    window.addEventListener('resize', handleResize);

    const particles: Array<{ x: number; y: number; vx: number; vy: number; radius: number; color: string }> = [];
    const colors = ['#0A5BFF', '#00A7A7', '#7C5CFC', '#38BDF8'];

    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2.5 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(10, 91, 255, ${0.12 * (1 - dist / 130)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw particle nodes
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.4;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const sampleQueries = [
    "What research exists on metformin and Alzheimer's disease?",
    "What are the known targets and bioactivities of imatinib?",
    "What clinical trials are investigating immunotherapy for melanoma?",
    "What does literature and ChEMBL report on olaparib and BRCA1?"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-scientific-bg via-white to-slate-50 text-scientific-text selection:bg-scientific-primary/10">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-6">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-0"
        />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-scientific-border shadow-subtle text-xs font-bold text-scientific-primary">
            <Sparkles className="w-3.5 h-3.5 text-scientific-secondary" />
            <span>Biomedical Intelligence. Grounded in Evidence.</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-scientific-text leading-[1.15]">
            Explore Biomedical Intelligence.
          </h1>

          {/* Subheading */}
          <p className="max-w-3xl mx-auto text-base sm:text-lg text-scientific-muted leading-relaxed font-normal">
            Search, connect, analyze, and understand biomedical evidence with an AI research assistant built around traceable peer-reviewed sources, real-time ChEMBL bioassays, and active clinical trials.
          </p>

          {/* Quick Search Input & Launcher */}
          <div className="max-w-2xl mx-auto pt-4">
            <div className="glass-card p-2 rounded-2xl shadow-premium border border-scientific-border flex items-center gap-2">
              <Search className="w-5 h-5 text-scientific-primary ml-3 shrink-0" />
              <input
                type="text"
                placeholder="Enter scientific question (e.g. 'What is known about metformin in Alzheimer's?')"
                className="w-full py-2.5 px-2 text-sm bg-transparent text-scientific-text focus:outline-none placeholder:text-slate-400 font-medium"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    onStartResearch(e.currentTarget.value.trim());
                  }
                }}
              />
              <button
                onClick={() => onStartResearch("What research exists on metformin and Alzheimer's disease?")}
                className="px-5 py-2.5 rounded-xl bg-scientific-primary text-white font-bold text-xs hover:bg-blue-600 shadow-premium shadow-scientific-primary/25 transition-all flex items-center gap-1.5 shrink-0"
              >
                <span>Launch Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Sample Query Chips */}
            <div className="flex items-center justify-center flex-wrap gap-2 pt-4">
              <span className="text-[11px] font-bold text-scientific-muted uppercase tracking-wider mr-1">
                Try Benchmark Queries:
              </span>
              {sampleQueries.map((q) => (
                <button
                  key={q}
                  onClick={() => onStartResearch(q)}
                  className="px-3 py-1 rounded-lg bg-white/80 hover:bg-white text-[11px] font-medium text-scientific-text border border-scientific-border hover:border-scientific-primary/40 shadow-2xs transition-all hover:scale-102 flex items-center gap-1"
                >
                  <span className="truncate max-w-[200px] sm:max-w-none">{q}</span>
                  <ChevronRight className="w-3 h-3 text-scientific-primary" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hero Interactive Research Intelligence Preview Card */}
        <div className="relative z-10 max-w-5xl mx-auto mt-14">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-scientific-border shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-scientific-border pb-4 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-scientific-muted block">
                    Grounded Research Session #BMQ-8317
                  </span>
                  <h3 className="text-base font-bold text-scientific-text">
                    "What research exists on metformin and Alzheimer's disease?"
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Evidence Confidence: 88%
                </span>
                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Mixed Evidence Detected
                </span>
              </div>
            </div>

            {/* Preview Body with Citations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4 text-xs text-slate-700">
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-scientific-primary block">
                    Executive Synthesis (Traceable Grounding)
                  </span>
                  <p className="leading-relaxed font-normal">
                    Preclinical and epidemiological literature indicates a robust biological rationale for metformin in neurodegenerative pathways <span className="citation-chip">[1]</span><span className="citation-chip">[2]</span>. Metformin activates AMP-activated protein kinase (AMPK), attenuating cortical tau hyperphosphorylation and suppressing microglial inflammasome activation <span className="citation-chip">[2]</span><span className="citation-chip">[4]</span>. While observational meta-analyses demonstrate a 24% lower incidence of dementia among diabetic cohorts <span className="citation-chip">[1]</span>, exploratory randomized trials in non-diabetic mild cognitive impairment exhibit domain-specific executive cognitive gains without statistically significant reduction in core CSF amyloid/tau ratios <span className="citation-chip">[3]</span>.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-emerald-700 block">
                      AMPK / Tau Mechanism
                    </span>
                    <p className="text-[11px] text-slate-600">
                      41% reduction in AT8-positive phosphorylated tau in cortical spheroids [2].
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-blue-700 block">
                      Active Phase 2/3 Trial
                    </span>
                    <p className="text-[11px] text-slate-600">
                      NCT04098666 evaluating 2000 mg/day extended-release metformin.
                    </p>
                  </div>
                </div>
              </div>

              {/* Mini Evidence Knowledge Graph preview */}
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-scientific-muted block mb-2">
                    Evidence Graph Projection
                  </span>
                  <div className="space-y-2 text-[11px] font-semibold">
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 text-rose-700">
                      <Dna className="w-3.5 h-3.5" />
                      <span>Alzheimer's Disease</span>
                    </div>
                    <div className="flex items-center justify-center text-scientific-muted text-xs">↓</div>
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 text-blue-700">
                      <Pill className="w-3.5 h-3.5" />
                      <span>Metformin (CHEMBL1431)</span>
                    </div>
                    <div className="flex items-center justify-center text-scientific-muted text-xs">↓</div>
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 text-teal-700">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AMPK Kinase Activation</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onStartResearch("What research exists on metformin and Alzheimer's disease?")}
                  className="w-full py-2 bg-white hover:bg-slate-50 text-scientific-primary font-bold text-xs rounded-lg border border-blue-200 transition-colors shadow-2xs text-center"
                >
                  Open Full Interactive Workspace →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-scientific-primary">
            End-to-End Scientific Architecture
          </span>
          <h2 className="text-3xl font-extrabold text-scientific-text">
            Built for rigorous, evidence-grounded research.
          </h2>
          <p className="text-sm text-scientific-muted">
            BioMindQ eliminates hallucinated claims through strict multi-source retrieval, structured entity resolution, conflict detection, and traceable citation mapping.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass-card p-6 rounded-2xl border border-scientific-border space-y-4 hover:shadow-premium transition-all">
            <div className="w-12 h-12 rounded-xl bg-scientific-blueLight text-scientific-primary flex items-center justify-center">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-scientific-text">
              Zero-Hallucination Evidence
            </h3>
            <p className="text-xs text-scientific-muted leading-relaxed">
              Every scientific assertion is indexed directly against NCBI PubMed, EMBL-EBI ChEMBL bioassays, or ClinicalTrials.gov registries with clickable provenance markers.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card p-6 rounded-2xl border border-scientific-border space-y-4 hover:shadow-premium transition-all">
            <div className="w-12 h-12 rounded-xl bg-scientific-cyanLight text-scientific-secondary flex items-center justify-center">
              <Network className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-scientific-text">
              React Flow Knowledge Graphs
            </h3>
            <p className="text-xs text-scientific-muted leading-relaxed">
              Dynamically maps multidimensional relationships between Diseases, Compounds, Targets, Mechanisms, Publications, Researchers, and Clinical Trials.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card p-6 rounded-2xl border border-scientific-border space-y-4 hover:shadow-premium transition-all">
            <div className="w-12 h-12 rounded-xl bg-scientific-purpleLight text-scientific-accent flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-scientific-text">
              Conflict Detection & Timelines
            </h3>
            <p className="text-xs text-scientific-muted leading-relaxed">
              Automatically flags divergent outcomes between epidemiological cohorts and clinical trials, providing transparent scientific context rather than artificial certainty.
            </p>
          </div>
        </div>

        {/* Intelligence Explorers Strip */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-scientific-blueLight/50 via-white to-scientific-cyanLight/50 border border-scientific-border grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <button
            onClick={() => onExploreExplorer('compounds')}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-scientific-primary shadow-xs transition-all hover:scale-105 space-y-1 text-left"
          >
            <Pill className="w-5 h-5 text-scientific-primary mb-2" />
            <div className="font-bold text-xs text-scientific-text">Compound Explorer</div>
            <div className="text-[11px] text-scientific-muted">SMILES, weights & targets</div>
          </button>

          <button
            onClick={() => onExploreExplorer('diseases')}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-scientific-primary shadow-xs transition-all hover:scale-105 space-y-1 text-left"
          >
            <Dna className="w-5 h-5 text-rose-500 mb-2" />
            <div className="font-bold text-xs text-scientific-text">Disease Explorer</div>
            <div className="text-[11px] text-scientific-muted">Pathophysiology & research volume</div>
          </button>

          <button
            onClick={() => onExploreExplorer('clinical-trials')}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-scientific-primary shadow-xs transition-all hover:scale-105 space-y-1 text-left"
          >
            <ShieldCheck className="w-5 h-5 text-amber-500 mb-2" />
            <div className="font-bold text-xs text-scientific-text">Clinical Trials</div>
            <div className="text-[11px] text-scientific-muted">Phase 1-4 protocol registry</div>
          </button>

          <button
            onClick={() => onExploreExplorer('collections')}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-scientific-primary shadow-xs transition-all hover:scale-105 space-y-1 text-left"
          >
            <BookOpen className="w-5 h-5 text-scientific-accent mb-2" />
            <div className="font-bold text-xs text-scientific-text">Saved Collections</div>
            <div className="text-[11px] text-scientific-muted">Export research dossiers</div>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-scientific-border py-8 px-6 text-center text-xs text-scientific-muted space-y-2 bg-white">
        <p className="font-bold text-scientific-text">
          BioMindQ — Biomedical Intelligence. Grounded in Evidence.
        </p>
        <p className="text-[11px]">
          Intended strictly for biomedical research and informational purposes. Not a substitute for professional clinical medical advice.
        </p>
      </footer>
    </div>
  );
};
