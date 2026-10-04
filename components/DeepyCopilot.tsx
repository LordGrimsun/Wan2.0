'use client';

import React, { useState } from 'react';
import { Bot, Sparkles, Send, ArrowRight, Lightbulb, Zap, Cpu } from 'lucide-react';

interface DeepyCopilotProps {
  onApplyPrompt: (prompt: string) => void;
  setActiveTab: (tab: string) => void;
}

interface Message {
  role: 'deepy' | 'user';
  text: string;
  suggestedPrompt?: string;
}

export const DeepyCopilot: React.FC<DeepyCopilotProps> = ({
  onApplyPrompt,
  setActiveTab,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'deepy',
      text: "Hello! I am Deepy, your Wan2GP generative AI copilot. I can help you engineer cinematic prompts, optimize VRAM offloading with mmgp, choose between Wan 2.1 14B vs 1.3B, or configure batch queues. What would you like to create today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickQuestions = [
    { label: '🎬 Cinematic Camera Prompt', query: 'Write a cinematic slow-motion drone prompt for Wan 2.1' },
    { label: '⚡ 6GB VRAM Low-Memory Guide', query: 'How do I run Wan 2.1 on 6GB VRAM or older GPUs?' },
    { label: '🌌 Hunyuan vs Wan 2.1', query: 'What is the difference between HunyuanVideo and Wan 2.1?' },
    { label: '🎨 LoRA Stacking Advice', query: 'How do I combine LoRAs without burning the video?' },
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = { role: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      let suggested: string | undefined = undefined;

      const lower = query.toLowerCase();
      if (lower.includes('cinematic') || lower.includes('prompt')) {
        reply = "Here is an optimized Wan 2.1 prompt engineered for maximum motion clarity and volumetric lighting. Wan 2.1 responds best to descriptive motion phrases (such as 'panning camera', 'slow tracking shot', 'bioluminescent glow') rather than keyword spam.";
        suggested = "Cinematic slow-motion 35mm tracking shot of an ancient Tibetan temple suspended in a sea of glowing clouds at dawn, golden hour sunlight slicing through prayer flags, 8k resolution, photorealistic physics, film grain";
      } else if (lower.includes('6gb') || lower.includes('vram') || lower.includes('hardware')) {
        reply = "To run on 6GB-8GB VRAM cards (like RTX 2060, 3060, or older 1080Ti):\n1. Use Wan 2.1 (1.3B) or quantised FP8 / GGUF checkpoints with mmgp offloading.\n2. Set resolution to 480p or 720p with 25-30 steps.\n3. Enable 'Low VRAM Profile' in Settings. If you have no local GPU, switch backend to 'Cloud GPU (Fal.ai / Replicate)' or enjoy our instant Interactive Engine!";
      } else if (lower.includes('hunyuan')) {
        reply = "HunyuanVideo excels at complex fluid dynamics, human gestures, and 24fps motion fidelity. Wan 2.1 (14B) leads in photorealism, detailed environmental textures, and prompt adherence. Use Hunyuan for dance/fluid motion and Wan 2.1 for cinema & landscapes!";
      } else {
        reply = "I've analyzed your idea! For Wan 2.1, make sure to set guidance scale (CFG) between 5.0 and 7.0 and use 24fps for smooth motion. Here is a crafted prompt ready for Video Studio:";
        suggested = `Hyper-detailed dynamic sequence of ${query.trim()}, cinematic lighting, photorealistic textures, 4k ultra-high definition, smooth temporal flow`;
      }

      setMessages(prev => [...prev, { role: 'deepy', text: reply, suggestedPrompt: suggested }]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shadow-lg shadow-indigo-500/10">
          <Bot className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Deepy AI Copilot</span>
            <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] text-indigo-300 font-semibold border border-indigo-500/30">
              OFFLINE AGENT
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Intelligent assistant for prompt architecture, VRAM management, and hardware optimization.
          </p>
        </div>
      </div>

      {/* Suggested Quick Starters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {quickQuestions.map((q) => (
          <button
            key={q.label}
            onClick={() => handleSend(q.query)}
            className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-surface text-left text-xs text-slate-300 hover:border-indigo-500/40 hover:bg-white/[0.04] transition-all"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              <span>{q.label}</span>
            </div>
            <ArrowRight className="h-3 w-3 text-slate-500" />
          </button>
        ))}
      </div>

      {/* Chat Thread */}
      <div className="min-h-[380px] max-h-[500px] overflow-y-auto space-y-4 rounded-2xl border border-white/5 bg-surface p-5 scrollbar-thin">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-[#0c0e17] border border-white/10 text-slate-200'
              }`}
            >
              <div className="whitespace-pre-line">{m.text}</div>

              {m.suggestedPrompt && (
                <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                    Recommended Prompt:
                  </span>
                  <p className="font-mono text-[11px] text-slate-300 bg-black/40 p-2.5 rounded-lg border border-white/5">
                    "{m.suggestedPrompt}"
                  </p>
                  <button
                    onClick={() => {
                      if (m.suggestedPrompt) {
                        onApplyPrompt(m.suggestedPrompt);
                        setActiveTab('video');
                      }
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/30 transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Apply to Video Studio</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-indigo-400 bg-surface p-3 rounded-xl border border-white/5 w-fit">
            <Bot className="h-4 w-4 animate-bounce" />
            <span>Deepy is synthesizing recommendations...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask Deepy about models, prompts, hardware, or generation parameters..."
          className="flex-1 rounded-xl border border-white/10 bg-surface px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
        />
        <button
          onClick={() => handleSend()}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
