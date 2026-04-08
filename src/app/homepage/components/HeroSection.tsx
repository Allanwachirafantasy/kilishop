'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

const heroSlides = [
{
  id: 1,
  badge: '🔥 Flash Sale — Up to 60% Off',
  headline: 'Shop Africa\'s',
  headlineAccent: 'Best Deals',
  subheadline: 'Today Only',
  description: 'Thousands of products from top brands. Delivered fast across Kenya, Nigeria & Ghana.',
  cta: 'Shop Flash Deals',
  ctaHref: '/product-listing?filter=deals',
  secondaryCta: 'Browse Categories',
  secondaryHref: '/product-listing',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1aba4c335-1772227833877.png",
  imageAlt: 'Shopping bags and electronics on dark surface with warm orange accent lighting, moody studio product photography',
  stat1: { value: '2M+', label: 'Happy Buyers' },
  stat2: { value: '50K+', label: 'Products' },
  floatingBadge: { icon: '⭐', title: '4.9/5 Rating', sub: '120K+ Reviews' },
  accentColor: '#FF6B2B'
},
{
  id: 2,
  badge: '✨ New Arrivals — Fashion Week',
  headline: 'African Fashion',
  headlineAccent: 'Reimagined',
  subheadline: 'Ankara. Kente. Batik.',
  description: 'Celebrate African heritage with modern fashion. Shop authentic prints and contemporary styles.',
  cta: 'Explore Fashion',
  ctaHref: '/product-listing?category=fashion',
  secondaryCta: 'View Lookbook',
  secondaryHref: '/product-listing',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_192302f68-1775234675002.png",
  imageAlt: 'Colorful African fabric patterns and fashion items arranged on dark background with dramatic lighting',
  stat1: { value: '3.5K+', label: 'Fashion Items' },
  stat2: { value: 'Free', label: 'Returns' },
  floatingBadge: { icon: '🏆', title: 'Top Rated', sub: 'Fashion Store' },
  accentColor: '#EC4899'
}];


const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        setIsTransitioning(false);
      }, 300);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (idx: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(idx);
      setIsTransitioning(false);
    }, 200);
  };

  const slide = heroSlides[currentSlide];

  return (
    <section className="relative overflow-hidden min-h-[85vh] sm:min-h-[75vh] md:min-h-[80vh] flex items-center">
      {/* Atmospheric background blobs */}
      <div className="hero-blob-1 top-[-100px] left-[-100px] opacity-60" aria-hidden="true" />
      <div className="hero-blob-2 bottom-[-50px] right-[10%] opacity-40" aria-hidden="true" />
      <div
        className="absolute top-[30%] right-[5%] w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'rgba(255,184,0,0.08)', filter: 'blur(80px)' }}
        aria-hidden="true" />
      

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }}
        aria-hidden="true" />
      

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16 w-full relative z-10">
        <div className={`grid md:grid-cols-2 gap-8 md:gap-12 items-center transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {/* Left: Content */}
          <div className="space-y-6 order-2 md:order-1">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm animate-fade-in">
              <span className="flex h-2 w-2 rounded-full bg-primary pulse-dot" aria-hidden="true" />
              <span className="text-xs font-medium text-kili-fg tracking-wide">{slide.badge}</span>
            </div>

            {/* Headline */}
            <div className="space-y-1">
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.1] tracking-tight text-kili-fg">
                {slide.headline}{' '}
                <span className="gradient-text">{slide.headlineAccent}</span>
              </h1>
              <p className="text-2xl sm:text-3xl font-display text-kili-muted font-normal italic">
                {slide.subheadline}
              </p>
            </div>

            {/* Description */}
            <p className="text-base sm:text-lg text-kili-muted max-w-md leading-relaxed">
              {slide.description}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-6">
              <div>
                <div className="text-2xl font-bold text-kili-fg">{slide.stat1.value}</div>
                <div className="text-xs text-kili-subtle uppercase tracking-wider">{slide.stat1.label}</div>
              </div>
              <div className="w-px h-10 bg-kili-border" aria-hidden="true" />
              <div>
                <div className="text-2xl font-bold text-kili-fg">{slide.stat2.value}</div>
                <div className="text-xs text-kili-subtle uppercase tracking-wider">{slide.stat2.label}</div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col xs:flex-row gap-3">
              <Link href={slide.ctaHref} className="btn-primary">
                {slide.cta}
                <Icon name="ArrowRightIcon" size={16} />
              </Link>
              <Link href={slide.secondaryHref} className="btn-secondary">
                {slide.secondaryCta}
              </Link>
            </div>

            {/* Slide indicators */}
            <div className="flex items-center gap-2 pt-2" role="tablist" aria-label="Hero slides">
              {heroSlides.map((_, idx) =>
              <button
                key={idx}
                role="tab"
                aria-selected={idx === currentSlide}
                aria-label={`Slide ${idx + 1}`}
                onClick={() => goToSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'w-8 bg-primary' : 'w-3 bg-kili-subtle hover:bg-kili-muted'}`
                } />

              )}
            </div>
          </div>

          {/* Right: Hero image */}
          <div className="relative order-1 md:order-2 group">
            {/* Glow behind image */}
            <div
              className="absolute inset-0 rounded-xl transition-all duration-700 group-hover:blur-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255,107,43,0.2) 0%, rgba(255,184,0,0.1) 100%)',
                filter: 'blur(40px)',
                transform: 'scale(0.9)'
              }}
              aria-hidden="true" />
            

            {/* Main image */}
            <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-card-hover">
              <AppImage
                src={slide.image}
                alt={slide.imageAlt}
                width={640}
                height={480}
                priority
                className="w-full object-cover aspect-[4/3] sm:aspect-[16/10] transition-all duration-700 group-hover:scale-[1.02]" />
              
              {/* Scrim for any text overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-kili-bg/30 via-transparent to-transparent pointer-events-none" aria-hidden="true" />
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 sm:bottom-6 sm:left-6 glass rounded-xl p-3 shadow-xl float-anim">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg">
                  {slide.floatingBadge.icon}
                </div>
                <div>
                  <div className="text-sm font-semibold text-kili-fg">{slide.floatingBadge.title}</div>
                  <div className="text-xs text-kili-subtle">{slide.floatingBadge.sub}</div>
                </div>
              </div>
            </div>

            {/* Delivery badge */}
            <div className="absolute -top-3 -right-3 sm:top-4 sm:right-4 glass rounded-full px-3 py-1.5 shadow-xl">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">🚚</span>
                <span className="text-xs font-medium text-kili-fg">Fast Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);

};

export default HeroSection;