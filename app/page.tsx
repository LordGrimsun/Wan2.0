'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { VideoStudio } from '@/components/VideoStudio';
import { ImageStudio } from '@/components/ImageStudio';
import { AudioStudio } from '@/components/AudioStudio';
import { LoraHub } from '@/components/LoraHub';
import { GenerationQueue } from '@/components/GenerationQueue';
import { MediaGallery } from '@/components/MediaGallery';
import { DeepyCopilot } from '@/components/DeepyCopilot';
import { SettingsModal } from '@/components/SettingsModal';
import { 
  getStoredJobs, 
  saveStoredJobs, 
  getStoredSettings, 
  saveStoredSettings 
} from '@/lib/storage';
import { GenerationJob, ActiveLora, SettingsConfig } from '@/lib/types';
import { POPULAR_LORAS } from '@/lib/constants';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('video');
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [activeLoras, setActiveLoras] = useState<ActiveLora[]>([POPULAR_LORAS[0]]);
  const [settings, setSettings] = useState<SettingsConfig>(getStoredSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [selectedGalleryJobId, setSelectedGalleryJobId] = useState<string | null>(null);

  // Load persisted data on mount
  useEffect(() => {
    setJobs(getStoredJobs());
    setSettings(getStoredSettings());
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (jobs.length > 0) {
      saveStoredJobs(jobs);
    }
  }, [jobs]);

  // Queue runner simulation / cloud trigger
  const enqueueJob = async (
    jobData: Omit<GenerationJob, 'id' | 'createdAt' | 'status' | 'progress' | 'currentStep' | 'totalSteps'>
  ) => {
    const totalSteps = 30;
    const newJob: GenerationJob = {
      ...jobData,
      id: 'job-' + Date.now(),
      status: 'queued',
      progress: 0,
      currentStep: 0,
      totalSteps,
      createdAt: Date.now(),
    };

    setJobs((prev) => [newJob, ...prev]);
    setActiveTab('queue');

    // Start execution simulation or dispatch
    setTimeout(() => {
      runJobExecution(newJob.id, totalSteps);
    }, 400);
  };

  const runJobExecution = async (jobId: string, totalSteps: number) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: 'processing' } : j))
    );

    // Call API for assets or parameters
    let resultPayload: any = null;
    try {
      const targetJob = jobs.find(j => j.id === jobId);
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modality: targetJob?.modality || 'video',
          prompt: targetJob?.prompt || '',
          model: targetJob?.model || 'wan-2.1-14b',
          settings,
        }),
      });
      if (res.ok) {
        resultPayload = await res.json();
      }
    } catch (e) {
      console.error('Generation API error', e);
    }

    // Step-by-step progress simulation
    let currentStep = 1;
    const interval = setInterval(() => {
      currentStep += 1;
      const progress = Math.min(100, Math.round((currentStep / totalSteps) * 100));

      setJobs((prev) =>
        prev.map((j) => {
          if (j.id === jobId) {
            return {
              ...j,
              currentStep,
              progress,
            };
          }
          return j;
        })
      );

      if (currentStep >= totalSteps) {
        clearInterval(interval);
        setTimeout(() => {
          setJobs((prev) =>
            prev.map((j) => {
              if (j.id === jobId) {
                return {
                  ...j,
                  status: 'completed',
                  progress: 100,
                  currentStep: totalSteps,
                  completedAt: Date.now(),
                  resultUrl: resultPayload?.resultUrl || 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-robotic-arm-working-in-a-laboratory-41484-large.mp4',
                  thumbnailUrl: resultPayload?.thumbnailUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1280&q=80',
                };
              }
              return j;
            })
          );
        }, 300);
      }
    }, 280);
  };

  const handleCancelJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const handleClearHistory = () => {
    setJobs((prev) => prev.filter((j) => j.status === 'processing' || j.status === 'queued'));
  };

  const handleSelectJobForGallery = (job: GenerationJob) => {
    setSelectedGalleryJobId(job.id);
    setActiveTab('gallery');
  };

  const handleReusePrompt = (prompt: string) => {
    setActiveTab('video');
  };

  const handleSendToI2V = (imageUrl: string) => {
    setActiveTab('video');
  };

  const handleApplyPromptFromDeepy = (prompt: string) => {
    setActiveTab('video');
  };

  const handleSaveSettings = (newSettings: SettingsConfig) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  const activeQueueCount = jobs.filter(
    (j) => j.status === 'processing' || j.status === 'queued'
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#08090d]">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        queueCount={activeQueueCount}
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1 pb-16">
        {activeTab === 'video' && (
          <VideoStudio
            onEnqueueJob={enqueueJob}
            activeLoras={activeLoras}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'image' && (
          <ImageStudio
            onEnqueueJob={enqueueJob}
            activeLoras={activeLoras}
          />
        )}

        {activeTab === 'audio' && (
          <AudioStudio onEnqueueJob={enqueueJob} />
        )}

        {activeTab === 'lora' && (
          <LoraHub
            activeLoras={activeLoras}
            setActiveLoras={setActiveLoras}
          />
        )}

        {activeTab === 'queue' && (
          <GenerationQueue
            jobs={jobs}
            onCancelJob={handleCancelJob}
            onClearHistory={handleClearHistory}
            onSelectJobForGallery={handleSelectJobForGallery}
          />
        )}

        {activeTab === 'gallery' && (
          <MediaGallery
            jobs={jobs}
            onReusePrompt={handleReusePrompt}
            onSendToI2V={handleSendToI2V}
            selectedJobId={selectedGalleryJobId}
          />
        )}

        {activeTab === 'deepy' && (
          <DeepyCopilot
            onApplyPrompt={handleApplyPromptFromDeepy}
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
