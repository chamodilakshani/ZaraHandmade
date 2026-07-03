import React from 'react';

export default function Navbar({ user, view, setView, cartCount, onCartClick, onLogout }) {
  const NavBtn = ({ target, label }) => (
    <button
      className={`nav-btn ${view === target ? 'active' : ''}`}
      onClick={() => setView(target)}
    >
      {label}
    </button>
  );

  return (
    <nav className="navbar">
      <div className="logo">🌸 Zara Handmade</div>
      <div className="nav-links">
        {user.role === 'customer' && (
          <>
            <NavBtn target="shop" label="Shop" />
            <NavBtn target="custom" label="Custom Bouquet" />
            <NavBtn target="orders" label="My Orders" />
          </>
        )}
        {user.role === 'admin' && (
          <>
            <NavBtn target="admin-orders" label="Orders" />
            <NavBtn target="admin-products" label="Products" />
          </>
        )}
        {user.role === 'customer' && (
          <button className="cart-btn" onClick={onCartClick}>
            🛍️ Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        )}
        <button className="nav-btn" onClick={onLogout}>Logout</button>
      </div>
    </nav>
  );
}
