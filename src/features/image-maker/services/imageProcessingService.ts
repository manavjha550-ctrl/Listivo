import { ProcessImageOptions, ProcessedImageResult } from '../types/imageWorkspace';

export class ImageProcessingService {
  /**
   * Browser-side HTML5 Canvas crop, resize, and quality compression
   */
  public async processImageCanvas(
    sourceUrl: string,
    options: ProcessImageOptions
  ): Promise<ProcessedImageResult> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const origW = img.naturalWidth || 800;
        const origH = img.naturalHeight || 800;

        const targetW = options.width || origW;
        const targetH = options.height || origH;

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Unable to acquire 2D canvas context'));
          return;
        }

        // Fill background with clean white for non-alpha formats
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetW, targetH);

        if (options.cropArea) {
          const { x, y, w, h } = options.cropArea;
          ctx.drawImage(img, x, y, w, h, 0, 0, targetW, targetH);
        } else {
          ctx.drawImage(img, 0, 0, origW, origH, 0, 0, targetW, targetH);
        }

        const format = options.format || 'jpeg';
        const mimeType = `image/${format}`;
        const quality = options.quality !== undefined ? options.quality : 0.9;

        const processedDataUrl = canvas.toDataURL(mimeType, quality);

        // Estimate sizes
        const origEstKb = Math.round((origW * origH * 3) / 1024);
        const processedEstKb = Math.round((processedDataUrl.length * 0.75) / 1024);

        resolve({
          processedUrl: processedDataUrl,
          originalDimensions: { w: origW, h: origH },
          processedDimensions: { w: targetW, h: targetH },
          originalSizeEstKb: origEstKb,
          processedSizeEstKb: processedEstKb,
          format: format.toUpperCase(),
        });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for client-side processing. Ensure CORS allows cross-origin reading or use a direct URL.'));
      };

      img.src = sourceUrl;
    });
  }

  /**
   * External AI Background Removal or Generative Studio Light
   * Strictly respects NO FAKE PROCESSING requirement.
   */
  public async requestExternalAIProcessing(action: string, imageUrl: string): Promise<{
    success: boolean;
    configRequired: boolean;
    message: string;
    resultUrl?: string;
  }> {
    try {
      const response = await fetch('/api/images/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, imageUrl }),
      });
      const data = await response.json();
      if (data.configRequired) {
        return {
          success: false,
          configRequired: true,
          message: 'Configuration required. External image processing provider is not configured.',
        };
      }
      return data;
    } catch {
      return {
        success: false,
        configRequired: true,
        message: 'Configuration required. External image processing endpoint unreachable.',
      };
    }
  }
}

export const imageProcessingService = new ImageProcessingService();
