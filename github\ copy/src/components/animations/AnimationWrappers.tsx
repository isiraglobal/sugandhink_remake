'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: 'fade' | 'slide-up' | 'scale' | 'reveal';
}

/**
 * Animated Section Component
 * Wraps content with entrance animations
 */
export const AnimatedSection = ({
  children,
  className = '',
  delay = 0,
  variant = 'fade',
}: AnimatedSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const getAnimation = () => {
      switch (variant) {
        case 'slide-up':
          return {
            opacity: 0,
            y: 40,
          };
        case 'scale':
          return {
            opacity: 0,
            scale: 0.95,
          };
        case 'reveal':
          return {
            opacity: 0,
            clip: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
          };
        default: // fade
          return {
            opacity: 0,
          };
      }
    };

    gsap.from(ref.current, {
      ...getAnimation(),
      duration: 0.8,
      delay,
      ease: 'power2.out',
    });
  }, [variant, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

/**
 * Stagger Animation Component
 * Animates children elements with stagger effect
 */
export const StaggerContainer = ({
  children,
  className = '',
  staggerDelay = 0.1,
  duration = 0.6,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  duration?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const items = ref.current.querySelectorAll('[data-stagger-item]');

    gsap.from(items, {
      opacity: 0,
      y: 20,
      duration,
      stagger: staggerDelay,
      ease: 'power2.out',
    });
  }, [staggerDelay, duration]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

/**
 * Text Reveal Component
 * Animates text letter by letter or word by word
 */
export const TextReveal = ({
  children,
  as: Component = 'h1',
  className = '',
  delay = 0,
}: {
  children: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  delay?: number;
}) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const words = children.split(' ');
    ref.current.innerHTML = words
      .map((word) => `<span class="word">${word}</span>`)
      .join(' ');

    const wordSpans = ref.current.querySelectorAll('.word');

    gsap.from(wordSpans, {
      opacity: 0,
      y: 10,
      duration: 0.5,
      stagger: 0.08,
      delay,
      ease: 'power2.out',
    });
  }, [children, delay]);

  return <Component ref={ref} className={className} />;
};

/**
 * Parallax Image Component
 * Creates depth effect with scroll
 */
export const ParallaxImage = ({
  src,
  alt,
  speed = 0.5,
  className = '',
}: {
  src: string;
  alt: string;
  speed?: number;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    gsap.to(ref.current, {
      scrollTrigger: {
        trigger: ref.current,
        scrub: true,
      },
      yPercent: speed * 100,
      ease: 'none',
    });
  }, [speed]);

  return (
    <div ref={ref} className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </div>
  );
};
