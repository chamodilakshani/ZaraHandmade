import React from 'react';
import { BagIcon, CloseIcon } from './Icons';
import ImagePlaceholder from './ImagePlaceholder';

export default function ProductModal({ product, onClose, onAddToCart }) {
  if (!product) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <CloseIcon className="close-btn" width={22} height={22} onClick={onClose} />
        <ImagePlaceholder
          src={product.image}
          alt={product.name}
          className="modal-image"
        />
        <h2 style={{ marginTop: 18, fontSize: 24 }}>{product.name}</h2>
        <p style={{ color: '#8A8390', fontSize: 14, lineHeight: 1.6, marginTop: 8 }}>{product.desc || 'A beautifully handmade piece from Zara.'}</p>
        <div className="gift-tag" style={{ fontSize: 16, margin: '14px 0 20px' }}>Rs. {product.price}.00</div>
        <button className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={() => onAddToCart(product)}>
          <BagIcon width={16} height={16} strokeWidth={2.4} /> Add to Cart
        </button>
      </div>
    </div>
  );
}
