import React, { useEffect, useState } from 'react';
import { BagIcon, LogoutIcon } from './Icons';

export default function Navbar({ user, view, setView, cartCount, onCartClick, onLogout }) {
  const [logoError, setLogoError] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 18);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close the mobile menu whenever the view changes (nav link tapped)
  useEffect(() => {
    setMenuOpen(false);
  }, [view]);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const NavBtn = ({ target, label }) => (
    <button
      className={`nav-btn ${view === target ? 'active' : ''}`}
      onClick={() => setView(target)}
    >
      {label}
    </button>
  );

  const NavLinks = () => (
    <>
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
          <NavBtn target="admin-templates" label="Greeting Templates" />
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
    </>
  );

  return (
    <nav className={`navbar ${scrolled ? 'is-scrolled' : ''} ${menuOpen ? 'menu-open' : ''}`} aria-label="Primary navigation">
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

      {/* Desktop links */}
      <div className="nav-links">
        <NavLinks />
      </div>

      {/* Hamburger toggle - mobile only */}
      <button
        className={`hamburger-btn ${menuOpen ? 'is-open' : ''}`}
        onClick={() => setMenuOpen(o => !o)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Mobile dropdown */}
      <div className={`nav-links-mobile ${menuOpen ? 'open' : ''}`}>
        <NavLinks />
      </div>

      {/* Backdrop */}
      {menuOpen && <div className="nav-backdrop" onClick={() => setMenuOpen(false)} />}
    </nav>
  );
}