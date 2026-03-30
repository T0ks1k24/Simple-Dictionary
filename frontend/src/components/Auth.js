import React, { useState } from 'react';
import { api } from '../services/api';

const Auth = ({ onLogin, theme, onToggle }) => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'login') {
        await api.auth.login(form.username, form.password);
      } else {
        await api.auth.register(form.username, form.email, form.password);
        await api.auth.login(form.username, form.password);
      }
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" data-theme={theme}>
      <div className="auth-card fade-in">
        {/* Logo */}
        <div className="auth-logo">📖</div>

        {/* Heading */}
        <h1 className="auth-title t-display gradient-text">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="auth-sub">
          {mode === 'login'
            ? 'Sign in to continue to your Lexicon'
            : 'Start building your vocabulary today'}
        </p>

        {/* Form */}
        <form onSubmit={submit}>
          <div style={{ marginBottom: '1rem' }}>
            <div className="field-label">Username</div>
            <input
              className="input-field"
              value={form.username}
              onChange={set('username')}
              placeholder="Enter username"
              required autoFocus
            />
          </div>

          {mode === 'register' && (
            <div style={{ marginBottom: '1rem' }}>
              <div className="field-label">Email</div>
              <input
                className="input-field"
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="Enter email"
                required
              />
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <div className="field-label">Password</div>
            <input
              className="input-field"
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <div style={{
              padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)',
              background: 'var(--bad-soft)', border: '1px solid rgba(248,113,113,0.2)',
              color: 'var(--bad)', fontSize: '0.875rem', fontWeight: 500,
              marginBottom: '1.25rem',
            }}>
              {error}
            </div>
          )}

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '0.8rem' }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg className="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                Loading…
              </span>
            ) : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="divider-text">
          {mode === 'login' ? 'No account yet?' : 'Already have one?'}
        </div>

        <button
          className="btn btn-ghost"
          style={{ width: '100%', padding: '0.8rem' }}
          onClick={() => { setMode(m => (m === 'login' ? 'register' : 'login')); setError(''); }}
        >
          {mode === 'login' ? 'Create account' : 'Back to sign in'}
        </button>

        {/* Theme toggle */}
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
          <button className="btn-icon" onClick={onToggle} title="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
