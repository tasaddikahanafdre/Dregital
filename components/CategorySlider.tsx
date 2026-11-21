'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Category } from '@/lib/types';
import { getCategoryIconUrl } from '@/lib/categoryIcons';

interface CategorySliderProps {
  categories: Category[];
}

export default function CategorySlider({ categories }: CategorySliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Duplicate categories 4 times to ensure seamless infinite looping on all screens
  const duplicatedCategories = [
    ...categories,
    ...categories,
    ...categories,
    ...categories
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container || categories.length === 0) return;

    // Start auto-scroll at single set width
    const singleSetWidth = container.scrollWidth / 4;
    if (container.scrollLeft === 0) {
      container.scrollLeft = singleSetWidth;
    }

    let lastTimestamp = performance.now();
    const speed = 0.65; // Constant smooth pixels per frame (~40px/sec)

    // Continuous unstoppable animation loop (never pauses on hover or touch)
    const step = (timestamp: number) => {
      const delta = Math.min(timestamp - lastTimestamp, 50); // Cap frame delta to prevent sudden jumps
      lastTimestamp = timestamp;

      if (container) {
        container.scrollLeft += speed * (delta / 16.67);

        // Infinite wrap
        if (container.scrollLeft >= singleSetWidth * 2) {
          container.scrollLeft -= singleSetWidth;
        } else if (container.scrollLeft <= 0) {
          container.scrollLeft += singleSetWidth;
        }
      }

      animFrameIdRef.current = requestAnimationFrame(step);
    };

    animFrameIdRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [categories]);

  const handleManualNav = (direction: 'left' | 'right') => {
    const container = containerRef.current;
    if (!container) return;
    const scrollAmount = 260;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative w-full group/slider select-none">
      {/* Navigation Arrow Left */}
      <button
        onClick={() => handleManualNav('left')}
        aria-label="Scroll left"
        className="hidden sm:flex absolute -left-3 lg:-left-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white border border-neutral-300 shadow-md items-center justify-center text-black hover:bg-black hover:text-white hover:border-black transition-all opacity-0 group-hover/slider:opacity-100 focus:opacity-100"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Navigation Arrow Right */}
      <button
        onClick={() => handleManualNav('right')}
        aria-label="Scroll right"
        className="hidden sm:flex absolute -right-3 lg:-right-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white border border-neutral-300 shadow-md items-center justify-center text-black hover:bg-black hover:text-white hover:border-black transition-all opacity-0 group-hover/slider:opacity-100 focus:opacity-100"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slider Scroll Track */}
      <div
        ref={containerRef}
        className="w-full flex items-center gap-6 sm:gap-10 md:gap-12 overflow-x-auto no-scrollbar py-2 cursor-grab active:cursor-grabbing"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {duplicatedCategories.map((cat, index) => (
          <Link
            key={`${cat.id}-${index}`}
            href={`/category/${cat.slug}`}
            className="group flex flex-col items-center shrink-0 text-center transition-transform hover:scale-105 duration-200"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-neutral-100 overflow-hidden relative border-2 border-neutral-900 shadow-xs flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getCategoryIconUrl(cat)}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.fallback) {
                    target.dataset.fallback = 'true';
                    target.src = '/icons/categories/other.svg';
                  }
                }}
              />
            </div>
            <span className="text-xs sm:text-sm font-bold text-black uppercase tracking-wider mt-3 group-hover:underline">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
