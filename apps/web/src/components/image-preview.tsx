"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImagePreviewProps {
  src: string;
  alt: string;
  children: React.ReactNode;
  className?: string;
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;
const ZOOM_STEP = 0.1;

export function ImagePreview({
  src,
  alt,
  children,
  className,
}: ImagePreviewProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [zoom, setZoom] = React.useState(1);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const [naturalSize, setNaturalSize] = React.useState({ width: 0, height: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);

  const handleImageLoad = React.useCallback(() => {
    if (imgRef.current) {
      setNaturalSize({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight,
      });
    }
  }, []);

  // Calculate initial fit zoom
  const calculateFitZoom = React.useCallback(() => {
    if (!containerRef.current || naturalSize.width === 0) return 1;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();

    const padding = 80;
    const scaleX = (containerRect.width - padding) / naturalSize.width;
    const scaleY = (containerRect.height - padding) / naturalSize.height;

    return Math.min(scaleX, scaleY, 1);
  }, [naturalSize]);

  // Auto-fit when expanded
  React.useEffect(() => {
    if (isExpanded && naturalSize.width > 0) {
      const fitZoom = calculateFitZoom();
      setZoom(fitZoom);
      setPosition({ x: 0, y: 0 });
    }
  }, [isExpanded, naturalSize, calculateFitZoom]);

  const handleZoomIn = React.useCallback(() => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const handleZoomOut = React.useCallback(() => {
    setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  }, []);

  const handleReset = React.useCallback(() => {
    const fitZoom = calculateFitZoom();
    setZoom(fitZoom);
    setPosition({ x: 0, y: 0 });
  }, [calculateFitZoom]);

  const handleSliderChange = React.useCallback(
    (value: number | readonly number[]) => {
      const val = Array.isArray(value) ? value[0] : value;
      setZoom(val / 100);
    },
    [],
  );

  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    },
    [position],
  );

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    },
    [isDragging, dragStart],
  );

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = React.useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setZoom((prev) => {
      const newZoom = Math.max(MIN_ZOOM, Math.min(prev + delta, MAX_ZOOM));
      return newZoom;
    });
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isExpanded) return;

      switch (e.key) {
        case "Escape":
          setIsExpanded(false);
          break;
        case "+":
        case "=":
          e.preventDefault();
          handleZoomIn();
          break;
        case "-":
        case "_":
          e.preventDefault();
          handleZoomOut();
          break;
        case "0":
          e.preventDefault();
          handleReset();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded, handleZoomIn, handleZoomOut, handleReset]);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleDownload = React.useCallback(() => {
    const link = document.createElement("a");
    link.href = src;
    link.download = alt.replace(/\s+/g, "_").toLowerCase() + ".png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [src, alt]);

  // Expanded inline viewer - takes full width with white/light background
  if (isExpanded) {
    return (
      <div className="relative col-span-full my-4 overflow-hidden rounded-lg border bg-white shadow-lg">
        {/* Header with controls */}
        <div className="flex items-center justify-between border-b bg-slate-50 px-3 py-2">
          <span className="text-xs font-medium text-slate-600">{alt}</span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleDownload}
              className="text-slate-500 hover:text-slate-900"
              title="Download"
            >
              <Download className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleToggleExpand}
              className="text-slate-500 hover:text-slate-900"
              title="Close preview (Esc)"
            >
              <Minimize2 className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Image viewport with checkerboard pattern for transparency */}
        <div
          ref={containerRef}
          className="relative h-[600px] w-full cursor-grab overflow-hidden active:cursor-grabbing"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #f1f5f9 25%, transparent 25%),
              linear-gradient(-45deg, #f1f5f9 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #f1f5f9 75%),
              linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)
            `,
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
            backgroundColor: "#ffffff",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
        >
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              transform: `translate(${position.x}px, ${position.y}px)`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={src}
              alt={alt}
              onLoad={handleImageLoad}
              className="block shadow-lg select-none"
              draggable={false}
              style={{
                width: naturalSize.width > 0 ? naturalSize.width : "auto",
                height: naturalSize.height > 0 ? naturalSize.height : "auto",
                maxWidth: "none",
                maxHeight: "none",
                transform: `scale(${zoom})`,
                transformOrigin: "center center",
                imageOrientation: "from-image",
              }}
            />
          </div>
        </div>

        {/* Bottom controls bar */}
        <div className="flex items-center justify-center gap-2 border-t bg-slate-50 px-4 py-2">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleZoomOut}
            disabled={zoom <= MIN_ZOOM}
            className="text-slate-500 hover:text-slate-900 disabled:opacity-30"
          >
            <ZoomOut className="size-3.5" />
          </Button>

          <div className="w-28">
            <Slider
              value={[zoom * 100]}
              min={MIN_ZOOM * 100}
              max={MAX_ZOOM * 100}
              step={ZOOM_STEP * 100}
              onValueChange={handleSliderChange}
            />
          </div>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleZoomIn}
            disabled={zoom >= MAX_ZOOM}
            className="text-slate-500 hover:text-slate-900 disabled:opacity-30"
          >
            <ZoomIn className="size-3.5" />
          </Button>

          <div className="mx-2 h-4 w-px bg-slate-300" />

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleReset}
            className="text-slate-500 hover:text-slate-900"
            title="Fit to screen (0)"
          >
            <RotateCcw className="size-3.5" />
          </Button>

          <span className="ml-1 min-w-[3ch] text-right text-[10px] text-slate-500 tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* Hint */}
        <div className="pointer-events-none absolute top-10 left-3 text-[10px] text-slate-400 select-none">
          Scroll to zoom · Drag to pan · Esc to close
        </div>
      </div>
    );
  }

  // Collapsed thumbnail
  return (
    <button
      onClick={handleToggleExpand}
      className={cn(
        "group hover:border-foreground/30 relative cursor-zoom-in overflow-hidden rounded-md border transition-all hover:shadow-md",
        className,
      )}
    >
      {children}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
        <Maximize2 className="size-6 text-white opacity-0 drop-shadow-md transition-opacity group-hover:opacity-100" />
      </div>
    </button>
  );
}
