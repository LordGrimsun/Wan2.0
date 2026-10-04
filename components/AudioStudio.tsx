'use client';

import React, { useState } from 'react';
import { 
  Music, 
  Mic, 
  Volume2, 
  Play, 
  Pause, 
  Upload, 
  CheckCircle2, 
  Sparkles, 
  Radio, 
  Sliders 
} from 'lucide-react';
import { AUDIO_MODELS } from '@/lib/constants';
import { AudioSubMode, GenerationJob } from '@/lib/types';

interface AudioStudioProps {
  onEnqueueJob: (job: Omit<GenerationJob, 'id' | 'createdAt' | 'status' | 'progress' | 'currentStep' | 'totalSteps'>) => void;
}

export const AudioStudio: React.FC<AudioStudioProps> = ({ onEnqueueJob }) => {
  const [subMode, setSubMode] = useState<AudioSubMode>('tts');
  const [selectedModel, setSelectedModel] = useState<string>('qwen3-tts');
  const [prompt, setPrompt] = useState<string>('Welcome to Wan 2.0 Studio, powered by open-source intelligence. Let your ideas transform into motion and cinema.');
  const [voicePreset, setVoicePreset] = useState<string>('narrator-epic');
  const [clonedSample, setClonedSample] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setClonedSample(file.name);
      showToast('Voice sample loaded: ' + file.name);
    }
  };

  const handleGenerate = () => {
    if (!prompt.trim()) {
      showToast('Please enter text or audio description');
      return;
    }

    onEnqueueJob({
      modality: 'audio',
      subMode,
      model: selectedModel,
      prompt,
      seed: Math.floor(Math.random() * 999999),
      width: 0,
      height: 0,
      aspectRatio: 'audio',
      audioVoice: voicePreset,
      loras: [],
    });

    showToast('Audio synthesis job queued!');
  };

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
            <Music className="h-6 w-6 text-emerald-400" />
            <span>Wan 2.0 Audio, TTS & Soundtracks</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Qwen3 Conversational TTS, MiniMax Voice Cloning, and MMAudio Video Soundtrack Generator.
          </p>
        </div>

        <div className="inline-flex rounded-xl bg-surface-border p-1">
          <button
            onClick={() => setSubMode('tts')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              subMode === 'tts' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Text to Speech
          </button>
          <button
            onClick={() => setSubMode('clone')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              subMode === 'clone' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Voice Clone H3
          </button>
          <button
            onClick={() => setSubMode('soundtrack')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              subMode === 'soundtrack' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Video Soundtrack (MMAudio)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* Models */}
          <div className="rounded-2xl border border-white/5 bg-surface p-5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Audio Model Engine
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {AUDIO_MODELS.map((model) => {
                const isSelected = selectedModel === model.id;
                return (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/15'
                        : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {model.name}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium mt-0.5">{model.badge}</span>
                    <span className="text-[10px] text-slate-500 mt-1 line-clamp-2">{model.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voice Cloning Sample Uploader */}
          {subMode === 'clone' && (
            <div className="rounded-2xl border border-white/5 bg-surface p-5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Voice Reference Audio (3-10 Seconds)
              </label>
              {clonedSample ? (
                <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs">
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    <span>Target Voice: {clonedSample}</span>
                  </div>
                  <button onClick={() => setClonedSample(null)} className="text-slate-400 hover:text-white">
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-6 hover:border-emerald-500/50 hover:bg-emerald-500/5 cursor-pointer">
                  <Mic className="h-6 w-6 text-emerald-400 mb-1" />
                  <span className="text-xs text-slate-200">Upload WAV, MP3 or FLAC voice sample</span>
                  <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
                </label>
              )}
            </div>
          )}

          {/* Text input */}
          <div className="rounded-2xl border border-white/5 bg-surface p-5 space-y-3">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              {subMode === 'soundtrack' ? 'Soundtrack Mood / Scene Description' : 'Script / Speech Text'}
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter text to synthesize..."
              className="w-full rounded-xl border border-white/10 bg-[#0d0f17] p-3 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Right Settings */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-white/5 bg-surface p-5 space-y-5">
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-emerald-400" />
              <span>Voice & Acoustics</span>
            </h2>

            {subMode === 'tts' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Voice Persona</label>
                <div className="space-y-1.5">
                  {[
                    { id: 'narrator-epic', label: 'Epic Cinema Narrator (Deep & Resonant)' },
                    { id: 'conversational-female', label: 'Evelyn (Warm & Expressive)' },
                    { id: 'conversational-male', label: 'Arthur (British Formal & Clear)' },
                    { id: 'cyber-ai', label: 'Sora / Deepy AI (Futuristic & Calm)' },
                  ].map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVoicePreset(v.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-all ${
                        voicePreset === v.id
                          ? 'border-emerald-500 bg-emerald-500/15 text-white font-semibold'
                          : 'border-white/5 bg-white/[0.02] text-slate-400 hover:text-white'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleGenerate}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 p-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-500/25 hover:brightness-110 active:scale-[0.98]"
            >
              <Volume2 className="h-4 w-4" />
              <span>Synthesize Audio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
