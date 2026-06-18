import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Hook for GSAP animations with automatic cleanup
 */
export const useGSAPAnimation = (
  callback: (ctx: gsap.Context) => void,
  dependencies: any[] = []
) => {
  const ref = useRef<HTMLDivElement>(null);
  const contextRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    contextRef.current = gsap.context(() => {
      callback(contextRef.current!);
    }, ref);

    return () => {
      contextRef.current?.revert();
    };
  }, dependencies);

  return ref;
};

/**
 * Hook for scroll reveal animations
 */
export const useScrollReveal = () => {
  return useGSAPAnimation((ctx) => {
    const revealElements = document.querySelectorAll('[data-reveal]');
    
    revealElements.forEach((el) => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          end: 'top 50%',
          scrub: 1,
          markers: false,
        },
        opacity: 0,
        y: 100,
        duration: 1.2,
        ease: 'power3.out',
      });
    });
  });
};

/**
 * Hook for parallax scroll effects
 */
export const useParallax = (selector: string, speed: number = 0.5) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    gsap.to(selector, {
      scrollTrigger: {
        trigger: ref.current,
        scrub: true,
      },
      y: (i, target) => {
        return gsap.getProperty(target, 'offsetHeight') * speed;
      },
      ease: 'none',
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [selector, speed]);

  return ref;
};

/**
 * Hook for magnetic cursor effect
 */
export const useMagneticCursor = () => {
  useEffect(() => {
    const cursor = document.querySelector('[data-cursor]') as HTMLDivElement;
    if (!cursor) return;

    const magneticElements = document.querySelectorAll('[data-magnetic]');
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    const moveCursor = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    gsap.ticker.add(() => {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;

      gsap.set(cursor, {
        x: cursorX - 10,
        y: cursorY - 10,
        pointerEvents: 'none',
      });

      magneticElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const elCenterX = rect.left + rect.width / 2;
        const elCenterY = rect.top + rect.height / 2;

        const distance = Math.hypot(mouseX - elCenterX, mouseY - elCenterY);
        const maxDistance = 150;

        if (distance < maxDistance) {
          const angle = Math.atan2(mouseY - elCenterY, mouseX - elCenterX);
          const targetX = elCenterX + Math.cos(angle) * (maxDistance - distance) * 0.5;
          const targetY = elCenterY + Math.sin(angle) * (maxDistance - distance) * 0.5;

          gsap.to(el, {
            x: targetX - elCenterX,
            y: targetY - elCenterY,
            duration: 0.4,
          });
        } else {
          gsap.to(el, {
            x: 0,
            y: 0,
            duration: 0.4,
          });
        }
      });
    });

    window.addEventListener('mousemove', moveCursor);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      gsap.ticker.remove(() => {});
    };
  }, []);
};

/**
 * Hook for page transition animations
 */
export const usePageTransition = () => {
  useEffect(() => {
    const timeline = gsap.timeline();

    // Fade in on page load
    timeline.from('body', {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.inOut',
    });

    return () => {
      timeline.kill();
    };
  }, []);
};

/**
 * Hook for staggered animation sequences
 */
export const useStaggerAnimation = (selector: string, delay: number = 0.1) => {
  return useGSAPAnimation(() => {
    gsap.from(selector, {
      opacity: 0,
      y: 20,
      duration: 0.8,
      stagger: delay,
      ease: 'power3.out',
    });
  });
};

/**
 * Utility function for luxury easing presets
 */
export const luxuaryEasings = {
  smooth: 'power2.inOut',
  gentle: 'power1.inOut',
  elastic: 'back.out(1.2)',
  bounce: 'elastic.out(1, 0.75)',
  sharp: 'power3.inOut',
  flow: 'none',
};

/**
 * Utility for scroll progress indicator
 */
export const useScrollProgress = () => {
  useEffect(() => {
    const progress = document.querySelector('[data-scroll-progress]') as HTMLDivElement;
    if (!progress) return;

    gsap.to(progress, {
      scaleX: 1,
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        markers: false,
      },
      ease: 'none',
      transformOrigin: 'left center',
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);
};
