import CheckoutPageComponent from '@/components/checkout/CheckoutPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout - Sugandhink',
  description: 'Complete your perfume order via WhatsApp checkout',
};

export default function CheckoutPage() {
  return <CheckoutPageComponent />;
}
