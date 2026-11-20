'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Banner } from '@/lib/types';

interface HeroSliderProps {
  banners: Banner[];
}

export default function HeroSlider({ banners }: HeroSliderProps) {
  const activeBanners = banners && banners.length > 0 
    ? banners.filter(b => b.is_active !== false)
    : [];

  const displayBanners = activeBanners.length > 0 ? activeBanners : [
    {
      id: 'default-banner',
      title: 'Welcome to Dregital',
      subtitle: '',
      image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
      target_url: '/shop',
      button_text: '',
      display_order: 1,
      is_active: true
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const hasMultiple = displayBanners.length > 1;

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % displayBanners.length);
  }, [displayBanners.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + displayBanners.length) % displayBanners.length);
  }, [displayBanners.length]);

  // Autoplay interval
  useEffect(() => {
    if (!hasMultiple || isPaused) return;

    const timer = setInterval(() => {
      handleNext();
    }, 4500);

    return () => clearInterval(timer);
  }, [hasMultiple, isPaused, handleNext]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diffX = touchStartX.current - touchEndX.current;
      if (diffX > 45) {
        handleNext();
      } else if (diffX < -45) {
        handlePrev();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
    setIsPaused(false);
  };

  return (
    <div 
      className="w-full bg-black rounded-xl sm:rounded-3xl aspect-[16/9] relative overflow-hidden shadow-xs group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Horizontal Sliding Track */}
      <div 
        className="flex w-full h-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {displayBanners.map((banner, idx) => (
          <div key={banner.id || idx} className="w-full h-full shrink-0 relative">
            <Link 
              href={banner.target_url || '/shop'} 
              className="block w-full h-full relative focus:outline-hidden"
              tabIndex={currentIndex === idx ? 0 : -1}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={banner.image_url}
                alt={banner.title || `Dregital Banner ${idx + 1}`}
                className="w-full h-full object-contain sm:object-cover"
                loading={idx === 0 ? 'eager' : 'lazy'}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.fallback) {
                    target.dataset.fallback = 'true';
                    target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80';
                  }
                }}
              />
            </Link>
          </div>
        ))}
      </div>

      {/* Navigation Controls (Only when multiple banners exist) */}
      {hasMultiple && (
        <>
          {/* Left Arrow */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handlePrev();
            }}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 backdrop-blur-xs z-10 focus:outline-hidden"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Right Arrow */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleNext();
            }}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 backdrop-blur-xs z-10 focus:outline-hidden"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Pagination Indicator Dots */}
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full">
            {displayBanners.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full ${
                  currentIndex === idx
                    ? 'w-4 sm:w-6 h-1 sm:h-1.5 bg-white'
                    : 'w-1 sm:w-1.5 h-1 sm:h-1.5 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
