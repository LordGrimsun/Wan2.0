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
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { VIDEO_MODELS, ASPECT_RATIOS, PROMPT_STYLES } from '@/lib/constants';
import { ActiveLora, GenerationJob, VideoSubMode } from '@/lib/types';
import { enhancePromptForModel } from '@/lib/promptEnhancer';

interface VideoStudioProps {
  onEnqueueJob: (job: Omit<GenerationJob, 'id' | 'createdAt' | 'status' | 'progress' | 'currentStep' | 'totalSteps'>) => void;
  activeLoras: ActiveLora[];
  setActiveTab: (tab: string) => void;
}

export const VideoStudio: React.FC<VideoStudioProps> = ({
  onEnqueueJob,
  activeLoras,
  setActiveTab,
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
  const [motionBucket, setMotionBucket] = useState<number>(127);
  const [denoiseStrength, setDenoiseStrength] = useState<number>(0.65);

  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const currentModelObj = VIDEO_MODELS.find(m => m.id === selectedModel) || VIDEO_MODELS[0];
  const currentRatioObj = ASPECT_RATIOS.find(r => r.id === aspectRatio) || ASPECT_RATIOS[0];

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
      showToast('Please select or upload a starting image for Image-to-Video');
      return;
    }

    // Calculate dimensions based on aspect ratio & resolution
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

    showToast('Video job queued! Check the Queue or Gallery.');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-950/90 px-4 py-3 text-sm font-medium text-white shadow-xl backdrop-blur-md">
          <CheckCircle2 className="h-4 w-4 text-cyan-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner / Mode Switcher */}
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
        {/* Left Column: Prompts, Media Inputs, & Controls */}
        <div className="lg:col-span-8 space-y-6">
          {/* Model Selection Cards */}
          <div className="rounded-2xl border border-white/5 bg-surface p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Select Video Foundation Model
              </label>
              <span className="text-[11px] text-indigo-400 font-medium">
                VRAM: {currentModelObj.vramRequirement}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {VIDEO_MODELS.map((model) => {
                const isSelected = selectedModel === model.id;
                return (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setSteps(model.defaultSteps);
                    }}
                    className={`group relative flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
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
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-400'
                        }`}>
                          {model.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">
                      {model.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* I2V / V2V Media Upload Zone */}
          {subMode === 'i2v' && (
            <div className="rounded-2xl border border-white/5 bg-surface p-5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Starting Reference Frame (Image to Video)
              </label>
              {sourceImage ? (
                <div className="relative group rounded-xl overflow-hidden border border-indigo-500/30 max-h-72 flex justify-center bg-black/40">
                  <img src={sourceImage} alt="Starting Frame" className="object-contain max-h-72 w-auto" />
                  <button
                    onClick={() => setSourceImage(null)}
                    className="absolute top-3 right-3 rounded-full bg-red-600/80 p-1.5 text-white hover:bg-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-8 hover:border-indigo-500/50 hover:bg-indigo-500/5 cursor-pointer transition-all">
                  <Upload className="h-8 w-8 text-indigo-400 mb-2" />
                  <span className="text-sm font-medium text-slate-200">Click or drop starting frame image</span>
                  <span className="text-xs text-slate-500 mt-1">PNG, JPG, WebP up to 25MB</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>
          )}

          {subMode === 'v2v' && (
            <div className="rounded-2xl border border-white/5 bg-surface p-5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Input Video Guide (Video to Video / Motion Transfer)
              </label>
              {sourceVideo ? (
                <div className="relative group rounded-xl overflow-hidden border border-indigo-500/30 max-h-72 flex justify-center bg-black/40">
                  <video src={sourceVideo} controls className="object-contain max-h-72 w-auto" />
                  <button
                    onClick={() => setSourceVideo(null)}
                    className="absolute top-3 right-3 rounded-full bg-red-600/80 p-1.5 text-white hover:bg-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-8 hover:border-indigo-500/50 hover:bg-indigo-500/5 cursor-pointer transition-all">
                  <Film className="h-8 w-8 text-indigo-400 mb-2" />
                  <span className="text-sm font-medium text-slate-200">Upload source video to restyle or animate</span>
                  <span className="text-xs text-slate-500 mt-1">MP4, WebM up to 100MB</span>
                  <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                </label>
              )}
            </div>
          )}

          {/* Prompt Editor */}
          <div className="rounded-2xl border border-white/5 bg-surface p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Wand2 className="h-3.5 w-3.5 text-indigo-400" />
                <span>Video Generation Prompt</span>
              </label>
              <button
                onClick={handleEnhance}
                disabled={isEnhancing}
                className="flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20 transition-colors"
              >
                <Sparkles className={`h-3.5 w-3.5 text-indigo-400 ${isEnhancing ? 'animate-spin' : ''}`} />
                <span>{isEnhancing ? 'Enhancing...' : 'Enhance with Deepy'}</span>
              </button>
            </div>

            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to see in motion..."
              className="w-full rounded-xl border border-white/10 bg-[#0d0f17] p-3 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />

            {/* Quick Style Injection Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-500 font-medium mr-1">Styles:</span>
              {PROMPT_STYLES.map((style) => (
                <button
                  key={style.label}
                  onClick={() => setPrompt((prev) => `${prev.trim()}, ${style.tag}`)}
                  className="rounded-lg bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  {style.label}
                </button>
              ))}
            </div>

            {/* Negative Prompt toggle */}
            <div className="pt-2 border-t border-white/5">
              <button
                onClick={() => setShowNegative(!showNegative)}
                className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                {showNegative ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                <span>Negative Prompt (Things to exclude)</span>
              </button>

              {showNegative && (
                <div className="mt-2">
                  <textarea
                    rows={2}
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="e.g. blurry, jitter, deformed, low framerate..."
                    className="w-full rounded-xl border border-white/10 bg-[#0d0f17] p-2.5 text-xs text-slate-300 placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Active LoRAs Pill Bar */}
          {activeLoras.length > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-surface px-4 py-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-medium text-slate-300">
                  Active LoRAs ({activeLoras.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeLoras.map((lora) => (
                    <span
                      key={lora.id}
                      className="rounded bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[11px] font-medium text-cyan-300"
                    >
                      {lora.name} ({lora.weight.toFixed(2)})
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setActiveTab('lora')}
                className="text-xs text-cyan-400 hover:underline"
              >
                Edit LoRAs
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Settings, Dimensions, Sliders & Generate Action */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-white/5 bg-surface p-5 space-y-5">
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-indigo-400" />
              <span>Generation Parameters</span>
            </h2>

            {/* Aspect Ratio Cards */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                {ASPECT_RATIOS.map((ratio) => {
                  const isSelected = aspectRatio === ratio.id;
                  return (
                    <button
                      key={ratio.id}
                      onClick={() => setAspectRatio(ratio.id)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-500/15 text-white' 
                          : 'border-white/5 bg-white/[0.02] text-slate-400 hover:bg-white/[0.05]'
                      }`}
                    >
                      <span className="text-xs font-bold">{ratio.id}</span>
                      <span className="text-[10px] text-slate-500">{ratio.width}x{ratio.height}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resolution Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Output Resolution</label>
              <div className="grid grid-cols-3 gap-2">
                {(['480p', '720p', '1080p'] as const).map((res) => (
                  <button
                    key={res}
                    onClick={() => setResolution(res)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      resolution === res
                        ? 'border-indigo-500 bg-indigo-500/20 text-white'
                        : 'border-white/5 bg-white/[0.02] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {res} {res === '720p' && '(HD)'} {res === '1080p' && '(FHD)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Video Duration & Framerate */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Duration: <span className="text-indigo-400 font-bold">{duration}s</span>
                </label>
                <div className="flex gap-1.5">
                  {[3, 5, 8, 10].map((d) => (
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
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  FPS: <span className="text-indigo-400 font-bold">{fps} fps</span>
                </label>
                <div className="flex gap-1.5">
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

            {/* Sampling Steps Slider */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                <span>Sampling Steps</span>
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

            {/* CFG / Guidance Scale Slider */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                <span>Guidance Scale (CFG)</span>
                <span className="text-indigo-400 font-bold">{cfgScale.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={3}
                max={9}
                step={0.5}
                value={cfgScale}
                onChange={(e) => setCfgScale(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Seed Controller */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Seed</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(Number(e.target.value))}
                  className="flex-1 rounded-lg border border-white/10 bg-[#0d0f17] px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
                <button
                  onClick={randomizeSeed}
                  title="Randomize seed"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                >
                  <Dices className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                onClick={handleGenerate}
                className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-fuchsia-600 p-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-500/25 transition-all hover:brightness-110 active:scale-[0.98]"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Generate Video</span>
              </button>
              <p className="text-center text-[11px] text-slate-500 mt-2">
                Estimated runtime: ~15-30s • Wan2GP High Quality
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
