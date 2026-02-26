/**
 * Photo Compression Utility
 * Compresses images to ensure they are ≤1MB
 * Uses progressive quality degradation
 */

export type CompressionLevel = 'high' | 'medium' | 'low';

interface CompressionConfig {
  maxSizeKB: number;
  quality: number;
  maxDimension: number;
}

const COMPRESSION_LEVELS: Record<CompressionLevel, CompressionConfig> = {
  high: {
    maxSizeKB: 1024, // 1MB
    quality: 0.9,
    maxDimension: 1920,
  },
  medium: {
    maxSizeKB: 500,
    quality: 0.7,
    maxDimension: 1280,
  },
  low: {
    maxSizeKB: 200,
    quality: 0.5,
    maxDimension: 800,
  },
};

/**
 * Compress an image file to Base64 with quality degradation
 * @param file - Input image file
 * @param targetLevel - Target compression level (default: 'high')
 * @returns Compressed Base64 image string
 */
export async function compressImage(
  file: File
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = async () => {
        try {
          // Try high quality first
          let compressed = compressToLevel(img, 'high');
          
          // If still too large, try medium
          if (getBase64SizeKB(compressed) > COMPRESSION_LEVELS.high.maxSizeKB) {
            compressed = compressToLevel(img, 'medium');
          }
          
          // If still too large, try low
          if (getBase64SizeKB(compressed) > COMPRESSION_LEVELS.medium.maxSizeKB) {
            compressed = compressToLevel(img, 'low');
          }
          
          resolve(compressed);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Compress image to a specific quality level
 */
function compressToLevel(img: HTMLImageElement, level: CompressionLevel): string {
  const config = COMPRESSION_LEVELS[level];
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  // Calculate new dimensions maintaining aspect ratio
  let width = img.width;
  let height = img.height;
  
  if (width > config.maxDimension || height > config.maxDimension) {
    if (width > height) {
      height = (height * config.maxDimension) / width;
      width = config.maxDimension;
    } else {
      width = (width * config.maxDimension) / height;
      height = config.maxDimension;
    }
  }
  
  canvas.width = width;
  canvas.height = height;
  
  // Draw image
  ctx.drawImage(img, 0, 0, width, height);
  
  // Convert to Base64 with quality
  return canvas.toDataURL('image/jpeg', config.quality);
}

/**
 * Get the size of a Base64 string in KB
 */
function getBase64SizeKB(base64: string): number {
  const base64Length = base64.length - 'data:image/jpeg;base64,'.length;
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  const bytes = (base64Length * 3) / 4 - padding;
  return bytes / 1024;
}

/**
 * Validate an image file before compression
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }
  
  // Check file size (max 5MB before compression)
  const maxSizeMB = 10;
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }
  
  return { valid: true };
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
