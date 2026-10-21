import { getActiveProvider, type SupportedAIProvider, type ProviderConfig } from './providers';
import { WatermarkService, DEFAULT_WATERMARK_OPTIONS } from '../watermark/watermarkService';

export interface ImageGenerationOptions {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  numImages?: number;
  format?: 'png' | 'jpeg' | 'webp';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  seed?: number;
  guidanceScale?: number;
  steps?: number;
}

export interface ImageGenerationResult {
  images: Array<{
    base64?: string;
    url?: string;
    revisedPrompt?: string;
    seed?: number;
  }>;
  model: string;
  provider: SupportedAIProvider;
  metadata?: Record<string, unknown>;
}

export interface ImageEditOptions {
  image: string; // base64 or URL
  mask?: string; // base64 mask for inpainting
  prompt: string;
  negativePrompt?: string;
  numImages?: number;
  format?: 'png' | 'jpeg' | 'webp';
}

export interface ImageVariationOptions {
  image: string; // base64 or URL
  numImages?: number;
  format?: 'png' | 'jpeg' | 'webp';
}

export interface UpscaleOptions {
  image: string;
  scale?: 2 | 4;
  format?: 'png' | 'jpeg' | 'webp';
}

export async function generateImage(
  options: ImageGenerationOptions,
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>
): Promise<ImageGenerationResult> {
  const provider = getActiveProvider(env);
  if (!provider) {
    throw new Error('No AI provider configured for image generation');
  }

  if (!provider.imageGenerationEnabled) {
    throw new Error('Image generation is not enabled for the current provider');
  }

  const genModel = provider.imageGenerationModel || getDefaultImageGenModel(provider.provider);

  if (provider.provider === 'openai') {
    return await generateWithDALLE(options, genModel, provider.apiKey || '');
  }

  if (provider.provider === 'gemini') {
    return await generateWithImagen(options, genModel, provider.apiKey || '');
  }

  if (provider.provider === 'sealify') {
    return await generateWithLocalSD(options, genModel, provider.baseUrl || 'http://localhost:11434');
  }

  throw new Error(`Image generation not supported for provider: ${provider.provider}`);
}

function getDefaultImageGenModel(provider: SupportedAIProvider): string {
  switch (provider) {
    case 'openai': return 'dall-e-3';
    case 'gemini': return 'imagen-3';
    case 'sealify': return 'stable-diffusion-xl';
    default: return 'stable-diffusion-xl';
  }
}

async function generateWithDALLE(
  options: ImageGenerationOptions,
  model: string,
  apiKey: string
): Promise<ImageGenerationResult> {
  const isDALLE3 = model === 'dall-e-3';
  const size = `${options.width || 1024}x${options.height || 1024}`;
  const validSizes = isDALLE3 ? ['1024x1024', '1792x1024', '1024x1792'] : ['256x256', '512x512', '1024x1024'];
  const finalSize = validSizes.includes(size) ? size : (isDALLE3 ? '1024x1024' : '1024x1024');

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: isDALLE3 ? 'dall-e-3' : 'dall-e-2',
      prompt: options.prompt,
      n: Math.min(options.numImages || 1, isDALLE3 ? 1 : 10),
      size: finalSize,
      quality: options.quality || 'standard',
      style: options.style || 'vivid',
      response_format: 'b64_json',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'DALL-E request failed' } }));
    throw new Error(error?.error?.message || 'DALL-E request failed');
  }

   const payload = await response.json();
   const images = payload.data?.map((item: any) => ({
     base64: item.b64_json,
     revisedPrompt: item.revised_prompt,
   })) || [];

   // Apply mandatory watermark to all generated images
   const watermarkedImages = await WatermarkService.applyWatermarkToImages(
     images.map(img => img.base64).filter((base64): base64 is string => base64 !== undefined),
     DEFAULT_WATERMARK_OPTIONS
   );
   
   // Reconstruct images array with watermarked base64 data
   const watermarkedImageResults = images.map((img, index) => ({
     ...img,
     base64: watermarkedImages[index] || img.base64
   }));

   return {
     images: watermarkedImageResults,
     model: isDALLE3 ? 'dall-e-3' : 'dall-e-2',
     provider: 'openai',
   };
}

