'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScentPyramid } from '@/types/product.types';

interface ScentNotesPyramidProps {
  pyramid: ScentPyramid;
}

/**
 * Scent Notes Pyramid Component
 * Visualizes fragrance notes in a luxury pyramid layout
 * Shows top, heart, and base notes with animations
 */
export const ScentNotesPyramid = ({ pyramid }: ScentNotesPyramidProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const heartRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Entrance animations
    const timeline = gsap.timeline();

    timeline
      .from(topRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.6,
        ease: 'power2.out',
      })
      .from(
        heartRef.current,
        {
          opacity: 0,
          scale: 0.8,
          duration: 0.6,
          ease: 'power2.out',
        },
        0.2
      )
      .from(
        baseRef.current,
        {
          opacity: 0,
          y: 20,
          duration: 0.6,
          ease: 'power2.out',
        },
        0.4
      );

    // Hover animation on mount
    const addHoverEffect = (ref: HTMLDivElement | null) => {
      if (!ref) return;

      ref.addEventListener('mouseenter', () => {
        gsap.to(ref, {
          scale: 1.05,
          boxShadow: '0 10px 30px rgba(155, 122, 66, 0.2)',
          duration: 0.3,
          ease: 'power2.out',
        });
      });

      ref.addEventListener('mouseleave', () => {
        gsap.to(ref, {
          scale: 1,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          duration: 0.3,
          ease: 'power2.out',
        });
      });
    };

    addHoverEffect(topRef.current);
    addHoverEffect(heartRef.current);
    addHoverEffect(baseRef.current);

    return () => {
      timeline.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center gap-8 py-12 px-4 max-w-lg mx-auto"
    >
      <h3 className="text-2xl font-serif text-[#18191a] mb-4">Scent Profile</h3>

      {/* Pyramid Visualization */}
      <div className="relative w-full">
        {/* Top Notes - Triangle */}
        <div
          ref={topRef}
          className="mb-4 mx-auto w-48 bg-gradient-to-b from-[#e8d4c4] to-[#d9c5b5] rounded-t-3xl p-6 text-center border-2 border-[#d4af37]/30 transition-all duration-300"
          style={{
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}
        >
          <p className="text-xs uppercase tracking-widest text-[#9b7a42] font-bold mb-3">
            Top Notes
          </p>
          <p className="text-xs text-[#18191a] leading-relaxed font-light">
            {pyramid.top.map((note) => note.name).join(' • ')}
          </p>
          <p className="text-xs text-[#666] mt-2 italic">Lasts 5-15 minutes</p>
        </div>

        {/* Heart Notes - Middle */}
        <div
          ref={heartRef}
          className="mb-4 mx-auto w-72 bg-gradient-to-b from-[#f0e6d8] to-[#e8dccf] rounded-2xl p-6 text-center border-2 border-[#d4af37]/50 transition-all duration-300"
          style={{
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
          }}
        >
          <p className="text-xs uppercase tracking-widest text-[#9b7a42] font-bold mb-3">
            Heart Notes (Middle)
          </p>
          <p className="text-sm text-[#18191a] leading-relaxed font-light">
            {pyramid.heart.map((note) => note.name).join(' • ')}
          </p>
          <p className="text-xs text-[#666] mt-2 italic">Lasts 3-5 hours</p>
        </div>

        {/* Base Notes - Wide Bottom */}
        <div
          ref={baseRef}
          className="mx-auto w-full bg-gradient-to-b from-[#f8f5f0] to-[#ede8e3] rounded-b-3xl p-6 text-center border-2 border-[#d4af37]/30 transition-all duration-300"
          style={{
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}
        >
          <p className="text-xs uppercase tracking-widest text-[#9b7a42] font-bold mb-3">
            Base Notes
          </p>
          <p className="text-sm text-[#18191a] leading-relaxed font-light">
            {pyramid.base.map((note) => note.name).join(' • ')}
          </p>
          <p className="text-xs text-[#666] mt-2 italic">Lasts 6+ hours</p>
        </div>
      </div>

      {/* Legend */}
      <div className="w-full mt-8 pt-6 border-t border-[#e8e0d5]">
        <p className="text-xs text-[#666] text-center italic mb-4">
          The pyramid shows how a fragrance evolves over time
        </p>
        <div className="grid grid-cols-3 gap-4 text-xs text-center">
          <div>
            <div className="w-3 h-3 bg-[#e8d4c4] rounded-full mx-auto mb-2"></div>
            <p className="font-medium text-[#9b7a42]">Opening</p>
          </div>
          <div>
            <div className="w-3 h-3 bg-[#f0e6d8] rounded-full mx-auto mb-2"></div>
            <p className="font-medium text-[#9b7a42]">Character</p>
          </div>
          <div>
            <div className="w-3 h-3 bg-[#f8f5f0] rounded-full mx-auto mb-2"></div>
            <p className="font-medium text-[#9b7a42]">Longevity</p>
          </div>
        </div>
      </div>
    </div>
  );
};
