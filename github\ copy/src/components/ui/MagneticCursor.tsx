'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Magnetic Cursor Component
 * Tracks mouse movement with smooth GSAP animation
 */
export const MagneticCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cursorRef.current || !dotRef.current) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let dotX = 0;
    let dotY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    // Smooth cursor animation loop
    gsap.ticker.add(() => {
      // Cursor circle follows with slight delay
      cursorX += (mouseX - cursorX) * 0.2;
      cursorY += (mouseY - cursorY) * 0.2;

      // Inner dot follows closely
      dotX += (mouseX - dotX) * 0.6;
      dotY += (mouseY - dotY) * 0.6;

      gsap.set(cursorRef.current, {
        x: cursorX - 20,
        y: cursorY - 20,
      });

      gsap.set(dotRef.current, {
        x: dotX - 4,
        y: dotY - 4,
      });
    });

    window.addEventListener('mousemove', onMouseMove);

    // Scale up on hover over interactive elements
    const interactiveElements = document.querySelectorAll(
      'button, a, [role="button"], input, textarea'
    );

    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        gsap.to(cursorRef.current, {
          width: 50,
          height: 50,
          borderColor: '#9b7a42',
          boxShadow: '0 0 20px rgba(155, 122, 66, 0.5)',
          duration: 0.3,
        });
      });

      el.addEventListener('mouseleave', () => {
        gsap.to(cursorRef.current, {
          width: 40,
          height: 40,
          borderColor: '#d4af37',
          boxShadow: '0 0 10px rgba(212, 175, 55, 0.2)',
          duration: 0.3,
        });
      });
    });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      gsap.ticker.remove(() => {});
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', () => {});
        el.removeEventListener('mouseleave', () => {});
      });
    };
  }, []);

  return (
    <>
      {/* Cursor circle */}
      <div
        ref={cursorRef}
        className="fixed w-10 h-10 border-2 border-[#d4af37] rounded-full pointer-events-none z-[9999] mix-blend-multiply shadow-lg"
        style={{
          boxShadow: '0 0 10px rgba(212, 175, 55, 0.2)',
          transition: 'none',
        }}
      />
      {/* Inner dot */}
      <div
        ref={dotRef}
        className="fixed w-2 h-2 bg-[#9b7a42] rounded-full pointer-events-none z-[10000]"
        style={{
          transition: 'none',
        }}
      />
    </>
  );
};
