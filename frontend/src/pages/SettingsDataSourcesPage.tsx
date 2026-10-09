import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  CheckCircle2,
  AlertCircle,
  Key,
  Cpu,
  RefreshCw,
  ShieldCheck,
  Zap,
  Server,
  Activity,
  Sliders
} from 'lucide-react';
import type { DataSourceStatus, SystemSettings } from '../types';
import { api } from '../services/api';

export const SettingsDataSourcesPage: React.FC = () => {
  const [dataSources, setDataSources] = useState<DataSourceStatus[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [llmProvider, setLlmProvider] = useState('evidence_only');
  const [customKey, setCustomKey] = useState('');
  const [cacheEnabled, setCacheEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api.getSettings();
      setDataSources(res.data_sources || []);
      setSettings(res.settings);
      if (res.settings) {
        setLlmProvider(res.settings.llm_provider || 'evidence_only');
        setCacheEnabled(res.settings.cache_enabled);
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateSettings({
        llm_provider: llmProvider,
        cache_enabled: cacheEnabled
      });
      setSaveMsg('Settings updated successfully!');
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (err) {
      console.error('Failed to update settings', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-scientific-primary font-semibold text-xs uppercase tracking-wider">
          <Settings className="w-4 h-4" />
          <span>System Configuration & Telemetry</span>
        </div>
        <h1 className="text-2xl font-bold text-scientific-text tracking-tight">
          Settings & Data Sources
        </h1>
        <p className="text-xs text-scientific-muted leading-relaxed max-w-2xl">
          Manage biomedical API adapters, AI synthesis providers (Gemini / OpenAI / Evidence-Only mode), and response caching.
        </p>
      </div>

      {saveMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-academic text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveMsg}</span>
        </div>
      )}

      {/* Live Data Sources Grid */}
      <div className="bg-scientific-surface border border-scientific-border rounded-academic p-5 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-scientific-primary" />
            <h2 className="text-sm font-bold text-scientific-text">Biomedical Public APIs & Adapters</h2>
          </div>
          <button
            onClick={loadSettings}
            className="text-[11px] text-scientific-primary font-semibold hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh Status</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {dataSources.map((ds, idx) => (
            <div
              key={idx}
              className="p-4 bg-scientific-bg rounded-academic border border-scientific-border space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-scientific-text">{ds.name}</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Connected
                </span>
              </div>
              <div className="font-mono text-[10.5px] text-scientific-muted truncate">
                {ds.endpoint}
              </div>
              <div className="flex items-center justify-between text-[11px] text-scientific-muted pt-1 border-t border-scientific-border">
                <span>Latency: <strong className="text-scientific-text">{ds.latency_ms} ms</strong></span>
                <span>{ds.rate_limit_info}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Synthesis Configuration */}
      <div className="bg-scientific-surface border border-scientific-border rounded-academic p-5 shadow-subtle space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-scientific-primary" />
          <h2 className="text-sm font-bold text-scientific-text">AI Synthesis & Grounding Mode</h2>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
          <div className="space-y-2">
            <label className="font-semibold text-scientific-text block">
              Synthesis Engine Provider:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                onClick={() => setLlmProvider('evidence_only')}
                className={`p-3.5 rounded-academic border cursor-pointer space-y-1 ${
                  llmProvider === 'evidence_only'
                    ? 'bg-scientific-sage border-scientific-sageDark shadow-subtle font-semibold'
                    : 'bg-scientific-bg border-scientific-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-scientific-text">Evidence-Only Mode</span>
                  <input
                    type="radio"
                    name="llm"
                    checked={llmProvider === 'evidence_only'}
                    onChange={() => setLlmProvider('evidence_only')}
                    className="text-scientific-primary"
                  />
                </div>
                <p className="text-[11px] text-scientific-muted font-normal leading-relaxed">
                  Strictly grounded factual synthesis directly parsed from retrieved PubMed/ChEMBL records without hallucinations.
                </p>
              </label>

              <label
                onClick={() => setLlmProvider('gemini')}
                className={`p-3.5 rounded-academic border cursor-pointer space-y-1 ${
                  llmProvider === 'gemini'
                    ? 'bg-scientific-sage border-scientific-sageDark shadow-subtle font-semibold'
                    : 'bg-scientific-bg border-scientific-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-scientific-text">Google Gemini 1.5 / 2.0</span>
                  <input
                    type="radio"
                    name="llm"
                    checked={llmProvider === 'gemini'}
                    onChange={() => setLlmProvider('gemini')}
                    className="text-scientific-primary"
                  />
                </div>
                <p className="text-[11px] text-scientific-muted font-normal leading-relaxed">
                  Deep biomedical context synthesis with full structured output schema validation.
                </p>
              </label>

              <label
                onClick={() => setLlmProvider('openai')}
                className={`p-3.5 rounded-academic border cursor-pointer space-y-1 ${
                  llmProvider === 'openai'
                    ? 'bg-scientific-sage border-scientific-sageDark shadow-subtle font-semibold'
                    : 'bg-scientific-bg border-scientific-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-scientific-text">OpenAI GPT-4o</span>
                  <input
                    type="radio"
                    name="llm"
                    checked={llmProvider === 'openai'}
                    onChange={() => setLlmProvider('openai')}
                    className="text-scientific-primary"
                  />
                </div>
                <p className="text-[11px] text-scientific-muted font-normal leading-relaxed">
                  Standard OpenAI RAG synthesis using server-side configuration.
                </p>
              </label>
            </div>
          </div>

          {/* Cache Control */}
          <div className="pt-2 border-t border-scientific-border flex items-center justify-between">
            <div>
              <span className="font-semibold text-scientific-text block">Biomedical Query Response Caching</span>
              <span className="text-scientific-muted text-[11px]">Caches repeated PubMed and ChEMBL calls to optimize latency.</span>
            </div>
            <input
              type="checkbox"
              checked={cacheEnabled}
              onChange={(e) => setCacheEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-scientific-primary focus:ring-scientific-primary"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-scientific-primary hover:bg-scientific-primaryHover text-white font-semibold rounded-academic transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>

      {/* Safety & Compliance Card */}
      <div className="bg-scientific-surface border border-scientific-border rounded-academic p-5 shadow-subtle space-y-2 text-xs">
        <div className="flex items-center gap-2 text-scientific-primary font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Scientific Accuracy & Non-Clinical Disclaimer</span>
        </div>
        <p className="text-scientific-muted leading-relaxed text-[11px]">
          BioMindQ is intended for biomedical research and informational purposes only. It is not medical advice and must not replace qualified professional judgment. All citations map to authentic PMIDs and DOIs.
        </p>
      </div>
    </div>
  );
};
