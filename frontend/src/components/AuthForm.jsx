import React, { useState, useRef, useEffect } from 'react';
import { api } from '../api';

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.06 21.06 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.06 21.06 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: '' };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ['Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Strong'];
  return { score, label: labels[score] };
}

export default function AuthForm({ onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const brandRef = useRef(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  const handlePointerMove = (e) => {
    const el = brandRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setParallax({ x, y });
  };

  const switchMode = (toRegister) => {
    if (toRegister === isRegister) return;
    setIsRegister(toRegister);
    setError('');
    setSuccess('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (isRegister) {
        await api.register(username, password, 'customer');
        setSuccess('Account created — you can sign in now.');
        setIsRegister(false);
        setPassword('');
      } else {
        const data = await api.login(username, password);
        localStorage.setItem('zara_token', data.token);
        localStorage.setItem('zara_user', JSON.stringify({ username: data.username, role: data.role }));
        onAuthSuccess({ username: data.username, role: data.role });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const strength = isRegister ? getPasswordStrength(password) : null;

  return (
    <div className="auth-page">
      {/* Brand panel */}
      <div
        className="auth-brand"
        ref={brandRef}
        onMouseMove={handlePointerMove}
        onMouseLeave={() => setParallax({ x: 0, y: 0 })}
      >
        <div
          className="auth-brand-ambient auth-brand-ambient-one"
          style={{ transform: `translate3d(${parallax.x * 18}px, ${parallax.y * 18}px, 0)` }}
        />
        <div
          className="auth-brand-ambient auth-brand-ambient-two"
          style={{ transform: `translate3d(${parallax.x * -14}px, ${parallax.y * -14}px, 0)` }}
        />
        <div className={`auth-brand-inner ${mounted ? 'is-in' : ''}`}>
          <div className="auth-brand-logo">
            <img src="/logo/logo.jpeg" alt="Zara Handmade" />
            <span>Zara <em>Handmade</em></span>
          </div>
          <h1>Flowers &amp; gifts,<br /><em>made with heart.</em></h1>
          <p>Fresh bouquets and handcrafted gifts, wrapped with care for every moment worth celebrating.</p>
          <div
            className="auth-brand-quote"
            style={{ transform: `translate3d(${parallax.x * -8}px, ${parallax.y * -8}px, 0)` }}
          >
            <span className="quote-mark" aria-hidden="true">&ldquo;</span>
            <p>The bouquet looked even softer and more beautiful in person.</p>
            <span>— A Zara customer</span>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="auth-form-side">
        <div className={`auth-card-new ${mounted ? 'is-in' : ''}`}>
          <div className="auth-tabs">
            <span className={`auth-tab-slider ${isRegister ? 'right' : ''}`} aria-hidden="true" />
            <button
              type="button"
              className={`auth-tab ${!isRegister ? 'active' : ''}`}
              onClick={() => switchMode(false)}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab ${isRegister ? 'active' : ''}`}
              onClick={() => switchMode(true)}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" key={isRegister ? 'register' : 'login'}>
            <div className="eyebrow">{isRegister ? 'Get started' : 'Welcome back'}</div>
            <h2>{isRegister ? 'Create an account' : 'Sign in to Zara'}</h2>
            <p className="auth-subtext">
              {isRegister ? 'Join to shop, save orders, and build custom bouquets.' : 'Enter your details to continue shopping.'}
            </p>

            <div className="auth-field-float">
              <input
                type="text" id="auth-username" placeholder=" " required autoComplete="username"
                value={username} onChange={(e) => setUsername(e.target.value)}
              />
              <label htmlFor="auth-username">Username</label>
            </div>

            <div className="auth-field-float has-action">
              <input
                type={showPassword ? 'text' : 'password'} id="auth-password" placeholder=" " required
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
              <label htmlFor="auth-password">Password</label>
              <button
                type="button"
                className="auth-field-action"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>

            {isRegister && password && (
              <div className="password-strength">
                <div className="password-strength-track">
                  <span className={`password-strength-fill s${strength.score}`} />
                </div>
                <span className="password-strength-label">{strength.label}</span>
              </div>
            )}

            {error && <p className="auth-message error">{error}</p>}
            {success && <p className="auth-message success">{success}</p>}

            <button className="btn-primary auth-submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : isRegister ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <p className="auth-toggle">
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <span onClick={() => switchMode(!isRegister)}>{isRegister ? 'Log in' : 'Register'}</span>
          </p>
        </div>
      </div>
    </div>
  );
}