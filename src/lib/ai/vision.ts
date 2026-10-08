import { getActiveProvider, type SupportedAIProvider, type ProviderConfig } from './providers';

export interface VisionAnalysisResult {
  description: string;
  objects?: Array<{ name: string; confidence: number; boundingBox?: [number, number, number, number] }>;
  text?: string; // OCR extracted text
  colors?: string[];
  tags?: string[];
  nsfw?: boolean;
  quality?: { score: number; issues?: string[] };
  metadata?: Record<string, unknown>;
}

export interface VisionAnalysisOptions {
  detail?: 'low' | 'high' | 'auto';
  extractText?: boolean;
  detectObjects?: boolean;
  analyzeColors?: boolean;
  checkNSFW?: boolean;
  assessQuality?: boolean;
  customPrompt?: string;
}

export async function analyzeImage(
  imageData: string, // base64 or URL
  options: VisionAnalysisOptions = {},
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>
): Promise<VisionAnalysisResult> {
  const provider = getActiveProvider(env);
  if (!provider) {
    throw new Error('No AI provider configured for vision analysis');
  }

  if (!provider.visionEnabled) {
    throw new Error('Vision analysis is not enabled for the current provider');
  }

  const visionModel = provider.visionModel || (provider.provider === 'openai' ? 'gpt-4o' : provider.provider === 'gemini' ? 'gemini-2.5-pro' : 'sealify-vision');

  if (provider.provider === 'openai') {
    return await analyzeWithOpenAI(imageData, visionModel, provider.apiKey || '', options);
  }

  if (provider.provider === 'gemini') {
    return await analyzeWithGemini(imageData, visionModel, provider.apiKey || '', options);
  }

  if (provider.provider === 'sealify') {
    return await analyzeWithSealify(imageData, visionModel, provider.baseUrl || 'http://localhost:11434', options);
  }

  throw new Error(`Vision analysis not supported for provider: ${provider.provider}`);
}

async function analyzeWithOpenAI(
  imageData: string,
  model: string,
  apiKey: string,
  options: VisionAnalysisOptions
): Promise<VisionAnalysisResult> {
  const isBase64 = imageData.startsWith('data:') || /^[A-Za-z0-9+/=]+$/.test(imageData);
  const imageUrl = isBase64 ? `data:image/png;base64,${imageData.replace(/^data:image\/[a-z]+;base64,/, '')}` : imageData;

  const prompt = options.customPrompt || buildVisionPrompt(options);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'You are an expert image analyzer. Return structured JSON analysis of images.' },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl, detail: options.detail || 'high' } },
          ],
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'OpenAI vision request failed' } }));
    throw new Error(error?.error?.message || 'OpenAI vision request failed');
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content || '{}';

  try {
    return JSON.parse(content) as VisionAnalysisResult;
  } catch {
    return { description: content };
  }
}

async function analyzeWithGemini(
  imageData: string,
  model: string,
  apiKey: string,
  options: VisionAnalysisOptions
): Promise<VisionAnalysisResult> {
  const isBase64 = imageData.startsWith('data:') || /^[A-Za-z0-9+/=]+$/.test(imageData);
  const base64Data = isBase64 ? imageData.replace(/^data:image\/[a-z]+;base64,/, '') : null;
  const imageUrl = !isBase64 ? imageData : null;

  const prompt = options.customPrompt || buildVisionPrompt(options);

  const parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> = [
    { text: prompt },
  ];

  if (base64Data) {
    parts.push({ inline_data: { mime_type: 'image/png', data: base64Data } });
  } else if (imageUrl) {
    parts.push({ text: `Image URL: ${imageUrl}` });
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 2000, responseMimeType: 'application/json' },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Gemini vision request failed' } }));
    throw new Error(error?.error?.message || 'Gemini vision request failed');
  }

  const payload = await response.json();
  const content = payload.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('') || '{}';

  try {
    return JSON.parse(content) as VisionAnalysisResult;
  } catch {
    return { description: content };
  }
}

