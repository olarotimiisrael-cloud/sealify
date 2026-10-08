import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { generateImage, editImage, createVariation, upscaleImage } from '../../src/lib/ai/generation';
import { requireAuth, requireBasicAuth, checkFeatureAccess } from '../../src/middleware/authCheck';
import { FEATURE_TIERS, isFeatureAvailable } from '../../src/lib/features';
import { auditLog } from '../../src/middleware/security';
import { getSql } from '../../src/db/hyperdrive';

export const aiGenerationRoutes = new Hono<{ Bindings: any }>();

// Apply basic auth middleware to all routes (allows tracking of authenticated users)
aiGenerationRoutes.use('*', requireBasicAuth);

// Image generation endpoint
aiGenerationRoutes.post('/generate/image', async (c) => {
  try {
    const env = c.env as any;
    const user = c.get('user');
    
    // Check if user has access to image generation feature
    if (!isFeatureAvailable('text-to-image-generation-basic', user) && 
        !isFeatureAvailable('advanced-image-generation', user)) {
      await auditLog(
        getSql(c.env), 
        user?.id || 'anonymous', 
        'Feature Access Denied', 
        `User attempted to access image generation without proper permissions`, 
        'security'
      );
      
      return c.json({ 
        error: 'Feature not available',
        message: user 
          ? 'This feature requires a premium subscription' 
          : 'Please log in to access this feature',
        redirect: user ? '/upgrade' : '/login'
      }, 403);
    }

    const body = await c.req.json();
    const { prompt, negativePrompt, width, height, numImages, format, quality, style, seed, guidanceScale, steps } = body;

    // Validate required fields
    if (!prompt || prompt.trim().length === 0) {
      return c.json({ error: 'Prompt is required' }, 400);
    }

    // Generate image (watermarking is applied automatically in the generation function)
    const result = await generateImage(
      { 
        prompt, 
        negativePrompt, 
        width, 
        height, 
        numImages: numImages || 1, 
        format, 
        quality, 
        style, 
        seed, 
        guidanceScale, 
        steps 
      },
      env
    );

    // Log the generation request
    await auditLog(
      getSql(c.env), 
      user?.id || 'anonymous', 
      'Image Generated', 
      `Generated ${result.images.length} image(s) with mandatory Sealify watermark`, 
      'ai-generation'
    );

    return c.json(result);
  } catch (error) {
    console.error('Image generation error:', error);
    
    // Log the error for security/audit purposes
    try {
      await auditLog(
        getSql(c.env), 
        'unknown', 
        'Generation Error', 
        `Image generation failed: ${error.message}`, 
        'security'
      );
    } catch (logError) {
      // Don't let logging errors break the main flow
      console.warn('Failed to log generation error:', logError.message);
    }
    
    if (error instanceof HTTPException) {
      throw error;
    }
    
    return c.json({ error: 'Image generation failed' }, 500);
  }
});

// Image editing endpoint
aiGenerationRoutes.post('/edit/image', async (c) => {
  try {
    const env = c.env as any;
    const user = c.get('user');
    
    // Check if user has access to image editing feature
    const editingFeature = user ? 'advanced-image-editing' : 'simple-image-editing';
    if (!isFeatureAvailable(editingFeature, user)) {
      await auditLog(
        getSql(c.env), 
        user?.id || 'anonymous', 
        'Feature Access Denied', 
        `User attempted to access image editing without proper permissions`, 
        'security'
      );
      
      return c.json({ 
        error: 'Feature not available',
        message: user 
          ? 'This feature requires a premium subscription' 
          : 'Please log in to access this feature',
        redirect: user ? '/upgrade' : '/login'
      }, 403);
    }

    const body = await c.req.json();
    const { image, mask, prompt, negativePrompt, numImages, format } = body;

    // Validate required fields
    if (!image) {
      return c.json({ error: 'Image is required' }, 400);
    }
    if (!prompt || prompt.trim().length === 0) {
      return c.json({ error: 'Prompt is required' }, 400);
    }

    // Edit image (watermarking is applied automatically in the generation function)
    const result = await editImage(
      { 
        image, 
        mask, 
        prompt, 
        negativePrompt, 
        numImages: numImages || 1, 
        format 
      },
      env
    );

    // Log the edit request
    await auditLog(
      getSql(c.env), 
      user?.id || 'anonymous', 
      'Image Edited', 
      `Edited image with mandatory Sealify watermark`, 
      'ai-generation'
    );

    return c.json(result);
  } catch (error) {
    console.error('Image editing error:', error);
    
    // Log the error for security/audit purposes
    try {
      await auditLog(
        getSql(c.env), 
        'unknown', 
        'Generation Error', 
        `Image editing failed: ${error.message}`, 
        'security'
      );
    } catch (logError) {
      // Don't let logging errors break the main flow
      console.warn('Failed to log editing error:', logError.message);
    }
    
    if (error instanceof HTTPException) {
      throw error;
    }
    
    return c.json({ error: 'Image editing failed' }, 500);
  }
});

