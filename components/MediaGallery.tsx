'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Film, 
  Image as ImageIcon, 
  Download, 
  Share2, 
  RotateCcw, 
  Maximize2, 
  Play, 
  Pause, 
  Copy, 
  Check, 
  Layers, 
  Sliders,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { GenerationJob } from '@/lib/types';

interface MediaGalleryProps {
  jobs: GenerationJob[];
  onReusePrompt: (prompt: string, negativePrompt?: string) => void;
  onSendToI2V: (imageUrl: string) => void;
  selectedJobId?: string | null;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  jobs,
  onReusePrompt,
  onSendToI2V,
  selectedJobId,
}) => {
  const completedJobs = jobs.filter(j => j.status === 'completed' && j.resultUrl);
  const [activeJob, setActiveJob] = useState<GenerationJob>(() => {
    if (selectedJobId) {
      const found = completedJobs.find(j => j.id === selectedJobId);
      if (found) return found;
    }
    return completedJobs[0] || null;
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);

  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Sparkles className="h-6 w-6 text-indigo-400" />
          <span>Wan 2.0 Media Gallery & Inspector</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Scrub, inspect parameters, download high-bitrate outputs, and chain media into new generations.
        </p>
      </div>

      {completedJobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-xs text-slate-500 bg-surface">
          No generated media yet. Use Video, Image, or Audio Studio to create your first masterpiece!
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Showcase / Player (Left 8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {activeJob ? (
              <div className="rounded-2xl border border-white/5 bg-surface overflow-hidden shadow-2xl">
                {/* Media Container */}
                <div className="relative flex justify-center items-center bg-black/60 min-h-[400px] max-h-[580px]">
                  {activeJob.modality === 'video' ? (
                    <video
                      ref={videoRef}
                      src={activeJob.resultUrl}
                      controls
                      autoPlay
                      loop
                      className="max-h-[580px] w-auto object-contain"
                    />
                  ) : activeJob.modality === 'image' ? (
                    <img
                      src={activeJob.resultUrl}
                      alt="Generation output"
                      className="max-h-[580px] w-auto object-contain"
                    />
                  ) : (
                    <div className="p-12 text-center space-y-4">
                      <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Sparkles className="h-8 w-8" />
                      </div>
                      <audio src={activeJob.resultUrl} controls className="mx-auto w-72" />
                    </div>
                  )}
                </div>

                {/* Player Toolbar */}
                <div className="flex flex-wrap items-center justify-between p-4 border-t border-white/5 gap-3 bg-[#0c0e16]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white capitalize">{activeJob.modality}</span>
                    <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] text-indigo-300 font-mono">
                      {activeJob.model}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {activeJob.width}x{activeJob.height}
                    </span>
                  </div>

                  {activeJob.modality === 'video' && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span>Speed:</span>
                      {[0.5, 1, 1.5, 2].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSpeedChange(s)}
                          className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                            playbackSpeed === s ? 'bg-indigo-600 text-white' : 'hover:bg-white/5 text-slate-400'
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {activeJob.resultUrl && (
                      <a
                        href={activeJob.resultUrl}
                        download={`wan2_${activeJob.id}.${activeJob.modality === 'video' ? 'mp4' : 'png'}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Thumbnail Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {completedJobs.map((job) => {
                const isSelected = activeJob?.id === job.id;
                return (
                  <button
                    key={job.id}
                    onClick={() => setActiveJob(job)}
                    className={`group relative aspect-video rounded-xl overflow-hidden border transition-all ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/50 scale-[1.02]'
                        : 'border-white/5 opacity-70 hover:opacity-100 hover:border-white/20'
                    }`}
                  >
                    <img
                      src={job.thumbnailUrl || job.resultUrl}
                      alt="thumb"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                      <span className="text-[10px] text-white font-mono truncate">{job.model}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Inspector Panel (Right 4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {activeJob && (
              <div className="rounded-2xl border border-white/5 bg-surface p-5 space-y-5">
                <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Generation Metadata</span>
                </h2>

                {/* Prompt block */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Positive Prompt</span>
                    <button
                      onClick={() => handleCopyPrompt(activeJob.prompt)}
                      className="flex items-center gap-1 text-[11px] text-indigo-400 hover:underline"
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="p-3 rounded-xl border border-white/10 bg-[#0d0f17] text-xs text-slate-200 leading-relaxed">
                    {activeJob.prompt}
                  </p>
                </div>

                {/* Negative prompt */}
                {activeJob.negativePrompt && (
                  <div className="space-y-1.5">
                    <span className="text-xs text-slate-400">Negative Prompt</span>
                    <p className="p-2.5 rounded-xl border border-white/5 bg-black/30 text-[11px] text-slate-400">
                      {activeJob.negativePrompt}
                    </p>
                  </div>
                )}

                {/* Parameter details grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02]">
                    <span className="text-[10px] text-slate-500 uppercase block">Seed</span>
                    <span className="font-mono text-white font-bold">{activeJob.seed}</span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02]">
                    <span className="text-[10px] text-slate-500 uppercase block">Steps</span>
                    <span className="font-mono text-white font-bold">{activeJob.totalSteps}</span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02]">
                    <span className="text-[10px] text-slate-500 uppercase block">Aspect / Res</span>
                    <span className="font-mono text-white font-bold">{activeJob.aspectRatio}</span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02]">
                    <span className="text-[10px] text-slate-500 uppercase block">FPS / Duration</span>
                    <span className="font-mono text-white font-bold">{activeJob.fps ? `${activeJob.fps}fps / ${activeJob.duration}s` : 'Still'}</span>
                  </div>
                </div>

                {/* LoRAs list */}
                {activeJob.loras && activeJob.loras.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs text-slate-400">Attached LoRAs:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeJob.loras.map((l) => (
                        <span key={l.id} className="rounded bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[10px] text-cyan-300">
                          {l.name} ({l.weight.toFixed(2)})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Re-chain Buttons */}
                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => onReusePrompt(activeJob.prompt, activeJob.negativePrompt)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Reuse Parameters & Prompt</span>
                  </button>

                  {(activeJob.modality === 'image' || activeJob.thumbnailUrl) && (
                    <button
                      onClick={() => onSendToI2V(activeJob.thumbnailUrl || activeJob.resultUrl || '')}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 p-2.5 text-xs font-bold text-indigo-300 hover:bg-indigo-600/30 transition-colors"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                      <span>Send to Image-to-Video (I2V)</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
