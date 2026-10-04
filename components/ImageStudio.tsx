'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Wand2, 
  Upload, 
  X, 
  Paintbrush, 
  Eraser, 
  Trash2, 
  Dices, 
  Sliders, 
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';
import { IMAGE_MODELS, ASPECT_RATIOS, PROMPT_STYLES } from '@/lib/constants';
import { ActiveLora, GenerationJob, ImageSubMode } from '@/lib/types';
import { enhancePromptForModel } from '@/lib/promptEnhancer';

interface ImageStudioProps {
  onEnqueueJob: (job: Omit<GenerationJob, 'id' | 'createdAt' | 'status' | 'progress' | 'currentStep' | 'totalSteps'>) => void;
  activeLoras: ActiveLora[];
}

export const ImageStudio: React.FC<ImageStudioProps> = ({
  onEnqueueJob,
  activeLoras,
}) => {
  const [subMode, setSubMode] = useState<ImageSubMode>('t2i');
  const [selectedModel, setSelectedModel] = useState<string>('flux-1-dev');
  const [prompt, setPrompt] = useState<string>('A stunning hyper-detailed cybernetic samurai meditating in an ethereal neon Kyoto garden, 8k resolution');
  const [negativePrompt, setNegativePrompt] = useState<string>('ugly, bad anatomy, deformed, lowres, blurry');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [steps, setSteps] = useState<number>(28);
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 9999999));
  const [sourceImage, setSourceImage] = useState<string | null>(null);

  // Inpaint Canvas state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [brushSize, setBrushSize] = useState<number>(24);
  const [brushMode, setBrushMode] = useState<'paint' | 'erase'>('paint');

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const currentRatio = ASPECT_RATIOS.find(r => r.id === aspectRatio) || ASPECT_RATIOS[2];
  const currentModel = IMAGE_MODELS.find(m => m.id === selectedModel) || IMAGE_MODELS[0];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleEnhance = () => {
    const { enhanced, negativePrompt: neg } = enhancePromptForModel(prompt, selectedModel);
    setPrompt(enhanced);
    setNegativePrompt(neg);
    showToast('Prompt optimized for ' + currentModel.name);
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

  // Canvas drawing handlers for inpainting mask
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (brushMode === 'paint') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
    } else {
      ctx.globalCompositeOperation = 'destination-out';
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearMask = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      showToast('Mask cleared');
    }
  };

  const handleGenerate = () => {
    if (!prompt.trim()) {
      showToast('Please enter an image prompt');
      return;
    }

    let maskData: string | undefined = undefined;
    if (subMode === 'inpaint' && canvasRef.current) {
      maskData = canvasRef.current.toDataURL('image/png');
    }

    onEnqueueJob({
      modality: 'image',
      subMode,
      model: selectedModel,
      prompt,
      negativePrompt,
      seed,
      width: currentRatio.width,
      height: currentRatio.height,
      aspectRatio,
      sourceImage: sourceImage || undefined,
      maskImage: maskData,
      loras: activeLoras,
    });

    showToast('Image job queued!');
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
            <ImageIcon className="h-6 w-6 text-fuchsia-400" />
            <span>Wan 2.0 Image & Canvas Studio</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate photorealistic visuals, edit existing photos, and brush inpaint with Flux.1 and Qwen Image.
          </p>
        </div>

        {/* Sub-mode selector */}
        <div className="inline-flex rounded-xl bg-surface-border p-1">
          <button
            onClick={() => setSubMode('t2i')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              subMode === 't2i' ? 'bg-fuchsia-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Text to Image
          </button>
          <button
            onClick={() => setSubMode('i2i')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              subMode === 'i2i' ? 'bg-fuchsia-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Image to Image (I2I)
          </button>
          <button
            onClick={() => setSubMode('inpaint')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              subMode === 'inpaint' ? 'bg-fuchsia-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mask & Inpaint
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* Model Selector */}
          <div className="rounded-2xl border border-white/5 bg-surface p-5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Image Model Engine
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {IMAGE_MODELS.map((model) => {
                const isSelected = selectedModel === model.id;
                return (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setSteps(model.defaultSteps);
                    }}
                    className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-fuchsia-500 bg-fuchsia-500/10 shadow-lg shadow-fuchsia-500/15'
                        : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {model.name}
                    </span>
                    <span className="text-[10px] text-fuchsia-400 font-medium mt-0.5">{model.badge}</span>
                    <span className="text-[10px] text-slate-500 mt-1 line-clamp-2">{model.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Inpaint / I2I Canvas Workspace */}
          {(subMode === 'i2i' || subMode === 'inpaint') && (
            <div className="rounded-2xl border border-white/5 bg-surface p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {subMode === 'inpaint' ? 'Inpaint Mask Canvas' : 'Source Reference Image'}
                </label>

                {subMode === 'inpaint' && sourceImage && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBrushMode('paint')}
                      className={`flex items-center gap-1 rounded px-2 py-1 text-xs ${
                        brushMode === 'paint' ? 'bg-red-500 text-white' : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      <Paintbrush className="h-3 w-3" />
                      <span>Mask Brush</span>
                    </button>
                    <button
                      onClick={() => setBrushMode('erase')}
                      className={`flex items-center gap-1 rounded px-2 py-1 text-xs ${
                        brushMode === 'erase' ? 'bg-slate-600 text-white' : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      <Eraser className="h-3 w-3" />
                      <span>Erase</span>
                    </button>
                    <button
                      onClick={clearMask}
                      className="flex items-center gap-1 rounded px-2 py-1 text-xs bg-white/5 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Clear</span>
                    </button>
                    <input
                      type="range"
                      min={8}
                      max={64}
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-16 accent-red-500"
                      title="Brush Size"
                    />
                  </div>
                )}
              </div>

              {sourceImage ? (
                <div className="relative mx-auto flex justify-center items-center rounded-xl overflow-hidden border border-fuchsia-500/30 bg-black/50 max-h-96">
                  <img src={sourceImage} alt="Canvas Target" className="max-h-96 object-contain pointer-events-none" />
                  {subMode === 'inpaint' && (
                    <canvas
                      ref={canvasRef}
                      width={512}
                      height={512}
                      onMouseDown={startDrawing}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onMouseMove={draw}
                      className="absolute inset-0 h-full w-full cursor-crosshair z-10"
                    />
                  )}
                  <button
                    onClick={() => setSourceImage(null)}
                    className="absolute top-3 right-3 rounded-full bg-red-600/80 p-1.5 text-white hover:bg-red-500 z-20"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-8 hover:border-fuchsia-500/50 hover:bg-fuchsia-500/5 cursor-pointer transition-all">
                  <Upload className="h-8 w-8 text-fuchsia-400 mb-2" />
                  <span className="text-sm font-medium text-slate-200">Upload source image to edit / inpaint</span>
                  <span className="text-xs text-slate-500 mt-1">PNG, JPG, WebP</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>
          )}

          {/* Prompt Section */}
          <div className="rounded-2xl border border-white/5 bg-surface p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Wand2 className="h-3.5 w-3.5 text-fuchsia-400" />
                <span>Image Prompt</span>
              </label>
              <button
                onClick={handleEnhance}
                className="flex items-center gap-1.5 rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/10 px-2.5 py-1 text-xs font-medium text-fuchsia-300 hover:bg-fuchsia-500/20"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Enhance with Deepy</span>
              </button>
            </div>

            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your desired image masterpiece..."
              className="w-full rounded-xl border border-white/10 bg-[#0d0f17] p-3 text-sm text-slate-100 placeholder-slate-500 focus:border-fuchsia-500 focus:outline-none"
            />

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-500 font-medium mr-1">Styles:</span>
              {PROMPT_STYLES.map((style) => (
                <button
                  key={style.label}
                  onClick={() => setPrompt((prev) => `${prev.trim()}, ${style.tag}`)}
                  className="rounded-lg bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Settings */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-white/5 bg-surface p-5 space-y-5">
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-fuchsia-400" />
              <span>Image Parameters</span>
            </h2>

            {/* Aspect Ratio */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Dimensions</label>
              <div className="grid grid-cols-3 gap-2">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => setAspectRatio(ratio.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                      aspectRatio === ratio.id
                        ? 'border-fuchsia-500 bg-fuchsia-500/15 text-white'
                        : 'border-white/5 bg-white/[0.02] text-slate-400 hover:bg-white/[0.05]'
                    }`}
                  >
                    <span className="text-xs font-bold">{ratio.id}</span>
                    <span className="text-[10px] text-slate-500">{ratio.width}x{ratio.height}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                <span>Inference Steps</span>
                <span className="text-fuchsia-400 font-bold">{steps}</span>
              </div>
              <input
                type="range"
                min={4}
                max={50}
                value={steps}
                onChange={(e) => setSteps(Number(e.target.value))}
                className="w-full accent-fuchsia-500 cursor-pointer"
              />
            </div>

            {/* Seed */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Seed</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(Number(e.target.value))}
                  className="flex-1 rounded-lg border border-white/10 bg-[#0d0f17] px-3 py-1.5 text-xs text-slate-200 focus:border-fuchsia-500 focus:outline-none"
                />
                <button
                  onClick={() => setSeed(Math.floor(Math.random() * 99999999))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                >
                  <Dices className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Generate Action */}
            <div className="pt-2">
              <button
                onClick={handleGenerate}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 p-3.5 text-sm font-bold text-white shadow-xl shadow-fuchsia-500/25 hover:brightness-110 active:scale-[0.98]"
              >
                <Sparkles className="h-4 w-4" />
                <span>Generate Image</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
