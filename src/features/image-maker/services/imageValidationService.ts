import { MARKETPLACE_CONFIGURED_RULES, ImageValidationStatus } from '../types/imageWorkspace';

export interface ImageValidationDetails {
  status: ImageValidationStatus;
  messages: string[];
  width?: number;
  height?: number;
  aspectRatio?: string;
}

export class ImageValidationService {
  /**
   * Fast synchronous URL / data-URI format and duplicate check
   */
  public validateUrlBasic(url: string, allUrls: string[]): { status: ImageValidationStatus; message: string } {
    const trimmed = (url || '').trim();
    if (!trimmed) {
      return { status: 'ERROR', message: 'Empty image source provided.' };
    }

    const isDataOrLocal = /^data:image\/.+/i.test(trimmed) || trimmed.startsWith('/');
    const isValidHttp = /^https?:\/\/.+\..+/i.test(trimmed);

    if (!isDataOrLocal && !isValidHttp) {
      return { status: 'ERROR', message: 'Invalid URL format. Must start with https://, http://, or be an uploaded image.' };
    }

    const duplicates = allUrls.filter((u) => u.trim() === trimmed);
    if (duplicates.length > 1) {
      return { status: 'WARNING', message: 'Duplicate image source detected in gallery slots.' };
    }

    if (trimmed.startsWith('http://')) {
      return { status: 'WARNING', message: 'HTTP URL detected. HTTPS is recommended for marketplace compliance.' };
    }

    if (isDataOrLocal) {
      return { status: 'VALID', message: 'Local studio image verified.' };
    }

    return { status: 'UNVERIFIED', message: 'URL format valid — checking image dimensions.' };
  }

  /**
   * Inspects image element asynchronously in browser to get natural dimensions
   */
  public async checkImageAccessibilityAndDimensions(
    url: string,
    marketplaceId: string = 'meesho'
  ): Promise<ImageValidationDetails> {
    const basic = this.validateUrlBasic(url, [url]);
    if (basic.status === 'ERROR') {
      return { status: 'ERROR', messages: [basic.message] };
    }

    return new Promise((resolve) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        resolve({
          status: 'UNVERIFIED',
          messages: ['URL format valid — accessibility response timed out.'],
        });
      }, 5000);

      img.onload = () => {
        clearTimeout(timeout);
        const w = img.naturalWidth || 1000;
        const h = img.naturalHeight || 1000;
        const aspectNum = w / (h || 1);
        const aspectStr = Math.abs(aspectNum - 1) < 0.05 ? '1:1' : aspectNum < 0.85 ? '3:4' : `${w}:${h}`;

        const rule = MARKETPLACE_CONFIGURED_RULES[marketplaceId] || MARKETPLACE_CONFIGURED_RULES['meesho'];
        const messages: string[] = [];
        let status: ImageValidationStatus = 'VALID';

        if (w < rule.minWidth || h < rule.minHeight) {
          status = 'WARNING';
          messages.push(
            `Dimensions ${w}×${h}px are below minimum ${rule.minWidth}×${rule.minHeight}px for ${rule.marketplaceName}.`
          );
        } else {
          messages.push(`Meets ${rule.marketplaceName} spec (${w}×${h}px, ${aspectStr} ratio).`);
        }

        if (basic.status === 'WARNING') {
          status = 'WARNING';
          messages.push(basic.message);
        }

        resolve({
          status,
          messages,
          width: w,
          height: h,
          aspectRatio: aspectStr,
        });
      };

      img.onerror = () => {
        clearTimeout(timeout);
        resolve({
          status: 'ERROR',
          messages: ['Unable to load image. Verify the URL is publicly reachable and permits browser loading.'],
        });
      };

      img.src = url;
    });
  }
}

export const imageValidationService = new ImageValidationService();
