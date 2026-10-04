'use client';

import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Film, 
  Image as ImageIcon, 
  Music, 
  RotateCw, 
  ExternalLink,
  Loader2
} from 'lucide-react';
import { GenerationJob } from '@/lib/types';

interface GenerationQueueProps {
  jobs: GenerationJob[];
  onCancelJob: (id: string) => void;
  onClearHistory: () => void;
  onSelectJobForGallery: (job: GenerationJob) => void;
}

export const GenerationQueue: React.FC<GenerationQueueProps> = ({
  jobs,
  onCancelJob,
  onClearHistory,
  onSelectJobForGallery,
}) => {
  const activeJobs = jobs.filter(j => j.status === 'processing' || j.status === 'queued');
  const pastJobs = jobs.filter(j => j.status === 'completed' || j.status === 'failed');

  const getModalityIcon = (modality: string) => {
    switch (modality) {
      case 'video': return <Film className="h-4 w-4 text-indigo-400" />;
      case 'image': return <ImageIcon className="h-4 w-4 text-fuchsia-400" />;
      case 'audio': return <Music className="h-4 w-4 text-emerald-400" />;
      default: return <Film className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Clock className="h-6 w-6 text-indigo-400" />
            <span>Generation Tasks & Queue Monitor</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time inference queue with step tracking and batch history.
          </p>
        </div>

        {pastJobs.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Completed History</span>
          </button>
        )}
      </div>

      {/* Active Jobs Section */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <span>Active & Queued Inferences</span>
          <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] text-indigo-300">
            {activeJobs.length}
          </span>
        </h2>

        {activeJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-xs text-slate-500 bg-surface">
            Queue is clear. Submit a prompt from Video, Image, or Audio Studio to start generation.
          </div>
        ) : (
          <div className="space-y-3">
            {activeJobs.map((job) => (
              <div
                key={job.id}
                className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-surface p-5 shadow-lg shadow-indigo-500/5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {getModalityIcon(job.modality)}
                    <span className="text-xs font-bold text-white capitalize">{job.subMode}</span>
                    <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-slate-300 font-mono">
                      {job.model}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>{job.status === 'processing' ? `Step ${job.currentStep}/${job.totalSteps}` : 'Queued'}</span>
                    </span>
                    <button
                      onClick={() => onCancelJob(job.id)}
                      className="text-xs text-slate-500 hover:text-red-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-medium line-clamp-2 bg-black/30 p-2.5 rounded-xl border border-white/5">
                  "{job.prompt}"
                </p>

                {/* Animated Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Progress</span>
                    <span className="font-mono text-cyan-400 font-bold">{Math.round(job.progress)}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-fuchsia-500 transition-all duration-300"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed History Section */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Completed Inferences ({pastJobs.length})
        </h2>

        <div className="divide-y divide-white/5 rounded-2xl border border-white/5 bg-surface overflow-hidden">
          {pastJobs.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No completed generations in history.
            </div>
          ) : (
            pastJobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  {job.thumbnailUrl || job.resultUrl ? (
                    <img
                      src={job.thumbnailUrl || job.resultUrl}
                      alt="Thumbnail"
                      className="h-12 w-12 rounded-lg object-cover border border-white/10 shrink-0"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/5 border border-white/10 shrink-0">
                      {getModalityIcon(job.modality)}
                    </div>
                  )}

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white capitalize">{job.subMode}</span>
                      <span className="text-[10px] text-slate-400 font-mono">[{job.model}]</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(job.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-1">"{job.prompt}"</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {job.status === 'completed' ? (
                    <button
                      onClick={() => onSelectJobForGallery(job)}
                      className="flex items-center gap-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>View in Gallery</span>
                    </button>
                  ) : (
                    <span className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>Failed</span>
                    </span>
                  )}

                  <button
                    onClick={() => onCancelJob(job.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/5"
                    title="Delete item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
