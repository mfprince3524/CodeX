import React, { useState, useEffect, useRef } from 'react';
import {
  Maximize2,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Copy,
  Check,
  Eye,
  Atom,
  Sparkles
} from 'lucide-react';

interface MoleculeViewerProps {
  name: string;
  smiles?: string;
  molecularFormula?: string;
  molecularWeight?: number;
  targets?: string[];
}

export const MoleculeViewer: React.FC<MoleculeViewerProps> = ({
  name,
  smiles = 'CN(C)C(=N)NC(=N)N',
  molecularFormula = 'C4H11N5',
  molecularWeight = 129.16,
  targets = ['AMPK', 'Complex I']
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [rotationAngle, setRotationAngle] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [copied, setCopied] = useState(false);

  const handleCopySmiles = () => {
    if (smiles) {
      navigator.clipboard.writeText(smiles);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Render chemical structure onto HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotationAngle * Math.PI) / 180);
    ctx.scale(zoomLevel, zoomLevel);

    if (viewMode === '2D') {
      // Draw 2D chemical structure graph with bonds and heteroatoms
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#0A5BFF';
      ctx.fillStyle = '#102033';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Example skeletal coordinates based on molecule complexity
      const nodes = [
        { x: -70, y: -20, label: 'N' },
        { x: -30, y: -20, label: 'C' },
        { x: -30, y: -60, label: 'NH' },
        { x: 15, y: -20, label: 'N' },
        { x: 55, y: -20, label: 'C' },
        { x: 55, y: -60, label: 'NH' },
        { x: 95, y: -20, label: 'NH2' },
        { x: -110, y: -45, label: 'CH3' },
        { x: -110, y: 15, label: 'CH3' }
      ];

      const bonds = [
        [0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [4, 6], [0, 7], [0, 8]
      ];

      // Draw Bonds
      bonds.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      });

      // Draw Atom Nodes
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 14, 0, 2 * Math.PI);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = n.label.startsWith('N') ? '#0A5BFF' : (n.label.startsWith('O') ? '#D94343' : '#64748B');
        ctx.stroke();

        ctx.fillStyle = n.label.startsWith('N') ? '#0A5BFF' : (n.label.startsWith('O') ? '#D94343' : '#102033');
        ctx.fillText(n.label, n.x, n.y);
      });
    } else {
      // 3D Ball and Stick representation
      const particles = [
        { x: -60, y: 10, z: 20, r: 10, color: '#3B82F6' },
        { x: -20, y: -10, z: -10, r: 12, color: '#334155' },
        { x: 20, y: 15, z: 15, r: 10, color: '#3B82F6' },
        { x: 60, y: -15, z: -20, r: 12, color: '#334155' },
        { x: 90, y: 10, z: 10, r: 8, color: '#10B981' }
      ];

      // Draw 3D bonds
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#94A3B8';
      for (let i = 0; i < particles.length - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[i + 1].x, particles[i + 1].y);
        ctx.stroke();
      }

      // Draw 3D atom spheres with shading gradient
      particles.forEach((p) => {
        const grad = ctx.createRadialGradient(p.x - 3, p.y - 3, 2, p.x, p.y, p.r);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.4, p.color);
        grad.addColorStop(1, '#0F172A');

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
        ctx.fillStyle = grad;
        ctx.fill();
      });
    }

    ctx.restore();
  }, [rotationAngle, zoomLevel, viewMode, smiles]);

  return (
    <div className="glass-card p-5 rounded-2xl border border-scientific-border space-y-4 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Atom className="w-4 h-4 text-scientific-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-scientific-muted">
            Chemical Structure & Molecular Geometry
          </span>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setViewMode('2D')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              viewMode === '2D' ? 'bg-white text-scientific-primary shadow-xs' : 'text-scientific-muted'
            }`}
          >
            2D Skeletal
          </button>
          <button
            onClick={() => setViewMode('3D')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              viewMode === '3D' ? 'bg-white text-scientific-primary shadow-xs' : 'text-scientific-muted'
            }`}
          >
            3D Ball & Stick
          </button>
        </div>
      </div>

      {/* Canvas viewport with controls */}
      <div className="relative w-full h-56 bg-slate-50/90 rounded-xl border border-slate-200/90 flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={380}
          height={220}
          className="w-full h-full object-contain cursor-grab active:cursor-grabbing"
        />

        {/* Viewport tool buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 bg-white/90 backdrop-blur-xs p-1 rounded-lg border border-slate-200 shadow-xs">
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.15))}
            className="p-1 text-slate-600 hover:text-scientific-primary rounded"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.15))}
            className="p-1 text-slate-600 hover:text-scientific-primary rounded"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setRotationAngle((a) => (a + 45) % 360)}
            className="p-1 text-slate-600 hover:text-scientific-primary rounded"
            title="Rotate 45°"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-white/80 backdrop-blur-xs rounded text-[10px] font-mono text-slate-600 border border-slate-200">
          Formula: <span className="font-bold text-scientific-text">{molecularFormula}</span> | MW: <span className="font-bold text-scientific-text">{molecularWeight} g/mol</span>
        </div>
      </div>

      {/* SMILES Section */}
      {smiles && (
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
          <div className="overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-wider text-scientific-muted block">
              Canonical SMILES
            </span>
            <code className="text-xs font-mono text-slate-700 truncate block">
              {smiles}
            </code>
          </div>
          <button
            onClick={handleCopySmiles}
            className="p-2 text-scientific-muted hover:text-scientific-primary rounded-lg hover:bg-white border border-slate-200 transition-colors"
            title="Copy SMILES"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
};
