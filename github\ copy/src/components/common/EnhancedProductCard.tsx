'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { Star, ShoppingBag, Heart } from 'lucide-react';
import { Product } from '@/types/product.types';

interface EnhancedProductCardProps {
  product: Product;
  onAddToCart?: () => void;
}

/**
 * Enhanced Product Card with Luxury Animations
 * Hover effects, scale animations, and premium interactions
 */
export const EnhancedProductCard = ({ product, onAddToCart }: EnhancedProductCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const onMouseEnter = () => {
      // Card lift effect
      gsap.to(card, {
        y: -10,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
        duration: 0.4,
        ease: 'power2.out',
      });

      // Image scale
      gsap.to(imageRef.current, {
        scale: 1.1,
        duration: 0.6,
        ease: 'power2.out',
      });

      // Overlay fade in
      gsap.to(overlayRef.current, {
        opacity: 0.95,
        duration: 0.4,
        ease: 'power2.out',
      });

      // Badge animation
      gsap.to(badgeRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
      });
    };

    const onMouseLeave = () => {
      gsap.to(card, {
        y: 0,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        duration: 0.4,
        ease: 'power2.out',
      });

      gsap.to(imageRef.current, {
        scale: 1,
        duration: 0.6,
        ease: 'power2.out',
      });

      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out',
      });

      gsap.to(badgeRef.current, {
        opacity: 0,
        y: 10,
        duration: 0.4,
        ease: 'power2.out',
      });
    };

    card.addEventListener('mouseenter', onMouseEnter);
    card.addEventListener('mouseleave', onMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', onMouseEnter);
      card.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  const discountPercentage = product.discount?.percentage || 0;

  return (
    <Link href={`/shop/product/${product.id}`}>
      <div
        ref={cardRef}
        className="group bg-white rounded-xl overflow-hidden transition-all duration-300 cursor-pointer"
        style={{
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        }}
      >
        {/* Image Container */}
        <div className="relative overflow-hidden bg-gray-100 aspect-square">
          <div ref={imageRef} className="w-full h-full">
            <Image
              src={product.srcUrl}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>

          {/* Overlay with Actions */}
          <div
            ref={overlayRef}
            className="absolute inset-0 bg-black/0 flex items-end justify-between p-4 opacity-0"
            style={{
              background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.6) 100%)',
            }}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                onAddToCart?.();
              }}
              className="bg-[#d4af37] hover:bg-[#9b7a42] text-white py-2 px-4 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors"
            >
              <ShoppingBag size={16} />
              Add
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
              }}
              className="bg-white/80 hover:bg-white text-[#9b7a42] p-2 rounded-lg transition-colors"
            >
              <Heart size={18} />
            </button>
          </div>

          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div
              ref={badgeRef}
              className="absolute top-4 left-4 bg-red-500 text-white py-1 px-3 rounded-full text-xs font-bold opacity-0"
              style={{
                transform: 'translateY(10px)',
              }}
            >
              -{discountPercentage}%
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-serif text-[#18191a] text-lg mb-2 line-clamp-2">
            {product.title}
          </h3>

          {/* Scent Family Badge */}
          <div className="mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-[#9b7a42] bg-[#f8f5f0] px-2 py-1 rounded">
              {product.scentFamily}
            </span>
          </div>

          {/* Short Notes */}
          <p className="text-xs text-[#666] mb-3 line-clamp-1">{product.shortNotes}</p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < Math.floor(product.rating) ? 'fill-[#d4af37] text-[#d4af37]' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="text-xs text-[#666]">({product.reviews || 0})</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-[#9b7a42] text-xl font-bold">
              ₹{product.price.toLocaleString()}
            </span>
            {product.discount?.percentage > 0 && (
              <span className="text-sm text-gray-400 line-through">
                ₹{(product.price + (product.discount.amount || 0)).toLocaleString()}
              </span>
            )}
          </div>

          {/* Availability */}
          <p className="text-xs mt-2 text-green-600 font-medium">
            {product.availability === 'in-stock' ? '✓ In Stock' : 'Low Stock'}
          </p>
        </div>
      </div>
    </Link>
  );
};