// Image variation endpoint
aiGenerationRoutes.post('/variation/image', async (c) => {
  try {
    const env = c.env as any;
    const user = c.get('user');
    
    // Check if user has access to image variation feature
    const variationFeature = user ? 'advanced-image-variation' : 'basic-image-variation';
    if (!isFeatureAvailable(variationFeature, user)) {
      await auditLog(
        getSql(c.env), 
        user?.id || 'anonymous', 
        'Feature Access Denied', 
        `User attempted to access image variation without proper permissions`, 
        'security'
      );
      
      return c.json({ 
        error: 'Feature not available',
        message: user 
          ? 'This feature requires a premium subscription' 
          : 'Please log in to access this feature',
        redirect: user ? '/upgrade' : '/login'
      }, 403);
    }

    const body = await c.req.json();
    const { image, numImages, format } = body;

    // Validate required fields
    if (!image) {
      return c.json({ error: 'Image is required' }, 400);
    }

    // Create variation (watermarking is applied automatically in the generation function)
    const result = await createVariation(
      { 
        image, 
        numImages: numImages || 1, 
        format 
      },
      env
    );

    // Log the variation request
    await auditLog(
      getSql(c.env), 
      user?.id || 'anonymous', 
      'Image Variation Created', 
      `Created ${result.images.length} image variation(s) with mandatory Sealify watermark`, 
      'ai-generation'
    );

    return c.json(result);
  } catch (error) {
    console.error('Image variation error:', error);
    
    // Log the error for security/audit purposes
    try {
      await auditLog(
        getSql(c.env), 
        'unknown', 
        'Generation Error', 
        `Image variation failed: ${error.message}`, 
        'security'
      );
    } catch (logError) {
      // Don't let logging errors break the main flow
      console.warn('Failed to log variation error:', logError.message);
    }
    
    if (error instanceof HTTPException) {
      throw error;
    }
    
    return c.json({ error: 'Image variation failed' }, 500);
  }
});

// Image upscaling endpoint
aiGenerationRoutes.post('/upscale/image', async (c) => {
  try {
    const env = c.env as any;
    const user = c.get('user');
    
    // Check if user has access to image upscaling feature
    if (!isFeatureAvailable('image-upscaling', user)) {
      await auditLog(
        getSql(c.env), 
        user?.id || 'anonymous', 
        'Feature Access Denied', 
        `User attempted to access image upscaling without proper permissions`, 
        'security'
      );
      
      return c.json({ 
        error: 'Feature not available',
        message: 'This feature requires a premium subscription',
        redirect: '/upgrade'
      }, 403);
    }

    const body = await c.req.json();
    const { image, scale, format } = body;

    // Validate required fields
    if (!image) {
      return c.json({ error: 'Image is required' }, 400);
    }
    if (!scale || ![2, 4].includes(scale)) {
      return c.json({ error: 'Scale must be 2 or 4' }, 400);
    }

    // Upscale image (watermarking is applied automatically in the generation function)
    const result = await upscaleImage(
      { 
        image, 
        scale: scale || 4, 
        format 
      },
      env
    );

    // Log the upscale request
    await auditLog(
      getSql(c.env), 
      user?.id || 'anonymous', 
      'Image Upscaled', 
      `Upscaled image with mandatory Sealify watermark`, 
      'ai-generation'
    );

    return c.json(result);
  } catch (error) {
    console.error('Image upscaling error:', error);
    
    // Log the error for security/audit purposes
    try {
      await auditLog(
        getSql(c.env), 
        'unknown', 
        'Generation Error', 
        `Image upscaling failed: ${error.message}`, 
        'security'
      );
    } catch (logError) {
      // Don't let logging errors break the main flow
      console.warn('Failed to log upscaling error:', logError.message);
    }
    
    if (error instanceof HTTPException) {
      throw error;
    }
    
    return c.json({ error: 'Image upscaling failed' }, 500);
  }
});

// Placeholder for video generation (future implementation)
aiGenerationRoutes.post('/generate/video', async (c) => {
  try {
    const env = c.env as any;
    const user = c.get('user');
    
    // Check if user has access to video generation feature
    if (!isFeatureAvailable('video-generation', user)) {
      await auditLog(
        getSql(c.env), 
        user?.id || 'anonymous', 
        'Feature Access Denied', 
        `User attempted to access video generation without proper permissions`, 
        'security'
      );
      
      return c.json({ 
        error: 'Feature not available',
        message: user 
          ? 'This feature requires a premium subscription' 
          : 'Please log in to access this feature',
        redirect: user ? '/upgrade' : '/login'
      }, 403);
    }

    // TODO: Implement actual video generation
    // For now, return a placeholder response indicating feature is planned
    return c.json({ 
      error: 'Feature not yet implemented',
      message: 'Video generation is currently in development and will be available soon.',
      status: 'planned'
    }, 501);
  } catch (error) {
    console.error('Video generation error:', error);
    
    // Log the error for security/audit purposes
    try {
      await auditLog(
        getSql(c.env), 
        'unknown', 
        'Generation Error', 
        `Video generation failed: ${error.message}`, 
        'security'
      );
    } catch (logError) {
      // Don't let logging errors break the main flow
      console.warn('Failed to log video generation error:', logError.message);
    }
    
    if (error instanceof HTTPException) {
      throw error;
    }
    
    return c.json({ error: 'Video generation failed' }, 500);
  }
});

// Health check for AI generation service
aiGenerationRoutes.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'ai-generation',
    watermarking: 'enabled',
    features: {
      basic: FEATURE_TIERS.BASIC,
      premium: FEATURE_TIERS.PREMIUM
    }
  });
});

export default aiGenerationRoutes;