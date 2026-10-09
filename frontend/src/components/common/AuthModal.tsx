import React, { useState } from 'react';
import {
  X,
  User,
  Lock,
  Mail,
  ShieldCheck,
  Activity,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  LogIn,
  UserPlus
} from 'lucide-react';

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height_cm: number;
  weight_kg: number;
  blood_group: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSaveUser: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveUser
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'profile'>('login');
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(currentUser.role);
  const [age, setAge] = useState(currentUser.age);
  const [gender, setGender] = useState(currentUser.gender);
  const [heightCm, setHeightCm] = useState(currentUser.height_cm);
  const [weightKg, setWeightKg] = useState(currentUser.weight_kg);
  const [bloodGroup, setBloodGroup] = useState(currentUser.blood_group);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      name: name.trim() || 'Farhan',
      email: email.trim() || 'farhan@biomindq.ai',
      role: role || 'Biomedical Researcher',
      age: Number(age) || 32,
      gender,
      height_cm: Number(heightCm) || 175,
      weight_kg: Number(weightKg) || 78,
      blood_group: bloodGroup || 'O+'
    };
    onSaveUser(updated);
    setSuccessMsg(
      mode === 'login'
        ? `Welcome back, ${updated.name}!`
        : mode === 'register'
        ? `Account registered successfully for ${updated.name}!`
        : `Health profile updated for ${updated.name}!`
    );
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1200);
  };

  const handleQuickLogin = (demoName: string, demoRole: string, demoAge: number, demoWeight: number) => {
    const updated: UserProfile = {
      name: demoName,
      email: `${demoName.toLowerCase().replace(/\s+/g, '')}@biomindq.ai`,
      role: demoRole,
      age: demoAge,
      gender: 'male',
      height_cm: 175,
      weight_kg: demoWeight,
      blood_group: 'O+'
    };
    onSaveUser(updated);
    setSuccessMsg(`Signed in as ${demoName}!`);
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-[#002B2E] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00A896] to-[#00D1C1] flex items-center justify-center text-white font-bold text-sm">
              <span>⬡</span>
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                BioMind<span className="text-[#00D1C1]">Q</span> Account & Health Profile
              </h2>
              <p className="text-[11px] text-[#A3C6C6]">
                Personalized AI Healthcare & Predictive Simulation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#A3C6C6] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2.5 text-center transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-white text-[#00606B] border-b-2 border-[#00606B]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2.5 text-center transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-white text-[#00606B] border-b-2 border-[#00606B]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>
          <button
            onClick={() => setMode('profile')}
            className={`flex-1 py-2.5 text-center transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'profile'
                ? 'bg-white text-[#00606B] border-b-2 border-[#00606B]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Health Metrics</span>
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="m-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {mode === 'login' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email / Username</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name or email (e.g. Farhan)"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#00606B] bg-slate-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#00606B] bg-slate-50"
                  />
                </div>
              </div>

              {/* One-click Demo Profiles */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Quick Demo Accounts
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('Farhan', 'Healthcare Innovator', 32, 78)}
                    className="p-2 rounded-lg border border-slate-200 hover:border-[#00A896] hover:bg-teal-50/50 text-left transition-all"
                  >
                    <div className="font-bold text-slate-800 text-[11px]">Farhan</div>
                    <div className="text-[10px] text-slate-500">Lead User (Age 32, 78kg)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('Dr. Aisha Patel', 'Clinical Pharmacologist', 41, 65)}
                    className="p-2 rounded-lg border border-slate-200 hover:border-[#00A896] hover:bg-teal-50/50 text-left transition-all"
                  >
                    <div className="font-bold text-slate-800 text-[11px]">Dr. Aisha Patel</div>
                    <div className="text-[10px] text-slate-500">Physician (Age 41, 65kg)</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Farhan"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#00606B]"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="farhan@example.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#00606B]"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Primary Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#00606B]"
                >
                  <option value="Healthcare Innovator">Healthcare Innovator</option>
                  <option value="Biomedical Researcher">Biomedical Researcher</option>
                  <option value="Clinical Pharmacologist">Clinical Pharmacologist</option>
                  <option value="Medical Student">Medical Student</option>
                  <option value="Patient / Health Enthusiast">Patient / Health Enthusiast</option>
                </select>
              </div>
            </div>
          )}

          {mode === 'profile' && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#00606B]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#00606B]"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#00606B]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#00606B]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#00606B]"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-[#002B2E] hover:bg-[#003B3F] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <span>{mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Save Health Profile'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#00D1C1]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
