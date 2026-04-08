import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from './components/HeroSection';
import CategorySection from './components/CategorySection';
import FeaturedProducts from './components/FeaturedProducts';
import FlashDeals from './components/FlashDeals';
import TrustSection from './components/TrustSection';

export const metadata: Metadata = {
  title: 'KiliShop — Africa\'s Premier Online Marketplace',
  description: 'Shop thousands of products at unbeatable prices. Fast delivery across Kenya, Nigeria & Ghana. Electronics, Fashion, Home & more.',
};

export default function HomepagePage() {
  return (
    <div className="min-h-screen flex flex-col bg-kili-bg">
      <Header />

      <main className="flex-1">
        <HeroSection />
        <CategorySection />
        <FlashDeals />
        <FeaturedProducts />
        <TrustSection />
      </main>

      <Footer />
    </div>
  );
}