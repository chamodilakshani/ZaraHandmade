import React, { useEffect, useState } from 'react';
import { BagIcon, LogoutIcon } from './Icons';

export default function Navbar({ user, view, setView, cartCount, onCartClick, onLogout }) {
  const [logoError, setLogoError] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 18);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NavBtn = ({ target, label }) => (
    <button
      className={`nav-btn ${view === target ? 'active' : ''}`}
      onClick={() => setView(target)}
    >
      {label}
    </button>
  );

  return (
    <nav className={`navbar ${scrolled ? 'is-scrolled' : ''}`} aria-label="Primary navigation">
      <div className="logo">
        {!logoError && (
          <img
            src="/logo/logo.jpeg"
            alt="Zara Handmade"
            className="logo-img"
            onError={() => setLogoError(true)}
          />
        )}
        <span className="logo-text">Zara <span>Handmade</span></span>
      </div>
      <div className="nav-links">
        {user.role === 'customer' && (
          <>
            <NavBtn target="shop" label="Home" />
            <NavBtn target="products" label="Products" />
            <NavBtn target="custom" label="Custom Bouquet" />
            <NavBtn target="greeting-card" label="Greeting Card" />
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
          <button className="cart-btn magnetic-btn" onClick={onCartClick} aria-label={`Open cart with ${cartCount} items`}>
            <BagIcon size={16} />
            Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        )}
        <button className="nav-btn logout-btn" onClick={onLogout}>
          <LogoutIcon size={15} /> Logout
        </button>
      </div>
    </nav>
  );
}
