# Wan 2.0 Studio 🎬

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/LordGrimsun/Wan2.0)
[![GitHub stars](https://img.shields.io/github/stars/LordGrimsun/Wan2.0?style=social)](https://github.com/LordGrimsun/Wan2.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Wan 2.0 Studio** is a state-of-the-art open-source generative AI platform inspired by and compatible with **DeepBeepMeep's Wan2GP** ("Generative models accessible to the GPU Poor"). 
> 
> Create breathtaking AI videos, photorealistic images, voice clones, and synchronized soundtracks directly in your browser with zero friction.

---

## ✨ Features & Modalities

### 🎥 1. Video Generation Studio
- **Text-to-Video (T2V)**, **Image-to-Video (I2V)**, and **Video-to-Video (V2V)**.
- **Supported Video Models**:
  - **Wan 2.1 (14B)**: State-of-the-art cinematic video diffusion transformer with photorealistic physics and lighting.
  - **Wan 2.1 (1.3B)**: Ultra-fast lightweight model capable of running smoothly on 4GB-6GB consumer GPUs.
  - **HunyuanVideo 1.5**: Advanced fluid motion and complex human dynamics.
  - **MiniMax H3 Video**: Reference-guided multi-frame and audio-driven synthesis.
  - **LTX-Video 2.0**: Low-latency video generation.
- **Controls**: Aspect ratio presets (16:9, 9:16, 1:1, 4:3, 21:9), resolution scaling (480p, 720p, 1080p), duration, framerate (16/24/30 fps), sampling steps, guidance scale (CFG), and seed randomization.

### 🎨 2. Image Studio & MultiCanvas Inpainting
- **Text-to-Image (T2I)** & **Image-to-Image (I2I)**.
- **Supported Image Models**: **Flux.1 Dev**, **Flux.1 Schnell**, **Qwen Image Ultra**, and **Krea 2**.
- **Interactive Inpaint Canvas**: Draw masks directly over reference images with adjustable brush size and eraser tools.

### 🔊 3. Audio, TTS & Soundtracks
- **Qwen3 TTS**: High-naturalness conversational speech with emotional inflection.
- **MiniMax Voice Clone H3**: Zero-shot voice cloning from 3-second reference audio clips.
- **MMAudio / Stable Audio**: Synchronized video soundtrack and cinematic sound effect generation.

### 🧩 4. LoRA & Finetune Hub
- Multi-LoRA stacking with granular strength sliders (-1.0 to +2.0).
- Curated presets: *Cinematic 35mm Grain*, *Cyberpunk Neo-Tokyo*, *Makoto Shinkai Anime*, *Raw Candid Photorealism*, *90s VHS Tape*, and *Hyper Slow-Motion*.
- Add custom LoRAs directly from CivitAI or Hugging Face.

### ⚡ 5. Deepy AI Copilot
- Integrated offline generation assistant.
- Recommends model-specific prompt engineering, VRAM offloading tactics, and hardware configurations.

### 📊 6. Real-Time Queue & Media Gallery
- Step-by-step progress tracking (`Step 18/30 (60%)`).
- Scrubbing video player with loop, playback speed (0.5x, 1x, 1.5x, 2x), and one-click "Send to Image-to-Video" pipeline chaining.

---

## 🚀 Quick Start & Deployment

### Deploy to Vercel (1-Click)
Deploy instantly to Vercel with zero configuration:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/LordGrimsun/Wan2.0)

### Run Locally (Web App)

```bash
# Clone the repository
git clone https://github.com/LordGrimsun/Wan2.0.git
cd Wan2.0

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔌 Dual-Engine Architecture: Connecting Backend & Cloud

Wan 2.0 Studio is engineered to work across both cloud and local setups:

1. **Interactive Studio Engine (Default)**:
   - Requires no GPU or API key.
   - Ideal for previewing, testing prompt engineering, managing LoRAs, and experimenting with the UI immediately on Vercel.

2. **Local Wan2GP PyTorch Runner (CUDA / ROCm)**:
   - Run the local Python backend on your PC:
     ```bash
     python wgp.py
     ```
   - In **Settings**, toggle to **Local Wan2GP Backend** and point to `http://127.0.0.1:7860`.

3. **Cloud GPU (Fal.ai / Replicate)**:
   - Enter your Fal.ai or Replicate API key in **Settings** to run full-weight Wan 2.1 and Flux inferences without requiring local GPU VRAM.

---

## 📜 Credits & License

- Built on the research and foundational models of **Wan 2.1** (Alibaba Wan Team), **Wan2GP** (DeepBeepMeep), **HunyuanVideo** (Tencent), and **Flux.1** (Black Forest Labs).
- Licensed under the [MIT License](LICENSE).
