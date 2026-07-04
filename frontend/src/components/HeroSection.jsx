import React from 'react';
import { FlowerIcon } from './icons';

export default function HeroSection() {
  return (
    <div className="hero-container">
      {/* Animated SVG Background - Floating Petals */}
      <svg className="floating-petals" viewBox="0 0 400 400" preserveAspectRatio="none">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Floating petals - will be animated */}
        <circle cx="50" cy="100" r="3" fill="rgba(179, 53, 90, 0.4)" filter="url(#glow)" className="petal" />
        <circle cx="350" cy="150" r="2.5" fill="rgba(199, 154, 70, 0.3)" filter="url(#glow)" className="petal" />
        <circle cx="100" cy="300" r="3" fill="rgba(179, 53, 90, 0.3)" filter="url(#glow)" className="petal" />
        <circle cx="300" cy="350" r="2" fill="rgba(199, 154, 70, 0.4)" filter="url(#glow)" className="petal" />
        <circle cx="200" cy="50" r="2.5" fill="rgba(179, 53, 90, 0.25)" filter="url(#glow)" className="petal" />
      </svg>

      {/* Hero Content */}
      <div className="hero-content">
        <div className="hero-text">
          <p className="eyebrow hero-eyebrow">Handcrafted Flowers & Gifts</p>
          <h1 className="hero-title">Elegance in Every Bloom</h1>
          <p className="hero-subtitle">Curated bouquets and custom arrangements for life's most meaningful moments</p>
          <button className="btn-primary hero-btn">Explore Collection</button>
        </div>

        {/* Image container with animation */}
        <div className="hero-image">
          <img src="/images/hero-bouquet.png" alt="Premium Bouquet" className="hero-img" />
          {/* Fallback: A subtle placeholder gradient if image hasn't loaded */}
          <div className="image-placeholder" />
        </div>
      </div>
    </div>
  );
}
