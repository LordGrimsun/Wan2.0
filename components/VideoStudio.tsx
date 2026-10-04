'use client';

import React, { useState } from 'react';
import { 
  Wand2, 
  Sparkles, 
  Play, 
  Upload, 
  X, 
  Dices, 
  Sliders, 
  Film, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  Download,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { VIDEO_MODELS, ASPECT_RATIOS, PROMPT_STYLES } from '@/lib/constants';
import { ActiveLora, GenerationJob, VideoSubMode } from '@/lib/types';
import { enhancePromptForModel } from '@/lib/promptEnhancer';

interface VideoStudioProps {
  onEnqueueJob: (job: Omit<GenerationJob, 'id' | 'createdAt' | 'status' | 'progress' | 'currentStep' | 'totalSteps'>) => void;
  activeLoras: ActiveLora[];
  setActiveTab: (tab: string) => void;
  currentGeneratingJob?: GenerationJob | null;
  completedVideoJobs: GenerationJob[];
}

export const VideoStudio: React.FC<VideoStudioProps> = ({
  onEnqueueJob,
  activeLoras,
  setActiveTab,
  currentGeneratingJob,
  completedVideoJobs,
}) => {
  const [subMode, setSubMode] = useState<VideoSubMode>('t2v');
  const [selectedModel, setSelectedModel] = useState<string>('wan-2.1-14b');
  const [prompt, setPrompt] = useState<string>('A majestic snow leopard prowling through a misty bamboo mountain pass at sunrise, ultra high fidelity, cinematic lighting');
  const [negativePrompt, setNegativePrompt] = useState<string>('blurry, jitter, distorted face, low quality, duplicate, cartoon, artifacting');
  const [showNegative, setShowNegative] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [resolution, setResolution] = useState<'480p' | '720p' | '1080p'>('720p');
  const [duration, setDuration] = useState<number>(5);
  const [fps, setFps] = useState<number>(24);
  const [steps, setSteps] = useState<number>(30);
  const [cfgScale, setCfgScale] = useState<number>(6.5);
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 9999999));
  
  // Media uploads for I2V / V2V
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceVideo, setSourceVideo] = useState<string | null>(null);

  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Selected preview video in player
  const [selectedPreviewJob, setSelectedPreviewJob] = useState<GenerationJob | null>(null);

  const currentModelObj = VIDEO_MODELS.find(m => m.id === selectedModel) || VIDEO_MODELS[0];
  const currentRatioObj = ASPECT_RATIOS.find(r => r.id === aspectRatio) || ASPECT_RATIOS[0];

  // Active display video: either currently selected, or newest completed video
  const activeDisplayJob = selectedPreviewJob || completedVideoJobs[0] || null;

  const handleEnhance = () => {
    setIsEnhancing(true);
    setTimeout(() => {
      const { enhanced, negativePrompt: autoNeg } = enhancePromptForModel(prompt, selectedModel);
      setPrompt(enhanced);
      if (!negativePrompt || negativePrompt.length < 10) {
        setNegativePrompt(autoNeg);
      }
      setIsEnhancing(false);
      showToast('Prompt enhanced for ' + currentModelObj.name);
    }, 350);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSourceImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSourceVideo(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const randomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 99999999));
  };

  const handleGenerate = () => {
    if (!prompt.trim()) {
      showToast('Please enter a prompt first');
      return;
    }

    if (subMode === 'i2v' && !sourceImage) {
      showToast('Please upload a starting image for Image-to-Video');
      return;
    }

    let baseW = currentRatioObj.width;
    let baseH = currentRatioObj.height;
    if (resolution === '480p') {
      baseW = Math.round(baseW * 0.67);
      baseH = Math.round(baseH * 0.67);
    } else if (resolution === '1080p') {
      baseW = Math.round(baseW * 1.5);
      baseH = Math.round(baseH * 1.5);
    }

    onEnqueueJob({
      modality: 'video',
      subMode,
      model: selectedModel,
      prompt,
      negativePrompt: showNegative ? negativePrompt : undefined,
      seed,
      width: baseW,
      height: baseH,
      fps,
      duration,
      aspectRatio,
      sourceImage: sourceImage || undefined,
      sourceVideo: sourceVideo || undefined,
      loras: activeLoras,
    });

    showToast('✨ Generating video with ' + currentModelObj.name + '...');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-950/90 px-4 py-3 text-sm font-medium text-white shadow-xl backdrop-blur-md">
          <CheckCircle2 className="h-4 w-4 text-cyan-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Film className="h-6 w-6 text-indigo-400" />
            <span>Wan 2.0 Video Generation Studio</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Produce hyper-realistic, temporal-consistent AI video using Wan 2.1, HunyuanVideo, and MiniMax H3.
          </p>
        </div>

        {/* Sub-modes: T2V, I2V, V2V */}
        <div className="inline-flex rounded-xl bg-surface-border p-1">
          <button
            onClick={() => setSubMode('t2v')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              subMode === 't2v' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Text to Video
          </button>
          <button
            onClick={() => setSubMode('i2v')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              subMode === 'i2v' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Image to Video (I2V)
          </button>
          <button
            onClick={() => setSubMode('v2v')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              subMode === 'v2v' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Video to Video (V2V)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Model, Prompt, Inputs & Parameters */}
        <div className="lg:col-span-7 space-y-6">
          {/* Model Selection */}
          <div className="rounded-2xl border border-white/5 bg-surface p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Select Video Foundation Model
              </label>
              <span className="text-[11px] text-indigo-400 font-medium">
                VRAM: {currentModelObj.vramRequirement}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {VIDEO_MODELS.map((model) => {
                const isSelected = selectedModel === model.id;
                return (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setSteps(model.defaultSteps);
                    }}
                    className={`group relative flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/15' 
                        : 'border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {model.name}
                      </span>
                      {model.badge && (
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-400'
                        }`}>
                          {model.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2">
                      {model.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* I2V / V2V Media Upload */}
          {subMode === 'i2v' && (
            <div className="rounded-2xl border border-white/5 bg-surface p-5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Starting Reference Frame (Image to Video)
              </label>
              {sourceImage ? (
                <div className="relative group rounded-xl overflow-hidden border border-indigo-500/30 max-h-60 flex justify-center bg-black/40">
                  <img src={sourceImage} alt="Starting Frame" className="object-contain max-h-60 w-auto" />
                  <button
                    onClick={() => setSourceImage(null)}
                    className="absolute top-3 right-3 rounded-full bg-red-600/80 p-1.5 text-white hover:bg-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-6 hover:border-indigo-500/50 hover:bg-indigo-500/5 cursor-pointer transition-all">
                  <Upload className="h-7 w-7 text-indigo-400 mb-1" />
                  <span className="text-xs font-medium text-slate-200">Click or drop starting frame image</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, WebP</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>
          )}

          {subMode === 'v2v' && (
            <div className="rounded-2xl border border-white/5 bg-surface p-5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Input Video Guide (Video to Video)
              </label>
              {sourceVideo ? (
                <div className="relative group rounded-xl overflow-hidden border border-indigo-500/30 max-h-60 flex justify-center bg-black/40">
                  <video src={sourceVideo} controls className="object-contain max-h-60 w-auto" />
                  <button
                    onClick={() => setSourceVideo(null)}
                    className="absolute top-3 right-3 rounded-full bg-red-600/80 p-1.5 text-white hover:bg-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-6 hover:border-indigo-500/50 hover:bg-indigo-500/5 cursor-pointer transition-all">
                  <Film className="h-7 w-7 text-indigo-400 mb-1" />
                  <span className="text-xs font-medium text-slate-200">Upload source video</span>
                  <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                </label>
              )}
            </div>
          )}

          {/* Prompt Section */}
          <div className="rounded-2xl border border-white/5 bg-surface p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Wand2 className="h-3.5 w-3.5 text-indigo-400" />
                <span>Video Generation Prompt</span>
              </label>
              <button
                onClick={handleEnhance}
                disabled={isEnhancing}
                className="flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20"
              >
                <Sparkles className={`h-3.5 w-3.5 ${isEnhancing ? 'animate-spin' : ''}`} />
                <span>{isEnhancing ? 'Enhancing...' : 'Enhance with Deepy'}</span>
              </button>
            </div>

            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to see in motion..."
              className="w-full rounded-xl border border-white/10 bg-[#0d0f17] p-3 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-500 font-medium mr-1">Styles:</span>
              {PROMPT_STYLES.map((style) => (
                <button
                  key={style.label}
                  onClick={() => setPrompt((prev) => `${prev.trim()}, ${style.tag}`)}
                  className="rounded-lg bg-white/[0.04] px-2 py-1 text-[11px] font-medium text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  {style.label}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-white/5">
              <button
                onClick={() => setShowNegative(!showNegative)}
                className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                {showNegative ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                <span>Negative Prompt (Exclude artifacts)</span>
              </button>

              {showNegative && (
                <div className="mt-2">
                  <textarea
                    rows={2}
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0d0f17] p-2 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Parameters & Sliders */}
          <div className="rounded-2xl border border-white/5 bg-surface p-5 space-y-4">
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-indigo-400" />
              <span>Generation Parameters</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio.id}
                  onClick={() => setAspectRatio(ratio.id)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    aspectRatio === ratio.id 
                      ? 'border-indigo-500 bg-indigo-500/15 text-white' 
                      : 'border-white/5 bg-white/[0.02] text-slate-400 hover:bg-white/[0.05]'
                  }`}
                >
                  <span className="text-xs font-bold block">{ratio.id}</span>
                  <span className="text-[10px] text-slate-500">{ratio.width}x{ratio.height}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Resolution</label>
                <div className="flex gap-1">
                  {(['480p', '720p', '1080p'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setResolution(r)}
                      className={`flex-1 py-1 text-xs rounded border ${
                        resolution === r ? 'border-indigo-500 bg-indigo-500/20 text-white' : 'border-white/5 text-slate-400'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Duration</label>
                <div className="flex gap-1">
                  {[3, 5, 8].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`flex-1 py-1 text-xs rounded border ${
                        duration === d ? 'border-indigo-500 bg-indigo-500/20 text-white' : 'border-white/5 text-slate-400'
                      }`}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Framerate</label>
                <div className="flex gap-1">
                  {[16, 24, 30].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFps(f)}
                      className={`flex-1 py-1 text-xs rounded border ${
                        fps === f ? 'border-indigo-500 bg-indigo-500/20 text-white' : 'border-white/5 text-slate-400'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Denoising Steps</span>
                  <span className="text-indigo-400 font-bold">{steps}</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={50}
                  value={steps}
                  onChange={(e) => setSteps(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Seed</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(Number(e.target.value))}
                    className="flex-1 rounded-lg border border-white/10 bg-[#0d0f17] px-2.5 py-1 text-xs text-slate-200"
                  />
                  <button
                    onClick={randomizeSeed}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  >
                    <Dices className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                onClick={handleGenerate}
                disabled={Boolean(currentGeneratingJob)}
                className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-fuchsia-600 p-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-500/25 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
              >
                {currentGeneratingJob ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Synthesizing Video... ({Math.round(currentGeneratingJob.progress)}%)</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-white" />
                    <span>Generate Video</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Video Output, Player & Recent Outputs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-white/5 bg-surface p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Play className="h-3.5 w-3.5 text-indigo-400" />
                <span>Live Video Output</span>
              </span>

              {currentGeneratingJob && (
                <span className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold animate-pulse">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Denoising Step {currentGeneratingJob.currentStep}/{currentGeneratingJob.totalSteps}</span>
                </span>
              )}
            </div>

            {/* Video Canvas / Player Area */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/80 aspect-video flex items-center justify-center">
              {currentGeneratingJob ? (
                /* Generating Live View */
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 w-full">
                  <div className="relative flex h-16 w-16 items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                    <Film className="h-6 w-6 text-indigo-400 animate-pulse" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">Synthesizing Temporal Latents...</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Wan 2.1 Diffusion Model • Step {currentGeneratingJob.currentStep} of {currentGeneratingJob.totalSteps}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full max-w-xs space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>Progress</span>
                      <span className="text-cyan-400 font-bold">{Math.round(currentGeneratingJob.progress)}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-fuchsia-500 transition-all duration-300"
                        style={{ width: `${currentGeneratingJob.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : activeDisplayJob?.resultUrl ? (
                /* Completed Video Playback */
                <video
                  key={activeDisplayJob.id}
                  src={activeDisplayJob.resultUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="h-full w-full object-contain"
                />
              ) : (
                /* Empty Placeholder */
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
                  <Film className="h-10 w-10 text-slate-600 mb-2" />
                  <p className="text-xs font-medium text-slate-400">No video generated yet</p>
                  <p className="text-[11px] text-slate-600 mt-1">Click "Generate Video" to create your first clip</p>
                </div>
              )}
            </div>

            {/* Video Controls & Download */}
            {activeDisplayJob?.resultUrl && !currentGeneratingJob && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-[11px] text-indigo-300 font-semibold truncate max-w-[200px]">
                    {activeDisplayJob.model} • {activeDisplayJob.width}x{activeDisplayJob.height}
                  </span>
                  <span className="text-[10px] text-slate-500">Seed: {activeDisplayJob.seed}</span>
                </div>

                <p className="text-xs text-slate-300 bg-black/40 p-2.5 rounded-xl border border-white/5 line-clamp-2">
                  "{activeDisplayJob.prompt}"
                </p>

                <div className="flex items-center gap-2">
                  <a
                    href={activeDisplayJob.resultUrl}
                    download={`wan2_${activeDisplayJob.id}.mp4`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Video (MP4)</span>
                  </a>

                  <button
                    onClick={() => {
                      const img = activeDisplayJob.thumbnailUrl || activeDisplayJob.resultUrl;
                      if (img) {
                        setSourceImage(img);
                        setSubMode('i2v');
                        showToast('Loaded frame into Image-to-Video!');
                      }
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10"
                    title="Send to Image-to-Video"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                    <span>I2V</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Recent Video Generations Carousel */}
          {completedVideoJobs.length > 0 && (
            <div className="rounded-2xl border border-white/5 bg-surface p-4 space-y-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Recent Generations ({completedVideoJobs.length})
              </span>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {completedVideoJobs.slice(0, 8).map((job) => {
                  const isSelected = activeDisplayJob?.id === job.id;
                  return (
                    <button
                      key={job.id}
                      onClick={() => setSelectedPreviewJob(job)}
                      className={`relative aspect-video rounded-xl overflow-hidden border transition-all ${
                        isSelected
                          ? 'border-indigo-500 ring-2 ring-indigo-500/50 scale-[1.02]'
                          : 'border-white/5 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={job.thumbnailUrl || job.resultUrl}
                        alt="thumb"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Play className="h-4 w-4 fill-white text-white" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
