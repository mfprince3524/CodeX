import React from 'react';
import { ShieldAlert, CheckCircle, ExternalLink, X, ShieldCheck } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-scientific-text/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white max-w-lg w-full rounded-academic p-6 shadow-modal border border-scientific-border space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-academic bg-scientific-sage text-scientific-primary flex items-center justify-center border border-scientific-sageDark">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-scientific-text">
                Scientific Reliability & Research Disclaimer
              </h3>
              <p className="text-xs text-scientific-muted">
                Biomedical Research and Informational Purposes Only
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-scientific-muted hover:text-scientific-text rounded hover:bg-scientific-surfaceSubtle transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-scientific-text leading-relaxed bg-scientific-bg p-4 rounded-academic border border-scientific-border">
          <p className="font-semibold text-scientific-primary">
            "BioMindQ is intended for biomedical research and informational purposes only. It is not medical advice and must not replace qualified professional judgment."
          </p>
          <ul className="list-disc pl-4 space-y-1.5 text-scientific-muted text-[11.5px]">
            <li>
              <strong className="text-scientific-text">Research Tool, Not Clinical Decision Support:</strong> BioMindQ assists researchers in exploring literature, discovering evidence conflicts, and formulating hypotheses. It does not provide medical diagnoses or prescribe treatments.
            </li>
            <li>
              <strong className="text-scientific-text">Preclinical vs Clinical Distinctions:</strong> In vitro binding assays (IC50 / Kd) and animal models do not prove human clinical efficacy or safety.
            </li>
            <li>
              <strong className="text-scientific-text">Authentic Source Mapping:</strong> All citations and reported findings reference official public repositories (NCBI PubMed, Europe PMC, and EMBL-EBI ChEMBL). Always consult primary publications and professional peers for clinical translation.
            </li>
          </ul>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-scientific-primary hover:bg-scientific-primaryHover text-white rounded-academic shadow-subtle transition-colors"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
