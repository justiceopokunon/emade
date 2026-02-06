"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

type TileSize = 'square' | 'landscape' | 'portrait' | 'spotlight' | string;

interface ImageCropModalProps {
  open: boolean;
  onClose: () => void;
  imageFile: File | null;
  tileSize: TileSize;
  onCrop: (croppedBlob: Blob) => void;
  onTileSizeChange?: (newSize: TileSize) => void;
}

const TILE_DIMENSIONS: Record<TileSize, [number, number]> = {
  square: [180, 180],
  landscape: [360, 180],
  portrait: [180, 360],
  spotlight: [360, 360],
};

const TILE_LABELS: Record<TileSize, string> = {
  square: '1×1 Square',
  landscape: '2×1 Landscape',
  portrait: '1×2 Portrait',
  spotlight: '2×2 Spotlight',
};

export default function ImageCropModal({
  open,
  onClose,
  imageFile,
  tileSize: initialTileSize,
  onCrop,
  onTileSizeChange,
}: ImageCropModalProps) {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [selectedTileSize, setSelectedTileSize] = useState<TileSize>(initialTileSize);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const tileSizeKey = (selectedTileSize as string) as keyof typeof TILE_DIMENSIONS;
  const [targetWidth, targetHeight] = TILE_DIMENSIONS[tileSizeKey] || TILE_DIMENSIONS.square;
  const aspectRatio = targetWidth / targetHeight;

  // Update selected tile size when initialTileSize changes
  useEffect(() => {
    setSelectedTileSize(initialTileSize);
  }, [initialTileSize]);

  useEffect(() => {
    if (imageFile && open) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        setImageSrc(src);
        const img = new Image();
        img.onload = () => {
          imageRef.current = img;
          // Auto-fit image to preview area
          const previewRect = previewRef.current?.getBoundingClientRect();
          const previewWidth = previewRect?.width ?? 500;
          const previewHeight = previewRect?.height ?? 400;
          const imgAspect = img.width / img.height;
          
          if (imgAspect > aspectRatio) {
            // Image wider than tile - fit height
            setScale(previewHeight / img.height);
          } else {
            // Image taller than tile - fit width
            setScale(previewWidth / img.width);
          }
          setOffsetX(0);
          setOffsetY(0);
        };
        img.src = src;
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile, open, aspectRatio]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setOffsetX(e.clientX - dragStart.x);
      setOffsetY(e.clientY - dragStart.y);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = () => {
    if (!imageRef.current || !previewRef.current) return;

    const previewRect = previewRef.current.getBoundingClientRect();
    const previewWidth = previewRect.width;
    const previewHeight = previewRect.height;
    if (!previewWidth || !previewHeight) return;

    const outputScale = 2;
    const workingCanvas = document.createElement('canvas');
    workingCanvas.width = Math.round(previewWidth * outputScale);
    workingCanvas.height = Math.round(previewHeight * outputScale);
    const workingCtx = workingCanvas.getContext('2d');
    if (!workingCtx) return;

    const img = imageRef.current;
    
    workingCtx.save();
    workingCtx.translate(workingCanvas.width / 2, workingCanvas.height / 2);
    workingCtx.translate(offsetX * outputScale, offsetY * outputScale);
    workingCtx.scale(scale * (flipHorizontal ? -1 : 1), scale * (flipVertical ? -1 : 1));
    workingCtx.rotate((rotation * Math.PI) / 180);
    workingCtx.drawImage(
      img,
      -img.width / 2,
      -img.height / 2,
      img.width,
      img.height
    );
    workingCtx.restore();

    const cropX = (previewWidth - targetWidth) / 2;
    const cropY = (previewHeight - targetHeight) / 2;

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = targetWidth;
    finalCanvas.height = targetHeight;
    const finalCtx = finalCanvas.getContext('2d');
    if (!finalCtx) return;

    finalCtx.drawImage(
      workingCanvas,
      cropX * outputScale,
      cropY * outputScale,
      targetWidth * outputScale,
      targetHeight * outputScale,
      0,
      0,
      targetWidth,
      targetHeight
    );

    finalCanvas.toBlob(
      (blob) => {
        if (blob) {
          onCrop(blob);
          onClose();
        }
      },
      'image/png',
      1.0 // Maximum quality
    );
  };

  const handleTileSizeChange = (newSize: TileSize) => {
    setSelectedTileSize(newSize);
    if (onTileSizeChange) {
      onTileSizeChange(newSize);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass relative w-full max-h-[95vh] overflow-y-auto sm:max-w-2xl lg:max-w-3xl rounded-xl sm:rounded-2xl shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between bg-[var(--panel)] border-b border-white/10 p-3 sm:p-6 gap-3 backdrop-blur-sm">
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.2em] sm:tracking-[0.28em] text-slate-400 truncate">Image Crop Tool</p>
            <h2 className="text-sm sm:text-xl font-semibold text-white truncate">
              Fit to {TILE_LABELS[tileSizeKey] || 'Square'} Tile
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-full border border-white/20 bg-white/10 p-1.5 sm:p-2 text-white transition hover:border-white/40 hover:bg-white/20"
            aria-label="Close crop tool"
          >
            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Preview Area */}
        <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
          <div className="text-xs sm:text-sm text-slate-300">
            <p className="mb-1 sm:mb-2">
              <span className="text-lime-300">Target:</span> {targetWidth}×{targetHeight}px ({TILE_LABELS[tileSizeKey] || 'Square'})
            </p>
            <p className="text-slate-400 text-xs hidden sm:block">
              Drag to position • Zoom with slider • Green guide shows crop area
            </p>
          </div>

          {/* Canvas Preview */}
          <div className="relative rounded-lg sm:rounded-xl overflow-hidden border border-white/10 bg-[var(--surface-alt)]">
            <div
              ref={previewRef}
              className="relative w-full h-[280px] sm:h-[350px] lg:h-[400px] cursor-move overflow-hidden bg-black/40"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {imageSrc && (
                <img
                  src={imageSrc}
                  alt="Crop preview"
                  className="absolute"
                  style={{
                    transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale * (flipHorizontal ? -1 : 1)}, ${scale * (flipVertical ? -1 : 1)}) rotate(${rotation}deg)`,
                    transformOrigin: 'center',
                    left: '50%',
                    top: '50%',
                    marginLeft: imageRef.current ? -imageRef.current.width / 2 : 0,
                    marginTop: imageRef.current ? -imageRef.current.height / 2 : 0,
                    userSelect: 'none',
                    pointerEvents: 'none',
                  }}
                />
              )}
              
              {/* Crop Guide Overlay */}
              <div 
                className="absolute border-2 border-lime-400 pointer-events-none"
                style={{
                  left: '50%',
                  top: '50%',
                  width: `${targetWidth}px`,
                  height: `${targetHeight}px`,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                }}
              >
                <div className="absolute -top-6 left-0 right-0 text-center text-xs font-semibold text-lime-400">
                  Crop Area
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3 sm:space-y-4">
            {/* Tile Size Selector */}
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 sm:mb-2">
                Tile Size
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                {Object.entries(TILE_LABELS).map(([size, label]) => (
                  <button
                    key={size}
                    onClick={() => handleTileSizeChange(size as TileSize)}
                    className={`btn-sm rounded-lg font-medium transition ${
                        selectedTileSize === size
                          ? 'bg-lime-400 text-black'
                          : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Zoom Control */}
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 sm:mb-2">
                Zoom: {(scale * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full accent-lime-400 h-1.5 sm:h-2"
              />
            </div>

            {/* Rotation Control */}
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 sm:mb-2">
                Rotation: {rotation}°
              </label>
              <div className="flex gap-1.5 sm:gap-2 items-center flex-wrap">
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="15"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="flex-1 min-w-[100px] accent-lime-400 h-1.5 sm:h-2"
                />
                <button
                  onClick={() => setRotation((rotation - 90 + 360) % 360)}
                  className="btn-ghost btn-sm"
                  title="Rotate left 90°"
                >
                  ↺ 90°
                </button>
                <button
                  onClick={() => setRotation((rotation + 90) % 360)}
                  className="btn-ghost btn-sm"
                  title="Rotate right 90°"
                >
                  ↻ 90°
                </button>
                <button
                  onClick={() => setRotation(0)}
                  className="btn-ghost btn-sm"
                >
                  Reset
                </button>
              </div>
            </div>
            
            {/* Transform Controls */}
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                <button
                onClick={() => setFlipHorizontal(!flipHorizontal)}
                className={`rounded-lg btn-sm font-medium transition ${
                  flipHorizontal
                    ? 'bg-lime-400/20 text-lime-300 border border-lime-400/40'
                    : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                }`}
              >
                ⇄ Flip H
              </button>
              <button
                onClick={() => setFlipVertical(!flipVertical)}
                className={`rounded-lg btn-sm font-medium transition ${
                  flipVertical
                    ? 'bg-lime-400/20 text-lime-300 border border-lime-400/40'
                    : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                }`}
              >
                ⇅ Flip V
              </button>
              <button
                onClick={() => setScale(1)}
                className="btn-ghost btn-sm"
              >
                Reset Zoom
              </button>
              <button
                onClick={() => { setOffsetX(0); setOffsetY(0); }}
                className="btn-ghost btn-sm"
              >
                Center
              </button>
            </div>

            {/* Reset All Button */}
            <button
              onClick={() => {
                setScale(1);
                setOffsetX(0);
                setOffsetY(0);
                setRotation(0);
                setFlipHorizontal(false);
                setFlipVertical(false);
              }}
              className="w-full btn-ghost btn-sm"
            >
              Reset All Transformations
            </button>
          </div>
        </div>

        {/* Footer with prominent confirm button */}
        <div className="sticky bottom-0 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 bg-[var(--panel)] border-t border-white/10 p-3 sm:p-4 lg:p-6 backdrop-blur-sm">
          <button
            onClick={onClose}
            className="btn-ghost btn-sm rounded-full font-medium whitespace-nowrap"
          >
            Cancel
          </button>
          <button
            onClick={handleCrop}
            className="px-4 sm:px-8 py-1.5 sm:py-3 rounded-full bg-gradient-to-r from-lime-400 to-lime-300 text-black font-bold text-xs sm:text-base lg:text-lg transition hover:shadow-xl hover:shadow-lime-400/50 hover:scale-105 whitespace-nowrap"
          >
            ✓ Confirm & Apply
          </button>
        </div>
      </motion.div>
    </div>
  );
}
