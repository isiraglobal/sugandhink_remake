'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';

const WHATSAPP_NUMBER = '+918800xxxxxx'; // Replace with your actual WhatsApp number

/**
 * Generate WhatsApp checkout message with order details
 */
const generateWhatsAppMessage = (cartItems: any[]) => {
  if (!cartItems || cartItems.length === 0) {
    return 'Hi, I want to place an order.';
  }

  const orderSummary = cartItems
    .map(
      (item) =>
        `${item.product.title} (${item.size === 'sample-30ml' ? '30ml' : '50ml'}) x${item.quantity}`
    )
    .join('\n');

  const total = cartItems.reduce((sum, item) => sum + item.selectedPrice * item.quantity, 0);

  const message = `Hi! I would like to place an order:\n\n${orderSummary}\n\nTotal: ₹${total.toLocaleString()}\n\nPlease confirm availability and provide shipping options.`;

  return encodeURIComponent(message);
};

/**
 * Checkout Page with WhatsApp Integration
 * Luxury checkout experience with direct WhatsApp messaging
 */
export const CheckoutPage = () => {
  const cartItems = useSelector((state: RootState) => state.carts.items);
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Entrance animation
    gsap.from(containerRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.6,
      ease: 'power2.out',
    });

    // Stagger card animations
    gsap.from('.checkout-card', {
      opacity: 0,
      y: 20,
      duration: 0.5,
      stagger: 0.15,
      ease: 'power2.out',
      delay: 0.3,
    });
  }, []);

  const totalPrice = cartItems.reduce((sum, item) => sum + item.selectedPrice * item.quantity, 0);
  const totalDiscount = cartItems.reduce(
    (sum, item) => sum + (item.product.discount?.amount || 0) * item.quantity,
    0
  );
  const finalPrice = totalPrice - totalDiscount;

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-[#f8f5f0] to-[#ede8e3] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-[#18191a] mb-2">Order Summary</h1>
          <p className="text-[#666] font-light">Complete your purchase securely via WhatsApp</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="md:col-span-2 space-y-4">
            <div className="checkout-card bg-white rounded-2xl p-6 shadow-sm border border-[#e8e0d5]">
              <h2 className="text-2xl font-serif text-[#18191a] mb-6">Order Items</h2>

              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#999] mb-6">Your cart is empty</p>
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 bg-[#9b7a42] text-white px-6 py-3 rounded-lg hover:bg-[#7a5f34] transition-colors"
                  >
                    Continue Shopping
                    <ArrowRight size={18} />
                  </Link>
                </div>
              ) : (
                <>
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex items-start justify-between pb-4 border-b border-[#e8e0d5] last:border-b-0">
                      <div>
                        <p className="font-serif text-[#18191a]">{item.product.title}</p>
                        <p className="text-sm text-[#666]">
                          {item.size === 'sample-30ml' ? '30ml Sample' : '50ml Full'}
                        </p>
                        <p className="text-sm text-[#999]">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-serif text-[#18191a]">
                          ₹{(item.selectedPrice * item.quantity).toLocaleString()}
                        </p>
                        {item.product.discount?.percentage > 0 && (
                          <p className="text-xs text-green-600">
                            Save ₹{((item.product.discount.amount || 0) * item.quantity).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Shipping Information */}
            <div className="checkout-card bg-white rounded-2xl p-6 shadow-sm border border-[#e8e0d5]">
              <h2 className="text-2xl font-serif text-[#18191a] mb-6">Shipping Information</h2>
              <p className="text-[#666] text-sm mb-4">
                After confirming your order via WhatsApp, we will collect your shipping details
                and provide you with precise delivery timelines. We typically deliver within 3-5
                business days across India.
              </p>
              <div className="bg-[#f8f5f0] p-4 rounded-lg border-l-4 border-[#d4af37]">
                <p className="text-sm text-[#666]">
                  <strong>Free shipping</strong> on orders above ₹2000. COD available in select
                  cities.
                </p>
              </div>
            </div>

            {/* How It Works */}
            <div className="checkout-card bg-white rounded-2xl p-6 shadow-sm border border-[#e8e0d5]">
              <h2 className="text-2xl font-serif text-[#18191a] mb-6">How It Works</h2>
              <ol className="space-y-4 text-sm text-[#666]">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#d4af37] text-white rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <span>Click the WhatsApp button to send your order details</span>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#d4af37] text-white rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <span>We confirm product availability and pricing</span>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#d4af37] text-white rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <span>Share your shipping address for delivery</span>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#d4af37] text-white rounded-full flex items-center justify-center text-xs font-bold">
                    4
                  </span>
                  <span>Make payment and receive your order</span>
                </li>
              </ol>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="md:col-span-1">
            <div className="checkout-card sticky top-20 bg-white rounded-2xl p-6 shadow-sm border border-[#e8e0d5]">
              <h3 className="text-xl font-serif text-[#18191a] mb-6">Order Total</h3>

              <div className="space-y-4 mb-6 pb-6 border-b border-[#e8e0d5]">
                <div className="flex justify-between text-[#666]">
                  <span>Subtotal</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{totalDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#666] text-sm">
                  <span>Shipping</span>
                  <span>{totalPrice >= 2000 ? 'FREE' : 'Calculate at checkout'}</span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="font-serif text-lg text-[#18191a]">Total</span>
                <span className="font-serif text-2xl text-[#9b7a42]">₹{finalPrice.toLocaleString()}</span>
              </div>

              {/* WhatsApp Checkout Button */}
              {cartItems.length > 0 && (
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${generateWhatsAppMessage(cartItems)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-[#25D366] to-[#20BA5A] hover:shadow-lg hover:shadow-green-500/30 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 group"
                >
                  <MessageCircle size={20} className="group-hover:scale-110 transition-transform" />
                  Checkout via WhatsApp
                </a>
              )}

              {/* Continue Shopping */}
              <Link
                href="/shop"
                className="w-full mt-3 border-2 border-[#d4af37] text-[#9b7a42] hover:bg-[#f8f5f0] py-3 px-4 rounded-xl font-semibold transition-colors text-center"
              >
                Continue Shopping
              </Link>

              <p className="text-xs text-[#999] text-center mt-4">
                Secure & encrypted checkout. Your data is safe with us.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
