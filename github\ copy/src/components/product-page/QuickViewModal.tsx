'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { X, Minus, Plus, Heart, Share2 } from 'lucide-react';
import Image from 'next/image';
import { Product } from '@/types/product.types';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (quantity: number, size: 'sample-30ml' | 'full-50ml') => void;
}

/**
 * Product Quick View Modal
 * Luxury modal with smooth animations for quick product preview
 */
export const QuickViewModal = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: QuickViewModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<'sample-30ml' | 'full-50ml'>('full-50ml');
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!modalRef.current || !contentRef.current || !overlayRef.current) return;

    if (isOpen) {
      // Prevent scroll
      document.body.style.overflow = 'hidden';

      // Entrance animations
      const timeline = gsap.timeline();
      timeline
        .to(overlayRef.current, {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.inOut',
        })
        .to(
          contentRef.current,
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.4,
            ease: 'back.out(1.1)',
          },
          0.1
        );
    } else {
      // Exit animations
      const timeline = gsap.timeline();
      timeline
        .to(contentRef.current, {
          opacity: 0,
          scale: 0.95,
          y: 20,
          duration: 0.3,
          ease: 'power2.in',
        })
        .to(
          overlayRef.current,
          {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
          },
          0.1
        );

      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const displayPrice = selectedSize === 'sample-30ml' ? product.samplePrice : product.price;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === modalRef.current) onClose();
      }}
    >
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0"
      />

      {/* Modal Content */}
      <div
        ref={contentRef}
        className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto opacity-0 scale-95 translate-y-5"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="grid md:grid-cols-2 gap-6 p-6 md:p-8">
          {/* Image */}
          <div className="flex items-center justify-center bg-gray-50 rounded-xl aspect-square">
            <Image
              src={product.srcUrl}
              alt={product.title}
              width={400}
              height={400}
              className="object-cover w-full h-full rounded-xl"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col gap-6">
            {/* Title & Code */}
            <div>
              <span className="inline-block text-xs uppercase tracking-widest font-bold text-[#9b7a42] bg-[#f8f5f0] px-3 py-1 rounded mb-3">
                {product.scentFamily}
              </span>
              <h2 className="text-3xl font-serif text-[#18191a] mb-1">
                {product.title}
              </h2>
              <p className="text-sm text-[#666]">Code: {product.code}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-lg ${
                      i < Math.floor(product.rating) ? '⭐' : '☆'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-[#666]">
                ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif text-[#9b7a42]">
                ₹{displayPrice?.toLocaleString()}
              </span>
              {product.discount?.percentage > 0 && (
                <span className="text-lg bg-red-100 text-red-600 px-2 py-1 rounded font-bold">
                  -{product.discount.percentage}%
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-[#666] leading-relaxed">{product.description}</p>

            {/* Size Selection */}
            <div>
              <label className="block text-sm font-medium text-[#18191a] mb-3">
                Choose Size
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedSize('sample-30ml')}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                    selectedSize === 'sample-30ml'
                      ? 'border-[#9b7a42] bg-[#f8f5f0]'
                      : 'border-gray-200 hover:border-[#d4af37]'
                  }`}
                >
                  <p className="font-medium text-sm">Sample</p>
                  <p className="text-xs text-[#666]">30ml · ₹{product.samplePrice}</p>
                </button>
                <button
                  onClick={() => setSelectedSize('full-50ml')}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                    selectedSize === 'full-50ml'
                      ? 'border-[#9b7a42] bg-[#f8f5f0]'
                      : 'border-gray-200 hover:border-[#d4af37]'
                  }`}
                >
                  <p className="font-medium text-sm">Full</p>
                  <p className="text-xs text-[#666]">50ml · ₹{product.price}</p>
                </button>
              </div>
            </div>

            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-medium text-[#18191a] mb-3">
                Quantity
              </label>
              <div className="flex items-center border border-gray-200 rounded-lg w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100 transition-colors"
                >
                  <Minus size={18} />
                </button>
                <span className="px-6 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-gray-100 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  onAddToCart?.(quantity, selectedSize);
                  onClose();
                }}
                className="flex-1 bg-[#9b7a42] hover:bg-[#7a5f34] text-white py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                Add to Cart
              </button>
              <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Heart size={20} className="text-[#9b7a42]" />
              </button>
              <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 size={20} className="text-[#9b7a42]" />
              </button>
            </div>

            {/* Availability */}
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-green-600 font-medium">In Stock</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
