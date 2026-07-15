import React from 'react';
import { BagIcon, CloseIcon, TrashIcon } from './Icons';
import ImagePlaceholder from './ImagePlaceholder';

export default function CartDrawer({ cart, greetingCard, onClose, onUpdateQty, onRemove, onRemoveGreetingCard, onCheckout, checkingOut }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <>
      <div className="cart-overlay" onClick={onClose} />
      <div className="cart-drawer">
        <div className="cart-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BagIcon width={18} height={18} /> Your Cart
          </h3>
          <CloseIcon width={20} height={20} style={{ cursor: 'pointer' }} onClick={onClose} />
        </div>
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-state">
              <BagIcon width={40} height={40} strokeWidth={1.3} style={{ marginBottom: 10, opacity: 0.5 }} />
              <p>Your cart is empty.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div className="cart-item" key={item.productId}>
                <ImagePlaceholder src={item.image} alt={item.name} className="cart-thumb" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                  <div style={{ fontSize: 13, color: '#8A8390' }}>Rs. {item.price}.00</div>
                  <div className="qty-controls">
                    <button className="qty-btn" onClick={() => onUpdateQty(item.productId, item.qty - 1)}>-</button>
                    <span>{item.qty}</span>
                    <button className="qty-btn" onClick={() => onUpdateQty(item.productId, item.qty + 1)}>+</button>
                    <button
                      className="qty-btn"
                      style={{ marginLeft: 'auto', color: '#D41C4C', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => onRemove(item.productId)}
                    >
                      <TrashIcon width={14} height={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
          {greetingCard && (
            <div className="cart-greeting-card">
              <div><span>💌</span><div><strong>Digital greeting card</strong><small>{greetingCard.heading} · {greetingCard.recipient}</small></div></div>
              <button onClick={onRemoveGreetingCard} aria-label="Remove greeting card">×</button>
            </div>
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total</span>
              <span>Rs. {total}.00</span>
            </div>
            <button className="btn-primary" style={{ width: '100%' }} onClick={onCheckout} disabled={checkingOut}>
              {checkingOut ? 'Placing order…' : 'Checkout'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
