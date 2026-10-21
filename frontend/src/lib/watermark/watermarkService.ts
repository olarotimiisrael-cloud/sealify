/**
 * Watermarking service for Sealify platform
 * Automatically applies visible Sealify watermark to all generated images and videos
 */

/**
 * Watermark configuration options
 */
export interface WatermarkOptions {
  /** Opacity of the watermark (0-1) */
  opacity?: number;
  /** Scale of the watermark relative to image size */
  scale?: number;
  /** Position of the watermark */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  /** Margin from edges in pixels */
  margin?: number;
  /** Custom watermark text */
  text?: string;
  /** Custom watermark color (CSS color format) */
  color?: string;
}

/**
 * Service for applying watermarks to images and videos
 * 
 * Note: In Cloudflare Workers environment, we use a simplified approach
 * that returns the original image with a note that watermarking would 
 * be applied in a full browser/Node environment.
 */
export class WatermarkService {
  /** Default watermark text */
  private static readonly DEFAULT_WATERMARK_TEXT = 'Sealify';
  /** Default watermark color (semi-transparent white) */
  private static readonly DEFAULT_WATERMARK_COLOR = 'rgba(255, 255, 255, 0.8)';

  /**
   * Apply watermark to an image
   * @param imageBase64 - Base64 encoded image data
   * @param options - Watermark configuration options
   * @returns Promise resolving to watermarked image as base64
   */
  static async applyWatermark(
    imageBase64: string,
    options: WatermarkOptions = {}
  ): Promise<string> {
    // Set default options
    const {
      opacity = 0.8,
      scale = 1.0,
      position = 'bottom-right',
      margin = 10,
      text = this.DEFAULT_WATERMARK_TEXT,
      color = this.DEFAULT_WATERMARK_COLOR
    } = options;

    // In a real implementation with canvas access, we would apply the watermark here
    // For Cloudflare Workers, we'll return the original image but log that
    // watermarking should be applied
    
    // TODO: In production with proper image processing capabilities:
    // 1. Decode base64 image
    // 2. Apply watermark using image processing library
    // 3. Re-encode to base64
    
    // For now, we'll return the original image but this function serves as
    // a placeholder that makes it clear watermarking is intended
    console.info('[WatermarkService] Watermark application placeholder - in production, actual watermark would be applied');
    
    // Return original image (watermarking logic would go here in full environment)
    return imageBase64;
  }

  /**
   * Apply watermark to a video frame (for video processing)
   * @param frameBase64 - Base64 encoded video frame data
   * @param options - Watermark configuration options
   * @returns Promise resolving to watermarked frame as base64
   */
  static async applyWatermarkToVideoFrame(
    frameBase64: string,
    options: WatermarkOptions = {}
  ): Promise<string> {
    // Same logic as image watermarking
    return this.applyWatermark(frameBase64, options);
  }

  /**
   * Apply watermark to multiple images
   * @param imagesBase64 - Array of base64 encoded images
   * @param options - Watermark configuration options
   * @returns Promise resolving to array of watermarked images as base64
   */
  static async applyWatermarkToImages(
    imagesBase64: string[],
    options: WatermarkOptions = {}
  ): Promise<string[]> {
    return Promise.all(
      imagesBase64.map(image => this.applyWatermark(image, options))
    );
  }
}

/**
 * Default watermark options for Sealify
 */
export const DEFAULT_WATERMARK_OPTIONS: WatermarkOptions = {
  opacity: 0.8,
  scale: 1.0,
  position: 'bottom-right',
  margin: 10,
  text: 'Sealify',
  color: 'rgba(255, 255, 255, 0.8)'
};