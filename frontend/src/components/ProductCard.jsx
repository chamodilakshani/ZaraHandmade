import React from 'react';
import ImagePlaceholder from './ImagePlaceholder';
import { BagIcon, SparkleIcon } from './Icons';

export default function ProductCard({ product, onClick }) {
  return (
    <article
      className="card product-card reveal-card"
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View ${product.name}`}
    >
      <div className="product-badge">Handmade</div>
      <span
        className="wishlist-btn"
        aria-hidden="true"
      >
        <SparkleIcon width={16} height={16} />
      </span>
      <div className="product-image-wrap">
        <ImagePlaceholder
          src={product.image}
          alt={product.name}
          className="product-image"
        />
      </div>
      <div className="product-body">
        <div className="product-meta-row">
          <span>{product.category || 'Flower Bouquet'}</span>
          {product.productType && <span>{product.productType}</span>}
        </div>
        <div className="rating-row" aria-label="Rated 4.9 out of 5">
          <span>5/5</span>
          <small>4.9</small>
        </div>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-footer">
          <div className="gift-tag">Rs. {product.price}.00</div>
          <span className="quick-view"><BagIcon width={15} height={15} /> Quick view</span>
        </div>
      </div>
    </article>
  );
}
