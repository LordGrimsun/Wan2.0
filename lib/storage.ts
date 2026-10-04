import { GenerationJob, SettingsConfig } from './types';
import { INITIAL_GALLERY_ITEMS } from './sampleGenerations';

const JOBS_KEY = 'wan2_studio_jobs_v1';
const SETTINGS_KEY = 'wan2_studio_settings_v1';

export const DEFAULT_SETTINGS: SettingsConfig = {
  backendMode: 'demo',
  localUrl: 'http://127.0.0.1:7860',
  vramProfile: 'balanced',
  autoEnhancePrompt: false,
  saveHistoryLocally: true,
};

export function getStoredJobs(): GenerationJob[] {
  if (typeof window === 'undefined') return INITIAL_GALLERY_ITEMS;
  try {
    const raw = localStorage.getItem(JOBS_KEY);
    if (!raw) {
      localStorage.setItem(JOBS_KEY, JSON.stringify(INITIAL_GALLERY_ITEMS));
      return INITIAL_GALLERY_ITEMS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_GALLERY_ITEMS;
  }
}

export function saveStoredJobs(jobs: GenerationJob[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
  } catch (e) {
    console.error('Error saving jobs to localStorage', e);
  }
}

export function getStoredSettings(): SettingsConfig {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: SettingsConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings to localStorage', e);
  }
}
