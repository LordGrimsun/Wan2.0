'use client';

import React, { useState } from 'react';
import { 
  X, 
  Server, 
  Zap, 
  Sparkles, 
  Cpu, 
  Check, 
  AlertCircle, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { SettingsConfig } from '@/lib/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsConfig;
  onSave: (newSettings: SettingsConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [localSettings, setLocalSettings] = useState<SettingsConfig>(settings);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  if (!isOpen) return null;

  const handleTestLocal = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/health?url=' + encodeURIComponent(localSettings.localUrl));
      if (res.ok) {
        setTestResult('success');
      } else {
        setTestResult('error');
      }
    } catch {
      setTestResult('error');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#0d0f17] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Engine & Backend Configuration</h2>
              <p className="text-[11px] text-slate-400">Configure local Wan2GP runner or Cloud GPU endpoints</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 py-4">
          {/* Backend Mode Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Execution Backend Engine
            </label>
            <div className="space-y-2">
              {[
                {
                  id: 'demo',
                  title: 'Interactive Studio Engine (Recommended on Vercel)',
                  desc: 'Zero configuration required. Instant high-resolution preview generation, sampling steps simulation, and sample gallery.',
                  icon: Sparkles,
                },
                {
                  id: 'local_wan2gp',
                  title: 'Local Wan2GP Backend (CUDA GPU)',
                  desc: 'Connect to your locally running wgp.py server with PyTorch, CUDA, and full Wan 2.1 weights.',
                  icon: Server,
                },
                {
                  id: 'cloud_fal',
                  title: 'Cloud GPU (Fal.ai API)',
                  desc: 'Run Wan 2.1, LTX-Video, and Flux in the cloud with ultra-fast inference speed.',
                  icon: Zap,
                },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = localSettings.backendMode === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setLocalSettings(prev => ({ ...prev, backendMode: item.id as any }))}
                    className={`flex w-full items-start gap-3 p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                        : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className={`mt-0.5 p-1.5 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <span className={`text-xs font-bold block ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {item.title}
                      </span>
                      <span className="text-[11px] text-slate-400 leading-normal block mt-0.5">
                        {item.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Local Wan2GP URL config */}
          {localSettings.backendMode === 'local_wan2gp' && (
            <div className="rounded-2xl border border-white/5 bg-surface p-4 space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Local Wan2GP Host URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={localSettings.localUrl}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, localUrl: e.target.value }))}
                  placeholder="http://127.0.0.1:7860"
                  className="flex-1 rounded-xl border border-white/10 bg-[#08090e] px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
                <button
                  onClick={handleTestLocal}
                  disabled={testingConnection}
                  className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20"
                >
                  {testingConnection ? 'Testing...' : 'Test'}
                </button>
              </div>

              {testResult === 'success' && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <Check className="h-3.5 w-3.5" />
                  <span>Successfully connected to Wan2GP local runner!</span>
                </div>
              )}
              {testResult === 'error' && (
                <div className="flex items-center gap-1.5 text-xs text-amber-400">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Could not reach local server. Ensure `python wgp.py` is running.</span>
                </div>
              )}
            </div>
          )}

          {/* Cloud API Key config */}
          {localSettings.backendMode === 'cloud_fal' && (
            <div className="rounded-2xl border border-white/5 bg-surface p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Fal.ai API Key</label>
                <a
                  href="https://fal.ai/dashboard/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <span>Get API Key</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <input
                type="password"
                value={localSettings.falApiKey || ''}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, falApiKey: e.target.value }))}
                placeholder="fal_key_..."
                className="w-full rounded-xl border border-white/10 bg-[#08090e] px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          )}

          {/* VRAM profile */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Hardware & VRAM Profile
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'low', label: 'Low (6GB VRAM)', desc: 'mmgp aggressive offload' },
                { id: 'balanced', label: 'Balanced (8-16GB)', desc: 'Standard offload' },
                { id: 'high', label: 'High (24GB+)', desc: 'Full VRAM resident' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setLocalSettings(prev => ({ ...prev, vramProfile: p.id as any }))}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    localSettings.vramProfile === p.id
                      ? 'border-indigo-500 bg-indigo-500/15 text-white'
                      : 'border-white/5 bg-white/[0.02] text-slate-400'
                  }`}
                >
                  <span className="text-xs font-bold block">{p.label}</span>
                  <span className="text-[10px] text-slate-500 block">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/5">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