async function generateWithImagen(
  options: ImageGenerationOptions,
  model: string,
  apiKey: string
): Promise<ImageGenerationResult> {
  // Imagen 3 via Gemini API
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt: options.prompt }],
      parameters: {
        sampleCount: Math.min(options.numImages || 1, 4),
        aspectRatio: options.width && options.height ?
          (options.width > options.height ? '16:9' : options.height > options.width ? '9:16' : '1:1') : '1:1',
        safetyFilterLevel: 'block_some',
        personGeneration: 'allow_adult',
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Imagen request failed' } }));
    throw new Error(error?.error?.message || 'Imagen request failed');
  }

   const payload = await response.json();
   const images = payload.predictions?.map((pred: any) => ({
     base64: pred.bytesBase64Encoded,
   })) || [];

   // Apply mandatory watermark to all generated images
   const watermarkedImages = await WatermarkService.applyWatermarkToImages(
     images.map(img => img.base64).filter((base64): base64 is string => base64 !== undefined),
     DEFAULT_WATERMARK_OPTIONS
   );
   
   // Reconstruct images array with watermarked base64 data
   const watermarkedImageResults = images.map((img, index) => ({
     ...img,
     base64: watermarkedImages[index] || img.base64
   }));

   return {
     images: watermarkedImageResults,
     model: 'imagen-3',
     provider: 'gemini',
   };
}

async function generateWithLocalSD(
  options: ImageGenerationOptions,
  model: string,
  baseUrl: string
): Promise<ImageGenerationResult> {
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt: options.prompt,
      negative_prompt: options.negativePrompt,
      width: options.width || 1024,
      height: options.height || 1024,
      batch_size: Math.min(options.numImages || 1, 4),
      steps: options.steps || 30,
      cfg_scale: options.guidanceScale || 7.5,
      seed: options.seed,
      sampler_name: 'DPM++ 2M Karras',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Local SD request failed' } }));
    throw new Error(error?.error?.message || 'Local Stable Diffusion request failed');
  }

   const payload = await response.json();
   const images = payload.images?.map((img: string) => ({ base64: img })) || [];

   // Apply mandatory watermark to all generated images
   const watermarkedImages = await WatermarkService.applyWatermarkToImages(
     images.map(img => img.base64).filter((base64): base64 is string => base64 !== undefined),
     DEFAULT_WATERMARK_OPTIONS
   );
   
   // Reconstruct images array with watermarked base64 data
   const watermarkedImageResults = images.map((img, index) => ({
     ...img,
     base64: watermarkedImages[index] || img.base64
   }));

   return {
     images: watermarkedImageResults,
     model: 'stable-diffusion-xl',
     provider: 'sealify',
   };
}

export async function editImage(
  options: ImageEditOptions,
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>
): Promise<ImageGenerationResult> {
  const provider = getActiveProvider(env);
  if (!provider || !provider.imageGenerationEnabled) {
    throw new Error('Image editing not available');
  }

  if (provider.provider === 'openai') {
    return await editWithDALLE(options, provider.apiKey || '');
  }

  if (provider.provider === 'sealify') {
    return await editWithLocalSD(options, provider.baseUrl || 'http://localhost:11434');
  }

  throw new Error(`Image editing not supported for provider: ${provider.provider}`);
}

async function editWithDALLE(
  options: ImageEditOptions,
  apiKey: string
): Promise<ImageGenerationResult> {
  const isBase64 = options.image.startsWith('data:') || /^[A-Za-z0-9+/=]+$/.test(options.image);
  const imageData = isBase64 ? options.image.replace(/^data:image\/[a-z]+;base64,/, '') : options.image;
  const maskData = options.mask ? (options.mask.startsWith('data:') ? options.mask.replace(/^data:image\/[a-z]+;base64,/, '') : options.mask) : null;

  const formData = new FormData();
  formData.append('model', 'dall-e-2'); // DALL-E 3 doesn't support editing yet
  formData.append('prompt', options.prompt);
  formData.append('n', String(Math.min(options.numImages || 1, 10)));
  formData.append('size', '1024x1024');
  formData.append('response_format', 'b64_json');

  const imageBlob = base64ToBlob(imageData, 'image/png');
  formData.append('image', imageBlob, 'image.png');

  if (maskData) {
    const maskBlob = base64ToBlob(maskData, 'image/png');
    formData.append('mask', maskBlob, 'mask.png');
  }

  const response = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'DALL-E edit failed' } }));
    throw new Error(error?.error?.message || 'DALL-E edit failed');
  }

   const payload = await response.json();
   const images = payload.data?.map((item: any) => ({ base64: item.b64_json })) || [];

   // Apply mandatory watermark to all edited images
   const watermarkedImages = await WatermarkService.applyWatermarkToImages(
     images.map(img => img.base64).filter((base64): base64 is string => base64 !== undefined),
     DEFAULT_WATERMARK_OPTIONS
   );
   
   // Reconstruct images array with watermarked base64 data
   const watermarkedImageResults = images.map((img, index) => ({
     ...img,
     base64: watermarkedImages[index] || img.base64
   }));

   return {
     images: watermarkedImageResults,
     model: 'dall-e-2',
     provider: 'openai',
   };
}

