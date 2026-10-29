/**
 * Image Storage Service Abstraction for Listivo
 * Supports URL-based image management and prepares architecture for future S3 / Supabase storage providers.
 */

export interface StorageProviderConfig {
  configured: boolean;
  providerName: 'URL-Based' | 'Supabase Storage' | 'AWS S3' | 'Cloudinary';
  supportsDirectUpload: boolean;
  maxUploadSizeBytes: number;
}

export class ImageStorageService {
  private static instance: ImageStorageService;

  public getStorageConfig(): StorageProviderConfig {
    // Current environment check
    return {
      configured: false,
      providerName: 'URL-Based',
      supportsDirectUpload: false,
      maxUploadSizeBytes: 10 * 1024 * 1024, // 10MB
    };
  }

  public async uploadBinaryFile(file: File): Promise<{ success: boolean; url?: string; message: string }> {
    const config = this.getStorageConfig();
    if (!config.supportsDirectUpload) {
      return {
        success: false,
        message: 'Configuration required. Direct cloud binary upload requires Supabase or S3 storage provider configuration. Use image URLs or browser canvas processing.',
      };
    }
    return {
      success: false,
      message: 'Storage provider not configured.',
    };
  }

  public validateUrlFormat(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    return /^https?:\/\/.+/i.test(trimmed);
  }
}

export const imageStorageService = new ImageStorageService();
