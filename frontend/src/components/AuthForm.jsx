import React, { useState } from 'react';
import { api } from '../api';
import logoIcon from '../assets/logo-icon.svg';

export default function AuthForm({ onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await api.register(username, password, role);
        setIsRegister(false);
        setError('Registered! You can log in now.');
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

  return (
    <div className="auth-wrap">
      <form onSubmit={handleSubmit} className="card auth-card">
        <div className="eyebrow">Welcome</div>
        <img src={logoIcon} alt="" style={{ width: 40, height: 40, margin: '10px 0' }} />
        <h2 style={{ margin: '0 0 22px' }}>{isRegister ? 'Create an account' : 'Sign in to Zara'}</h2>
        <input
          type="text" placeholder="Username" required
          value={username} onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password" placeholder="Password" required
          value={password} onChange={(e) => setPassword(e.target.value)}
        />
        {isRegister && (
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
        )}
        {error && <p style={{ color: '#B3355A', fontSize: 13, marginTop: -4 }}>{error}</p>}
        <button className="btn-primary" style={{ width: '100%', marginTop: 6 }} disabled={loading}>
          {loading ? 'Please wait…' : isRegister ? 'Sign Up' : 'Sign In'}
        </button>
        <p
          onClick={() => { setIsRegister(!isRegister); setError(''); }}
          style={{ marginTop: 16, fontSize: 13, color: '#8A7A80', cursor: 'pointer' }}
        >
          {isRegister ? 'Already have an account? Log in' : "Don't have an account? Register"}
        </p>
      </form>
    </div>
  );
}
