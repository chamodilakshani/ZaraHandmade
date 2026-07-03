import React from 'react';

export default function CartDrawer({ cart, onClose, onUpdateQty, onRemove, onCheckout, checkingOut }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <>
      <div className="cart-overlay" onClick={onClose} />
      <div className="cart-drawer">
        <div className="cart-header">
          <h3>Your Cart 🛍️</h3>
          <span className="close-btn" style={{ position: 'static' }} onClick={onClose}>&times;</span>
        </div>
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-state">
              <p style={{ fontSize: 36 }}>🌸</p>
              <p>Your cart is empty.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div className="cart-item" key={item.productId}>
                <img src={item.image || 'https://placehold.co/100/FCEEE9/B3355A?text=🌸'} alt={item.name} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                  <div style={{ fontSize: 13, color: '#8A7A80' }}>Rs. {item.price}.00</div>
                  <div className="qty-controls">
                    <button className="qty-btn" onClick={() => onUpdateQty(item.productId, item.qty - 1)}>-</button>
                    <span>{item.qty}</span>
                    <button className="qty-btn" onClick={() => onUpdateQty(item.productId, item.qty + 1)}>+</button>
                    <button
                      className="qty-btn"
                      style={{ marginLeft: 'auto', color: '#B3355A', border: 'none' }}
                      onClick={() => onRemove(item.productId)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))
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
