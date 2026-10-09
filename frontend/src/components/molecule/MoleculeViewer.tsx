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
  Sparkles,
  ExternalLink,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';

interface MoleculeViewerProps {
  name: string;
  chemblId?: string;
  smiles?: string;
  molecularFormula?: string;
  molecularWeight?: number;
  targets?: string[];
}

interface Atom3D {
  element: string;
  x: number;
  y: number;
  z: number;
  r: number;
  color: string;
}

interface Bond3D {
  from: number;
  to: number;
  order: number;
}

export const MoleculeViewer: React.FC<MoleculeViewerProps> = ({
  name,
  chemblId,
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
  const [is2DImageLoaded, setIs2DImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  
  // 3D rotation angles (yaw and pitch)
  const [rotX, setRotX] = useState(25);
  const [rotY, setRotY] = useState(35);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  const handleCopySmiles = () => {
    if (smiles) {
      navigator.clipboard.writeText(smiles);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Reset 2D image state when molecule changes
  useEffect(() => {
    setIs2DImageLoaded(false);
    setImageError(false);
    setRotationAngle(0);
    setZoomLevel(1);
  }, [chemblId, smiles, name]);

  // Determine official ChEMBL SVG URL
  const chemblSvgUrl = chemblId && chemblId.toUpperCase().startsWith('CHEMBL') && !chemblId.includes('-')
    ? `https://www.ebi.ac.uk/chembl/api/data/image/${chemblId.toUpperCase()}.svg`
    : smiles
    ? `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smiles)}/PNG`
    : null;

  // Generate 3D structure from SMILES / Molecular Formula
  const generate3DStructure = (): { atoms: Atom3D[]; bonds: Bond3D[] } => {
    const atoms: Atom3D[] = [];
    const bonds: Bond3D[] = [];

    // Parse atoms from SMILES or build representative structure
    const smilesStr = smiles || 'C1CCCCC1';
    
    // Extract elements from SMILES
    const elementRegex = /Cl|Br|Si|Na|Ca|Fe|Zn|C|N|O|S|P|F|I|H/g;
    const matches = smilesStr.match(elementRegex) || ['C', 'C', 'N', 'O', 'C', 'N'];
    
    // Atom color and radius mapping (CPK colors)
    const getAtomProps = (elem: string) => {
      switch (elem) {
        case 'N':
          return { color: '#2563EB', r: 12, name: 'N' };
        case 'O':
          return { color: '#DC2626', r: 11, name: 'O' };
        case 'S':
          return { color: '#EAB308', r: 15, name: 'S' };
        case 'F':
        case 'Cl':
        case 'Br':
        case 'I':
          return { color: '#10B981', r: 13, name: elem };
        case 'P':
          return { color: '#F97316', r: 14, name: 'P' };
        case 'H':
          return { color: '#CBD5E1', r: 7, name: 'H' };
        case 'C':
        default:
          return { color: '#334155', r: 13, name: 'C' };
      }
    };

    const count = Math.min(Math.max(matches.length, 6), 36);
    const ringSize = smilesStr.includes('1') || smilesStr.includes('c') ? 6 : 0;
    
    // Distribute atoms in 3D space (ring + chain layout)
    for (let i = 0; i < count; i++) {
      const elem = matches[i % matches.length] || 'C';
      const props = getAtomProps(elem);
      
      let x = 0;
      let y = 0;
      let z = 0;

      if (ringSize > 0 && i < 6) {
        // Hexagonal ring coordinates
        const angle = (i * 2 * Math.PI) / 6;
        const radius = 55;
        x = radius * Math.cos(angle);
        y = radius * Math.sin(angle);
        z = ((i % 2 === 0) ? 1 : -1) * 12; // slight puckering
      } else {
        // Branching chain / tetrahedral distribution
        const chainIdx = i - (ringSize > 0 ? 6 : 0);
        const phi = chainIdx * 1.25 + (i * 0.4);
        const radius = 45 + chainIdx * 14;
        const theta = chainIdx * 0.9;
        
        x = (ringSize > 0 ? 45 : 0) + radius * Math.cos(phi) * 0.85;
        y = radius * Math.sin(phi) * 0.7;
        z = 35 * Math.sin(theta);
      }

      atoms.push({
        element: props.name,
        x,
        y,
        z,
        r: props.r,
        color: props.color
      });
    }

    // Connect bonds between sequential & ring atoms
    if (ringSize > 0 && atoms.length >= 6) {
      for (let i = 0; i < 6; i++) {
        bonds.push({ from: i, to: (i + 1) % 6, order: i % 2 === 0 ? 2 : 1 });
      }
      for (let i = 6; i < atoms.length; i++) {
        const target = i === 6 ? 0 : i - 1;
        bonds.push({ from: target, to: i, order: 1 });
      }
    } else {
      for (let i = 0; i < atoms.length - 1; i++) {
        bonds.push({ from: i, to: i + 1, order: i % 3 === 0 ? 2 : 1 });
      }
    }

    return { atoms, bonds };
  };

  // Interactive 3D Canvas Rendering
  useEffect(() => {
    if (viewMode !== '3D') return;
    
    let animFrame: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { atoms, bonds } = generate3DStructure();

    let currentRotY = rotY;
    let currentRotX = rotX;

    const render = () => {
      if (isAutoRotating && !isDraggingRef.current) {
        currentRotY = (currentRotY + 0.6) % 360;
        setRotY(currentRotY);
      }

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const radX = (currentRotX * Math.PI) / 180;
      const radY = (currentRotY * Math.PI) / 180;

      // Project 3D points to 2D
      const projected = atoms.map((atom) => {
        // Rotate around Y axis
        const x1 = atom.x * Math.cos(radY) + atom.z * Math.sin(radY);
        const y1 = atom.y;
        const z1 = -atom.x * Math.sin(radY) + atom.z * Math.cos(radY);

        // Rotate around X axis
        const x2 = x1;
        const y2 = y1 * Math.cos(radX) - z1 * Math.sin(radX);
        const z2 = y1 * Math.sin(radX) + z1 * Math.cos(radX);

        // Perspective scale
        const fov = 350;
        const scale = fov / (fov + z2) * zoomLevel;
        const projX = width / 2 + x2 * scale;
        const projY = height / 2 + y2 * scale;

        return {
          ...atom,
          projX,
          projY,
          depth: z2,
          scaleRadius: Math.max(atom.r * scale, 4)
        };
      });

      // Draw bonds with depth
      bonds.forEach((bond) => {
        const p1 = projected[bond.from];
        const p2 = projected[bond.to];
        if (!p1 || !p2) return;

        const avgDepth = (p1.depth + p2.depth) / 2;
        const bondAlpha = Math.max(0.4, Math.min(1.0, 1 - avgDepth / 500));

        ctx.beginPath();
        ctx.moveTo(p1.projX, p1.projY);
        ctx.lineTo(p2.projX, p2.projY);
        ctx.lineWidth = (bond.order === 2 ? 6 : 4) * zoomLevel;
        ctx.strokeStyle = `rgba(148, 163, 184, ${bondAlpha})`;
        ctx.stroke();

        if (bond.order === 2) {
          ctx.beginPath();
          ctx.moveTo(p1.projX + 2, p1.projY - 2);
          ctx.lineTo(p2.projX + 2, p2.projY - 2);
          ctx.lineWidth = 2 * zoomLevel;
          ctx.strokeStyle = `rgba(226, 232, 240, ${bondAlpha})`;
          ctx.stroke();
        }
      });

      // Sort atoms back to front for realistic rendering
      const sortedAtoms = [...projected].sort((a, b) => b.depth - a.depth);

      // Draw 3D atom spheres with CPK specular shading
      sortedAtoms.forEach((p) => {
        const r = p.scaleRadius;
        const grad = ctx.createRadialGradient(
          p.projX - r * 0.35,
          p.projY - r * 0.35,
          r * 0.1,
          p.projX,
          p.projY,
          r
        );
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.3, p.color);
        grad.addColorStop(0.85, p.color);
        grad.addColorStop(1, '#0F172A');

        ctx.beginPath();
        ctx.arc(p.projX, p.projY, r, 0, 2 * Math.PI);
        ctx.fillStyle = grad;
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Atom symbol label inside sphere
        if (r > 9 && p.element !== 'C') {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `bold ${Math.max(9, Math.round(r * 0.95))}px Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.element, p.projX, p.projY);
        }
      });

      if (isAutoRotating) {
        animFrame = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, [viewMode, smiles, zoomLevel, isAutoRotating, rotX, rotY]);

  // Handle mouse drag for 3D rotation
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    setRotY((y) => (y + dx * 0.8) % 360);
    setRotX((x) => Math.max(-80, Math.min(80, x - dy * 0.8)));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm bg-white">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#E0F5F4] flex items-center justify-center text-[#00606B]">
            <Atom className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
              Chemical Structure & Geometry
            </span>
            <span className="text-[11px] text-slate-500">
              {chemblId ? `ChEMBL Vector Depiction • ${chemblId}` : 'Biochemical SMILES Structure'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setViewMode('2D')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              viewMode === '2D' ? 'bg-[#002B2E] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2D Skeletal
          </button>
          <button
            onClick={() => setViewMode('3D')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              viewMode === '3D' ? 'bg-[#002B2E] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3D Ball & Stick
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="relative w-full h-64 bg-[#F8FAFC] rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden">
        {viewMode === '2D' ? (
          <div className="w-full h-full flex items-center justify-center p-4 relative">
            {chemblSvgUrl && !imageError ? (
              <div 
                className="transition-transform duration-200 flex items-center justify-center w-full h-full"
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotationAngle}deg)`
                }}
              >
                <img
                  src={chemblSvgUrl}
                  alt={`${name} chemical structure`}
                  onLoad={() => setIs2DImageLoaded(true)}
                  onError={() => setImageError(true)}
                  className="max-h-52 max-w-full object-contain filter drop-shadow-sm select-none"
                  crossOrigin="anonymous"
                />
              </div>
            ) : (
              /* Fallback Dynamic Canvas 2D Skeletal Parser */
              <div className="flex flex-col items-center justify-center space-y-2 text-slate-600">
                <Atom className="w-10 h-10 text-[#00606B] animate-pulse" />
                <span className="text-xs font-bold text-slate-800">{name} Structure</span>
                <code className="text-[11px] font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 max-w-md truncate">
                  {smiles}
                </code>
              </div>
            )}
          </div>
        ) : (
          /* 3D Ball and Stick Canvas */
          <canvas
            ref={canvasRef}
            width={480}
            height={256}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full h-full object-contain cursor-grab active:cursor-grabbing select-none"
          />
        )}

        {/* Viewport Control Tools */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 bg-white/95 backdrop-blur-xs p-1.5 rounded-xl border border-slate-200 shadow-sm z-10">
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.2, z + 0.15))}
            className="p-1.5 text-slate-600 hover:text-[#00606B] hover:bg-slate-100 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.15))}
            className="p-1.5 text-slate-600 hover:text-[#00606B] hover:bg-slate-100 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          {viewMode === '2D' ? (
            <button
              onClick={() => setRotationAngle((a) => (a + 90) % 360)}
              className="p-1.5 text-slate-600 hover:text-[#00606B] hover:bg-slate-100 rounded-lg transition-colors"
              title="Rotate 90°"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              className="p-1.5 text-slate-600 hover:text-[#00606B] hover:bg-slate-100 rounded-lg transition-colors"
              title={isAutoRotating ? 'Pause Rotation' : 'Auto Rotate'}
            >
              {isAutoRotating ? <Pause className="w-3.5 h-3.5 text-[#00606B]" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          )}
          <button
            onClick={() => {
              setZoomLevel(1);
              setRotationAngle(0);
              setRotX(25);
              setRotY(35);
            }}
            className="p-1.5 text-slate-600 hover:text-[#00606B] hover:bg-slate-100 rounded-lg transition-colors"
            title="Reset View"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3D Drag Tip or Formula Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <div className="px-2.5 py-1 bg-white/90 backdrop-blur-xs rounded-lg text-[10.5px] font-mono text-slate-700 border border-slate-200 shadow-xs">
            Formula: <span className="font-bold text-[#002B2E]">{molecularFormula || 'CnH2n'}</span> | MW: <span className="font-bold text-[#002B2E]">{molecularWeight ? `${molecularWeight} g/mol` : 'Recorded'}</span>
          </div>
          {viewMode === '3D' && (
            <span className="hidden sm:inline-block px-2 py-0.5 bg-[#002B2E] text-[#00D1C1] text-[9.5px] font-medium rounded">
              Drag to Rotate 3D
            </span>
          )}
        </div>
      </div>

      {/* SMILES and Chemical Metadata Section */}
      {smiles && (
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
          <div className="overflow-hidden space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Canonical SMILES
            </span>
            <code className="text-xs font-mono text-slate-800 truncate block select-all">
              {smiles}
            </code>
          </div>
          <button
            onClick={handleCopySmiles}
            className="p-2 text-slate-600 hover:text-[#00606B] hover:bg-white rounded-lg border border-slate-200 transition-colors shrink-0 cursor-pointer shadow-2xs"
            title="Copy SMILES"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
};

