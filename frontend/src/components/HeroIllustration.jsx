import React from 'react';

// Original hand-built illustration — safe to use, no stock/licensed imagery.
export default function HeroIllustration() {
  return (
    <svg viewBox="0 0 480 480" className="hero-illustration" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="petalGrad" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#FF7A9C" />
          <stop offset="100%" stopColor="#D41C4C" />
        </radialGradient>
        <radialGradient id="petalGrad2" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#FFD873" />
          <stop offset="100%" stopColor="#FFC53D" />
        </radialGradient>
      </defs>

      <g className="float-slow">
        <circle cx="240" cy="240" r="150" fill="#1F1B26" opacity="0.4" />
      </g>

      {/* Main flower */}
      <g className="float-med" style={{ transformOrigin: '240px 220px' }}>
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <ellipse
            key={deg}
            cx="240" cy="150" rx="42" ry="70"
            fill="url(#petalGrad)"
            transform={`rotate(${deg} 240 220)`}
            opacity="0.95"
          />
        ))}
        <circle cx="240" cy="220" r="34" fill="#FFC53D" />
      </g>

      {/* Small accent flower */}
      <g className="float-fast" style={{ transformOrigin: '360px 340px' }}>
        {[0, 72, 144, 216, 288].map((deg) => (
          <ellipse
            key={deg}
            cx="360" cy="300" rx="20" ry="34"
            fill="url(#petalGrad2)"
            transform={`rotate(${deg} 360 340)`}
          />
        ))}
        <circle cx="360" cy="340" r="14" fill="#FF3B6B" />
      </g>

      {/* Leaves */}
      <path className="float-slow" d="M120 380 Q100 320 150 290 Q180 340 150 390 Z" fill="#2E8B57" opacity="0.85" />
      <path className="float-med" d="M380 120 Q420 100 430 150 Q390 170 370 140 Z" fill="#2E8B57" opacity="0.7" />

      {/* Dots */}
      <circle className="float-fast" cx="90" cy="120" r="6" fill="#FFC53D" />
      <circle className="float-slow" cx="420" cy="380" r="8" fill="#FF3B6B" />
      <circle className="float-med" cx="60" cy="300" r="5" fill="#FFFFFF" opacity="0.6" />
    </svg>
  );
}
