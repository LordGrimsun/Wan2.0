import { NextRequest, NextResponse } from 'next/server';

const DEMO_VIDEOS = [
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4',
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4',
];

const DEMO_IMAGES = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1280&q=80',
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1280&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1280&q=80',
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1280&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1280&q=80',
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { modality, prompt, model, settings } = body;

    // Check if cloud backend was requested with API key
    if (settings?.backendMode === 'cloud_fal' && settings?.falApiKey) {
      try {
        const endpoint = modality === 'video' ? 'fal-ai/wan-t2v' : 'fal-ai/flux/dev';
        const falRes = await fetch(`https://queue.fal.run/${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Key ${settings.falApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        });

        if (falRes.ok) {
          const falData = await falRes.json();
          return NextResponse.json({
            status: 'processing',
            falRequestId: falData.request_id,
            mode: 'cloud_fal',
          });
        }
      } catch (e) {
        console.error('Fal.ai error, falling back to studio engine', e);
      }
    }

    // Default: Studio Engine
    let resultUrl = '';
    let thumbnailUrl = '';

    if (modality === 'video') {
      const idx = Math.floor(Math.random() * DEMO_VIDEOS.length);
      resultUrl = DEMO_VIDEOS[idx];
      thumbnailUrl = DEMO_IMAGES[idx];
    } else if (modality === 'image') {
      const idx = Math.floor(Math.random() * DEMO_IMAGES.length);
      resultUrl = DEMO_IMAGES[idx];
      thumbnailUrl = DEMO_IMAGES[idx];
    } else {
      // Audio
      resultUrl = 'https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3';
      thumbnailUrl = DEMO_IMAGES[0];
    }

    return NextResponse.json({
      status: 'ready',
      resultUrl,
      thumbnailUrl,
      mode: 'studio_engine',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