async function editWithLocalSD(
  options: ImageEditOptions,
  baseUrl: string
): Promise<ImageGenerationResult> {
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/img2img`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      init_images: [options.image],
      mask: options.mask,
      prompt: options.prompt,
      negative_prompt: options.negativePrompt,
      denoising_strength: 0.75,
      steps: 30,
      cfg_scale: 7.5,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Local SD img2img failed' } }));
    throw new Error(error?.error?.message || 'Local SD img2img failed');
  }

   const payload = await response.json();
   const images = payload.images?.map((img: string) => ({ base64: img })) || [];

   // Apply mandatory watermark to all edited images
   const watermarkedImages = await WatermarkService.applyWatermarkToImages(
     images.map(img => img.base64).filter((base64): base64 is string => base64 !== undefined),
     DEFAULT_WATERMARK_OPTIONS
   );
   
   // Reconstruct images array with watermarked base64 data
   const watermarkedImageResults = images.map((img, index) => ({
     ...img,
     base64: watermarkedImages[index] || img.base64
   }));

   return {
     images: watermarkedImageResults,
     model: 'stable-diffusion-xl',
     provider: 'sealify',
   };
}

export async function createVariation(
  options: ImageVariationOptions,
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>
): Promise<ImageGenerationResult> {
  const provider = getActiveProvider(env);
  if (!provider || !provider.imageGenerationEnabled) {
    throw new Error('Image variation not available');
  }

  if (provider.provider === 'openai') {
    const isBase64 = options.image.startsWith('data:') || /^[A-Za-z0-9+/=]+$/.test(options.image);
    const imageData = isBase64 ? options.image.replace(/^data:image\/[a-z]+;base64,/, '') : options.image;

    const formData = new FormData();
    formData.append('model', 'dall-e-2');
    formData.append('n', String(Math.min(options.numImages || 1, 10)));
    formData.append('size', '1024x1024');
    formData.append('response_format', 'b64_json');
    const imageBlob = base64ToBlob(imageData, 'image/png');
    formData.append('image', imageBlob, 'image.png');

    const response = await fetch('https://api.openai.com/v1/images/variations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'DALL-E variation failed' } }));
      throw new Error(error?.error?.message || 'DALL-E variation failed');
    }

     const payload = await response.json();
     const images = payload.data?.map((item: any) => ({ base64: item.b64_json })) || [];
     
     // Apply mandatory watermark to all varied images
     const watermarkedImages = await WatermarkService.applyWatermarkToImages(
       images.map(img => img.base64).filter((base64): base64 is string => base64 !== undefined),
       DEFAULT_WATERMARK_OPTIONS
     );
     
     // Reconstruct images array with watermarked base64 data
     const watermarkedImageResults = images.map((img, index) => ({
       ...img,
       base64: watermarkedImages[index] || img.base64
     }));

     return {
       images: watermarkedImageResults,
       model: 'dall-e-2',
       provider: 'openai',
     };
   }
   
   throw new Error(`Image variation not supported for provider: ${provider.provider}`);
 }
 
 export async function upscaleImage(
  options: UpscaleOptions,
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>
): Promise<ImageGenerationResult> {
  // Use a dedicated upscaling model or ESRGAN via local SD
  const provider = getActiveProvider(env);
  if (!provider) throw new Error('No provider for upscaling');

  if (provider.provider === 'sealify') {
    const response = await fetch(`${provider.baseUrl?.replace(/\/$/, '')}/api/upscale`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: options.image,
        scale: options.scale || 4,
        model: 'ESRGAN_4x',
      }),
    });

     if (!response.ok) throw new Error('Upscaling failed');

     const payload = await response.json();
     const images = [{ base64: payload.image }];
     
     // Apply mandatory watermark to all upscaled images
     const watermarkedImages = await WatermarkService.applyWatermarkToImages(
       images.map(img => img.base64).filter((base64): base64 is string => base64 !== undefined),
       DEFAULT_WATERMARK_OPTIONS
     );
     
     // Reconstruct images array with watermarked base64 data
     const watermarkedImageResults = images.map((img, index) => ({
       ...img,
       base64: watermarkedImages[index] || img.base64
     }));

     return {
       images: watermarkedImageResults,
       model: 'ESRGAN_4x',
       provider: 'sealify',
     };
  }

  throw new Error('Upscaling requires local Sealify provider with ESRGAN');
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mimeType });
}

export function validateImageGenerationOptions(options: ImageGenerationOptions): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!options.prompt || options.prompt.trim().length < 3) {
    errors.push('Prompt must be at least 3 characters');
  }

  if (options.prompt && options.prompt.length > 4000) {
    errors.push('Prompt too long (max 4000 characters)');
  }

  if (options.width && (options.width < 64 || options.width > 2048 || options.width % 64 !== 0)) {
    errors.push('Width must be between 64-2048 and multiple of 64');
  }

  if (options.height && (options.height < 64 || options.height > 2048 || options.height % 64 !== 0)) {
    errors.push('Height must be between 64-2048 and multiple of 64');
  }

  if (options.numImages && (options.numImages < 1 || options.numImages > 10)) {
    errors.push('Number of images must be between 1-10');
  }

  return { valid: errors.length === 0, errors };
}