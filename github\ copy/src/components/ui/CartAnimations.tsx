'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { CheckCircle2, ShoppingBag } from 'lucide-react';

interface AddToCartToastProps {
  isVisible: boolean;
  productName: string;
  onClose?: () => void;
}

/**
 * Add to Cart Toast Animation Component
 * Luxury animated feedback when product is added to cart
 */
export const AddToCartToast = ({
  isVisible,
  productName,
  onClose,
}: AddToCartToastProps) => {
  const toastRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!toastRef.current) return;

    if (isVisible) {
      // Entrance animation
      gsap.from(toastRef.current, {
        opacity: 0,
        y: 50,
        scale: 0.8,
        duration: 0.4,
        ease: 'back.out(1.2)',
      });

      // Icon pulse animation
      gsap.fromTo(
        iconRef.current,
        { scale: 0 },
        {
          scale: 1,
          duration: 0.6,
          ease: 'back.out(1.5)',
          delay: 0.2,
        }
      );

      // Auto-close after 3 seconds
      const timer = setTimeout(() => {
        gsap.to(toastRef.current, {
          opacity: 0,
          y: 50,
          scale: 0.8,
          duration: 0.4,
          ease: 'power2.in',
          onComplete: onClose,
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      ref={toastRef}
      className="fixed bottom-8 right-8 bg-white rounded-2xl shadow-luxury p-6 flex items-center gap-4 z-50 max-w-sm"
    >
      <div
        ref={iconRef}
        className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-green-100 rounded-full"
      >
        <CheckCircle2 size={24} className="text-green-600" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-[#18191a]">Added to Cart!</p>
        <p className="text-sm text-[#666]">{productName}</p>
      </div>
      <button
        onClick={onClose}
        className="text-[#999] hover:text-[#18191a] transition-colors"
      >
        ✕
      </button>
    </div>
  );
};

/**
 * Cart Counter Animation Component
 * Animates cart item count updates
 */
export const CartCountBadge = ({ count }: { count: number }) => {
  const badgeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!badgeRef.current || count === 0) return;

    // Pulse animation on count change
    gsap.to(badgeRef.current, {
      scale: 1.3,
      duration: 0.3,
      ease: 'back.out(1.2)',
      yoyo: true,
      repeat: 1,
    });
  }, [count]);

  if (count === 0) return null;

  return (
    <span
      ref={badgeRef}
      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center"
    >
      {count > 99 ? '99+' : count}
    </span>
  );
};

/**
 * Floating Action Button Component
 * WhatsApp checkout button with entrance animation
 */
export const FloatingCheckoutButton = ({ cartCount }: { cartCount: number }) => {
  const buttonRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!buttonRef.current) return;

    // Float animation
    gsap.to(buttonRef.current, {
      y: -8,
      duration: 2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });

    // Pulse shadow on hover
    const onMouseEnter = () => {
      gsap.to(buttonRef.current, {
        boxShadow: '0 15px 50px rgba(37, 211, 102, 0.4)',
        duration: 0.3,
      });
    };

    const onMouseLeave = () => {
      gsap.to(buttonRef.current, {
        boxShadow: '0 8px 20px rgba(37, 211, 102, 0.2)',
        duration: 0.3,
      });
    };

    buttonRef.current.addEventListener('mouseenter', onMouseEnter);
    buttonRef.current.addEventListener('mouseleave', onMouseLeave);

    return () => {
      buttonRef.current?.removeEventListener('mouseenter', onMouseEnter);
      buttonRef.current?.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  if (cartCount === 0) return null;

  return (
    <a
      ref={buttonRef}
      href="https://wa.me/918800xxxxxx"
      className="fixed bottom-8 right-8 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full p-4 shadow-lg flex items-center gap-2 z-40 transition-all duration-300"
      style={{
        boxShadow: '0 8px 20px rgba(37, 211, 102, 0.2)',
      }}
    >
      <ShoppingBag size={20} />
      <CartCountBadge count={cartCount} />
    </a>
  );
};
