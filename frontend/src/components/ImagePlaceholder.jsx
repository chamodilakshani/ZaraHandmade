import React, { useState } from 'react';
import { ImagePlaceholderIcon } from './Icons';

export default function ImagePlaceholder({ src, alt, className, style }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`${className || ''} image-placeholder`}
        style={style}
      >
        <ImagePlaceholderIcon />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setFailed(true)}
    />
  );
}
