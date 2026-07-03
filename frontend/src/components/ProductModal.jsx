import React from 'react';

export default function ProductModal({ product, onClose, onAddToCart }) {
  if (!product) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close-btn" onClick={onClose}>&times;</span>
        <img
          src={product.image || 'https://placehold.co/400x300/FCEEE9/B3355A?text=🌸'}
          style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 14 }}
          alt={product.name}
        />
        <h2 style={{ marginTop: 16, color: '#8F2A48' }}>{product.name}</h2>
        <p style={{ color: '#5A4B50', fontSize: 14, lineHeight: 1.5 }}>{product.desc || 'A beautifully handmade piece from Zara.'}</p>
        <div className="gift-tag" style={{ fontSize: 16, margin: '10px 0 18px' }}>Rs. {product.price}.00</div>
        <button className="btn-primary" style={{ width: '100%' }} onClick={() => onAddToCart(product)}>
          Add to Cart 🛍️
        </button>
      </div>
    </div>
  );
}