async function analyzeWithSealify(
  imageData: string,
  model: string,
  baseUrl: string,
  options: VisionAnalysisOptions
): Promise<VisionAnalysisResult> {
  const prompt = options.customPrompt || buildVisionPrompt(options);

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/vision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      image: imageData,
      prompt,
      options: {
        detail: options.detail || 'high',
        extractText: options.extractText ?? true,
        detectObjects: options.detectObjects ?? true,
        analyzeColors: options.analyzeColors ?? true,
        checkNSFW: options.checkNSFW ?? true,
        assessQuality: options.assessQuality ?? true,
      },
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Sealify vision request failed' } }));
    throw new Error(error?.error?.message || 'Sealify vision request failed');
  }

  const payload = await response.json();
  const content = payload.analysis || payload.message || JSON.stringify(payload);

  try {
    return JSON.parse(content) as VisionAnalysisResult;
  } catch {
    return { description: content };
  }
}

function buildVisionPrompt(options: VisionAnalysisOptions): string {
  const tasks = [];
  if (options.extractText !== false) tasks.push('Extract all visible text (OCR)');
  if (options.detectObjects !== false) tasks.push('Detect and locate objects with bounding boxes and confidence scores');
  if (options.analyzeColors !== false) tasks.push('Analyze dominant colors and color palette');
  if (options.checkNSFW !== false) tasks.push('Check for NSFW/inappropriate content');
  if (options.assessQuality !== false) tasks.push('Assess image quality and identify issues');

  if (tasks.length === 0) tasks.push('Provide a detailed description of the image');

  return `Analyze this image and return a JSON object with the following analysis:
${tasks.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Return format:
{
  "description": "detailed description",
  "objects": [{"name": "object", "confidence": 0.95, "boundingBox": [x, y, width, height]}],
  "text": "extracted text",
  "colors": ["#hex1", "#hex2"],
  "tags": ["tag1", "tag2"],
  "nsfw": false,
  "quality": {"score": 0.9, "issues": []},
  "metadata": {}
}`;
}

export async function compareImages(
  image1: string,
  image2: string,
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>
): Promise<{ similar: boolean; similarity: number; differences: string[] }> {
  const provider = getActiveProvider(env);
  if (!provider || !provider.visionEnabled) {
    throw new Error('Vision comparison not available');
  }

  const prompt = `Compare these two images and return JSON with:
{
  "similar": boolean,
  "similarity": 0.0-1.0,
  "differences": ["description of key differences"]
}`;

  // For simplicity, analyze both and compare results
  // In production, use a dedicated comparison model or send both images
  const [analysis1, analysis2] = await Promise.all([
    analyzeImage(image1, { customPrompt: 'Describe this image in detail for comparison' }, env),
    analyzeImage(image2, { customPrompt: 'Describe this image in detail for comparison' }, env),
  ]);

  // Simple similarity based on description overlap
  const desc1 = analysis1.description.toLowerCase();
  const desc2 = analysis2.description.toLowerCase();
  const words1 = new Set(desc1.split(/\s+/));
  const words2 = new Set(desc2.split(/\s+/));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  const similarity = union.size > 0 ? intersection.size / union.size : 0;

  return {
    similar: similarity > 0.7,
    similarity,
    differences: similarity > 0.7 ? ['Minor differences'] : ['Significant visual differences'],
  };
}

export async function extractTextFromImage(
  imageData: string,
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>
): Promise<string> {
  const result = await analyzeImage(imageData, { extractText: true, detectObjects: false, analyzeColors: false, checkNSFW: false, assessQuality: false }, env);
  return result.text || '';
}

export async function detectObjectsInImage(
  imageData: string,
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>
): Promise<Array<{ name: string; confidence: number; boundingBox?: [number, number, number, number] }>> {
  const result = await analyzeImage(imageData, { extractText: false, detectObjects: true, analyzeColors: false, checkNSFW: false, assessQuality: false }, env);
  return result.objects || [];
}

export async function checkImageNSFW(
  imageData: string,
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>
): Promise<{ nsfw: boolean; confidence: number; categories: string[] }> {
  const result = await analyzeImage(imageData, { extractText: false, detectObjects: false, analyzeColors: false, checkNSFW: true, assessQuality: false }, env);
  return {
    nsfw: result.nsfw ?? false,
    confidence: result.nsfw ? 0.9 : 0.1,
    categories: result.nsfw ? ['potential_nsfw'] : [],
  };
}