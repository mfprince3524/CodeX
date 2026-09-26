import React from 'react';
import { ShieldAlert, CheckCircle, ExternalLink, X } from 'lucide-react';

interface MedicalDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MedicalDisclaimerModal: React.FC<MedicalDisclaimerModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="glass-card max-w-lg w-full rounded-2xl p-6 shadow-2xl border border-scientific-border space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-scientific-warning border border-amber-200 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-scientific-text">
                Biomedical Research & Safety Notice
              </h3>
              <p className="text-xs text-scientific-muted">
                Informational and Research Purpose Only
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-scientific-muted hover:text-scientific-text rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="font-semibold text-scientific-text">
            BioMindQ is an automated biomedical research intelligence platform designed exclusively for scientists, healthcare researchers, students, and life-science professionals.
          </p>
          <ul className="list-disc pl-4 space-y-1.5">
            <li>
              <strong>No Medical Diagnosis or Treatment:</strong> The outputs, syntheses, and evidence representations provided by BioMindQ do not constitute medical advice, clinical diagnosis, or personalized patient treatment recommendations.
            </li>
            <li>
              <strong>Source Provenance:</strong> All claims are algorithmically linked to retrieved public databases (PubMed, ChEMBL, ClinicalTrials.gov). Always verify primary manuscripts and consult qualified healthcare professionals for medical decisions.
            </li>
            <li>
              <strong>Regulatory Status:</strong> Preclinical investigations, exploratory clinical trials, and bioactivities do not imply regulatory drug approval unless explicitly confirmed by authorized agencies (FDA, EMA, PMDA).
            </li>
          </ul>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-scientific-primary text-white rounded-xl shadow-premium shadow-scientific-primary/20 hover:bg-blue-600 transition-colors"
          >
            I Understand & Accept
          </button>
        </div>
      </div>
    </div>
  );
};
