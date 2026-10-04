'use client';

import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Sliders, 
  ExternalLink, 
  Check, 
  Search,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { POPULAR_LORAS } from '@/lib/constants';
import { ActiveLora } from '@/lib/types';

interface LoraHubProps {
  activeLoras: ActiveLora[];
  setActiveLoras: React.Dispatch<React.SetStateAction<ActiveLora[]>>;
}

export const LoraHub: React.FC<LoraHubProps> = ({
  activeLoras,
  setActiveLoras,
}) => {
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [customName, setCustomName] = useState<string>('');
  const [customTrigger, setCustomTrigger] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const categories = ['All', 'Aesthetic', 'Style', 'Anime', 'Realism', 'Motion', 'Retro'];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const isLoraActive = (id: string) => activeLoras.some(l => l.id === id);

  const toggleLora = (lora: ActiveLora) => {
    if (isLoraActive(lora.id)) {
      setActiveLoras(prev => prev.filter(l => l.id !== lora.id));
      showToast(`Removed LoRA: ${lora.name}`);
    } else {
      setActiveLoras(prev => [...prev, { ...lora, weight: 0.8 }]);
      showToast(`Activated LoRA: ${lora.name}`);
    }
  };

  const updateWeight = (id: string, weight: number) => {
    setActiveLoras(prev => prev.map(l => l.id === id ? { ...l, weight } : l));
  };

  const handleAddCustom = () => {
    if (!customName.trim()) return;
    const newLora: ActiveLora = {
      id: 'custom-' + Date.now(),
      name: customName.trim(),
      triggerWord: customTrigger.trim() || customName.toLowerCase(),
      weight: 0.8,
      category: 'Custom',
    };
    setActiveLoras(prev => [...prev, newLora]);
    setCustomName('');
    setCustomTrigger('');
    setShowAddModal(false);
    showToast(`Added custom LoRA: ${newLora.name}`);
  };

  const filteredLoras = POPULAR_LORAS.filter(lora => {
    const matchesCategory = selectedCategory === 'All' || lora.category === selectedCategory;
    const matchesSearch = lora.name.toLowerCase().includes(search.toLowerCase()) || 
                          lora.triggerWord.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-950/90 px-4 py-3 text-sm font-medium text-white shadow-xl backdrop-blur-md">
          <CheckCircle2 className="h-4 w-4 text-cyan-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Layers className="h-6 w-6 text-cyan-400" />
            <span>Wan2GP LoRA & Finetune Hub</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Stack and fine-tune community LoRAs for Wan 2.1, HunyuanVideo, and Flux models.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-600/20 hover:bg-cyan-500"
        >
          <Plus className="h-4 w-4" />
          <span>Add Custom LoRA</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Available LoRAs List */}
        <div className="lg:col-span-8 space-y-6">
          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search LoRA styles, artists, camera lenses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-surface pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="flex overflow-x-auto gap-1.5 scrollbar-none pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-cyan-600 text-white'
                      : 'bg-surface border border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredLoras.map((lora) => {
              const active = isLoraActive(lora.id);
              return (
                <div
                  key={lora.id}
                  className={`relative flex flex-col justify-between p-4 rounded-2xl border transition-all ${
                    active
                      ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                      : 'border-white/5 bg-surface hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-sm font-bold text-white">{lora.name}</h3>
                      <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-cyan-300 font-medium">
                        {lora.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono bg-black/30 p-2 rounded-lg border border-white/5 line-clamp-2">
                      <span className="text-slate-500">trigger: </span>
                      {lora.triggerWord}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/5">
                    <button
                      onClick={() => toggleLora(lora)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        active
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
                          : 'bg-cyan-600 text-white hover:bg-cyan-500'
                      }`}
                    >
                      {active ? <Trash2 className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                      <span>{active ? 'Deactivate' : 'Apply LoRA'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active LoRA Stack & Weights */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-white/5 bg-surface p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-cyan-400" />
                <span>Active Stack ({activeLoras.length})</span>
              </h2>
              {activeLoras.length > 0 && (
                <button
                  onClick={() => setActiveLoras([])}
                  className="text-[11px] text-red-400 hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {activeLoras.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No active LoRAs selected. Click "Apply LoRA" on any model style to attach it to your generations.
              </div>
            ) : (
              <div className="space-y-4">
                {activeLoras.map((lora) => (
                  <div key={lora.id} className="p-3 rounded-xl border border-white/10 bg-white/[0.02] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{lora.name}</span>
                      <button
                        onClick={() => setActiveLoras(prev => prev.filter(l => l.id !== lora.id))}
                        className="text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Strength Weight</span>
                        <span className="font-mono text-cyan-400 font-bold">{lora.weight.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min={-1.0}
                        max={2.0}
                        step={0.05}
                        value={lora.weight}
                        onChange={(e) => updateWeight(lora.id, Number(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Custom LoRA Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Add Custom LoRA / SafeTensors</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">LoRA Name</label>
                <input
                  type="text"
                  placeholder="e.g. Studio Ghibli Aesthetic"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0d0f17] p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Trigger Keywords</label>
                <input
                  type="text"
                  placeholder="e.g. ghibli style, hand-drawn anime sky"
                  value={customTrigger}
                  onChange={(e) => setCustomTrigger(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0d0f17] p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustom}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 text-white hover:bg-cyan-500"
              >
                Save & Attach
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
