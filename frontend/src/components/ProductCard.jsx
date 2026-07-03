import React from 'react';

export default function ProductCard({ product, onClick }) {
  return (
    <div className="card product-card" onClick={onClick}>
      <img
        src={product.image || 'https://placehold.co/400x300/FCEEE9/B3355A?text=🌸'}
        alt={product.name}
        className="product-image"
      />
      <div className="product-body">
        <h3 className="product-name">{product.name}</h3>
        <div className="gift-tag">Rs. {product.price}.00</div>
      </div>
    </div>
  );
}
