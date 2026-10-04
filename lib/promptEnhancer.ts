export function enhancePromptForModel(prompt: string, modelId: string): { enhanced: string; negativePrompt: string } {
  const trimmed = prompt.trim();
  if (!trimmed) {
    return {
      enhanced: 'Cinematic wide-angle shot of a majestic futuristic city with holographic sky trains during golden hour sunset, 8k resolution, cinematic lighting',
      negativePrompt: 'blur, low quality, artifacts, watermark, jittery, distorted faces, bad anatomy',
    };
  }

  let enhanced = trimmed;
  let negative = 'blurry, distorted, oversaturated, deformed hands, duplicate heads, low frame rate, compression artifacts, watermark, jittery motion';

  if (modelId.includes('wan')) {
    enhanced = `${trimmed}, rendered with cinematic motion, 4k ultra-detailed, photorealistic textures, dynamic atmospheric lighting, smooth temporal coherence, master shot, filmic grain`;
    negative = 'flickering, stuttering, morphing errors, warped limbs, cartoonish, low resolution, blurry edges, artifacting, bad physics';
  } else if (modelId.includes('hunyuan')) {
    enhanced = `${trimmed}, high production value, smooth fluid motion, cinematic color grading, physically accurate lighting and shadows, anamorphic lens flare, depth of field`;
    negative = 'jagged edges, plastic skin, motion blur artifacts, frame drops, low dynamic range, overexposed';
  } else if (modelId.includes('flux')) {
    enhanced = `${trimmed}, exceptional visual clarity, sharp focus, natural skin texture, masterpiece photography, award-winning composition, intricate micro-details`;
    negative = 'airbrushed, cartoonish, synthetic, plastic, oversaturated, low detail, bad proportions';
  } else if (modelId.includes('minimax')) {
    enhanced = `${trimmed}, multi-angle coherent video, expressive character movement, photorealistic cinematography, 8k resolution, volumetric atmospheric fog`;
    negative = 'stiff movement, unnatural face deformation, frame skipping, chromatic aberration';
  } else {
    enhanced = `${trimmed}, highly detailed, professional cinematography, 4k resolution, cinematic lighting, smooth framerate`;
  }

  return { enhanced, negativePrompt: negative };
}
