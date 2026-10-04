export type Modality = 'video' | 'image' | 'audio';
export type VideoSubMode = 't2v' | 'i2v' | 'v2v';
export type ImageSubMode = 't2i' | 'i2i' | 'inpaint';
export type AudioSubMode = 'tts' | 'clone' | 'soundtrack';

export interface ModelDefinition {
  id: string;
  name: string;
  modality: Modality;
  version: string;
  vramRequirement: string;
  badge?: string;
  description: string;
  defaultSteps: number;
  maxFps?: number;
}

export interface AspectRatioOption {
  id: string;
  label: string;
  ratio: string;
  width: number;
  height: number;
  iconName: 'landscape' | 'portrait' | 'square' | 'ultrawide';
}

export interface ActiveLora {
  id: string;
  name: string;
  triggerWord: string;
  weight: number;
  category: string;
}

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface GenerationJob {
  id: string;
  modality: Modality;
  subMode: string;
  model: string;
  prompt: string;
  negativePrompt?: string;
  status: JobStatus;
  progress: number;
  currentStep: number;
  totalSteps: number;
  seed: number;
  width: number;
  height: number;
  fps?: number;
  duration?: number;
  aspectRatio: string;
  sourceImage?: string;
  sourceVideo?: string;
  maskImage?: string;
  loras: ActiveLora[];
  resultUrl?: string;
  thumbnailUrl?: string;
  createdAt: number;
  completedAt?: number;
  error?: string;
  audioVoice?: string;
}

export interface SettingsConfig {
  backendMode: 'demo' | 'local_wan2gp' | 'cloud_replicate' | 'cloud_fal';
  localUrl: string;
  replicateApiKey?: string;
  falApiKey?: string;
  huggingfaceToken?: string;
  vramProfile: 'low' | 'balanced' | 'high';
  autoEnhancePrompt: boolean;
  saveHistoryLocally: boolean;
}
