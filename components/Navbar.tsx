'use client';

import React from 'react';
import { 
  Film, 
  Image as ImageIcon, 
  Music, 
  Layers, 
  Clock, 
  Sparkles, 
  Bot, 
  Settings, 
  Zap, 
  Server
} from 'lucide-react';
import { SettingsConfig } from '@/lib/types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  queueCount: number;
  settings: SettingsConfig;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  queueCount,
  settings,
  onOpenSettings,
}) => {
  const tabs = [
    { id: 'video', label: 'Video Studio', icon: Film, badge: 'Wan 2.1' },
    { id: 'image', label: 'Image Studio', icon: ImageIcon, badge: 'Flux.1' },
    { id: 'audio', label: 'Audio & Voice', icon: Music, badge: 'TTS' },
    { id: 'lora', label: 'LoRA Hub', icon: Layers },
    { id: 'queue', label: 'Queue', icon: Clock, count: queueCount },
    { id: 'gallery', label: 'Gallery', icon: Sparkles },
    { id: 'deepy', label: 'Deepy AI', icon: Bot, badge: 'Copilot' },
  ];

  const getEngineBadge = () => {
    switch (settings.backendMode) {
      case 'local_wan2gp':
        return { label: 'Local Wan2GP', icon: Server, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      case 'cloud_replicate':
      case 'cloud_fal':
        return { label: 'Cloud GPU', icon: Zap, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' };
      default:
        return { label: 'Interactive Demo', icon: Sparkles, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' };
    }
  };

  const engine = getEngineBadge();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#090a10]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-500/25">
            <Film className="h-5 w-5 text-white" />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">Wan 2.0</span>
              <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-indigo-300 border border-indigo-500/30">
                STUDIO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">DeepBeepMeep Wan2GP Super App</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 rounded-2xl bg-white/[0.03] p-1 border border-white/5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-400 px-1 text-[10px] font-bold text-slate-900 animate-pulse">
                    {tab.count}
                  </span>
                )}
                {tab.badge && !isActive && (
                  <span className="rounded bg-white/10 px-1.5 py-0.2 text-[9px] text-slate-300">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher pill */}
          <button
            onClick={onOpenSettings}
            className={`hidden sm:flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:brightness-110 ${engine.color}`}
            title="Configure Backend & Cloud APIs"
          >
            <engine.icon className="h-3.5 w-3.5" />
            <span>{engine.label}</span>
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            title="Open Settings"
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* GitHub Repo */}
          <a
            href="https://github.com/LordGrimsun/Wan2.0"
            target="_blank"
            rel="noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            title="GitHub Repository"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="flex lg:hidden overflow-x-auto px-4 py-2 border-t border-white/5 gap-2 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                isActive ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="rounded-full bg-cyan-400 px-1 text-[9px] font-bold text-slate-900">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
