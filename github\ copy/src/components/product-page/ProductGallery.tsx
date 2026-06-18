'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  onImageChange?: (index: number) => void;
}

/**
 * Product Gallery Component with Zoom & Carousel
 * Luxury image showcase with smooth animations
 */
export const ProductGallery = ({
  images,
  productName,
  onImageChange,
}: ProductGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const mainImageRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(newIndex);
    onImageChange?.(newIndex);
    animateImageChange();
  };

  const handlePrev = () => {
    const newIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(newIndex);
    onImageChange?.(newIndex);
    animateImageChange();
  };

  const animateImageChange = () => {
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    timelineRef.current = gsap.timeline();
    timelineRef.current
      .to(mainImageRef.current, {
        opacity: 0.5,
        scale: 0.95,
        duration: 0.3,
        ease: 'power2.in',
      })
      .to(
        mainImageRef.current,
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: 'power2.out',
        },
        0.1
      );
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
    onImageChange?.(index);
    animateImageChange();
  };

  const toggleZoom = () => {
    if (!zoomRef.current) return;

    gsap.to(zoomRef.current, {
      scale: isZoomed ? 1 : 2.5,
      duration: 0.6,
      ease: 'power2.inOut',
    });

    setIsZoomed(!isZoomed);
  };

  useEffect(() => {
    // Animate thumbnails on mount
    gsap.from('.gallery-thumbnail', {
      opacity: 0,
      y: 10,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out',
    });
  }, []);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">No image available</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div
        className="relative w-full aspect-square bg-gray-50 rounded-lg overflow-hidden group cursor-zoom-in"
        onClick={toggleZoom}
      >
        <div ref={mainImageRef} className="w-full h-full">
          <Image
            ref={zoomRef}
            src={images[currentIndex]}
            alt={`${productName} - Image ${currentIndex + 1}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        </div>

        {/* Zoom Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleZoom();
          }}
          className="absolute top-4 right-4 bg-white/90 p-2 rounded-lg hover:bg-white transition-all duration-300 opacity-0 group-hover:opacity-100"
          aria-label="Zoom image"
        >
          <ZoomIn size={20} className="text-[#9b7a42]" />
        </button>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} className="text-[#9b7a42]" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight size={20} className="text-[#9b7a42]" />
            </button>
          </>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={`gallery-thumbnail relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                currentIndex === index
                  ? 'border-[#9b7a42]'
                  : 'border-gray-200 hover:border-[#d4af37]'
              }`}
            >
              <Image
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="100px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
