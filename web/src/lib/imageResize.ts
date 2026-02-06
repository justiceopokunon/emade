import imageCompression from 'browser-image-compression';

type GalleryTileSize = 'square' | 'landscape' | 'portrait' | 'spotlight';

interface ResizeOptions {
  maxSizeMB?: number;
  useWebWorker?: boolean;
  tileSize?: GalleryTileSize;
}

// Tile dimensions in pixels (width x height)
const TILE_DIMENSIONS: Record<GalleryTileSize, [number, number]> = {
  square: [180, 180],
  landscape: [360, 180],
  portrait: [180, 360],
  spotlight: [360, 360],
};

/**
 * Resize image file with minimal quality loss
 * @param file - The image file to resize
 * @param options - Resize options
 * @returns Optimized image file
 */
export async function resizeImage(
  file: File,
  options: ResizeOptions = {}
): Promise<File> {
  const {
    maxSizeMB = 2, // 2MB default for high quality
    useWebWorker = false,
    tileSize = 'square',
  } = options;

  const [width, height] = TILE_DIMENSIONS[tileSize];

  try {
    const compressedFile = await imageCompression(file, {
      maxSizeMB,
      maxWidthOrHeight: Math.max(width, height),
      useWebWorker,
      initialQuality: 0.95, // High quality
    });

    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    // Return original file if compression fails
    return file;
  }
}

/**
 * Resize image to exact tile dimensions using Canvas API
 * @param file - The image file
 * @param tileSize - The gallery tile size
 * @returns Promise<Blob> - Resized image blob
 */
export async function resizeToTileDimensions(
  file: File,
  tileSize: GalleryTileSize | string = 'square'
): Promise<Blob> {
  const validSize = (tileSize as string) as GalleryTileSize;
  const [targetWidth, targetHeight] = TILE_DIMENSIONS[validSize] || TILE_DIMENSIONS.square;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas with exact tile dimensions
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Calculate aspect ratios
        const imgAspect = img.width / img.height;
        const tileAspect = targetWidth / targetHeight;

        let srcX = 0, srcY = 0, srcWidth = img.width, srcHeight = img.height;

        // Cover fill: crop to match tile aspect ratio
        if (imgAspect > tileAspect) {
          // Image is wider, crop width
          srcWidth = img.height * tileAspect;
          srcX = (img.width - srcWidth) / 2;
        } else {
          // Image is taller, crop height
          srcHeight = img.width / tileAspect;
          srcY = (img.height - srcHeight) / 2;
        }

        // Draw the cropped and resized image
        ctx.drawImage(
          img,
          srcX,
          srcY,
          srcWidth,
          srcHeight,
          0,
          0,
          targetWidth,
          targetHeight
        );

        // Convert to WebP blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          'image/webp',
          0.8 // Quality setting
        );
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Preview image before uploading
 * @param file - The image file
 * @returns Promise<string> - Data URL for preview
 */
export async function getImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Get image dimensions
 * @param file - The image file
 * @returns Promise<{width: number, height: number}>
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

