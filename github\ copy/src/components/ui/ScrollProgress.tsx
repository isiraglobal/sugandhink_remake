'use client';

import { useScrollProgress } from '@/hooks/useGSAP';

/**
 * Scroll Progress Bar Component
 * Shows vertical scroll progress with smooth animation
 */
export const ScrollProgress = () => {
  useScrollProgress();

  return (
    <div
      data-scroll-progress
      className="fixed top-0 left-0 h-1 bg-gradient-to-r from-[#d4af37] via-[#9b7a42] to-[#d4af37] z-50 origin-left"
      style={{
        scaleX: 0,
        transformOrigin: 'left center',
        boxShadow: '0 0 15px rgba(212, 175, 55, 0.6)',
      }}
    />
  );
};
