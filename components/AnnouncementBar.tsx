'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AnnouncementBarProps {
  text?: string;
  enabled?: boolean;
}

export default function AnnouncementBar({
  text = '⚡ FREE DELIVERY in Dhaka on orders above ৳3,000! Official brand warranty on all genuine tech items.',
  enabled = true
}: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!enabled || !isVisible) return null;

  return (
    <div className="bg-[#0A0A0A] text-white text-xs sm:text-sm font-medium py-2 px-4 transition-all border-b border-neutral-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 text-center truncate pr-2">
          <span>{text}</span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-neutral-400 hover:text-white transition-colors p-1"
          aria-label="Close announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
