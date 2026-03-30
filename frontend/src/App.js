import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import Auth from './components/Auth';
import WordList from './components/WordList';
import WordForm from './components/WordForm';
import Game from './components/Game';
import './index.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [words, setWords] = useState([]);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editWord, setEditWord] = useState(null);
  const [gaming, setGaming] = useState(false);
  const [gameCount, setGameCount] = useState(10);
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  /* apply theme */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  /* load words */
  const load = useCallback(async (q = '') => {
    try {
      const data = await api.words.getAll(q);
      setWords(data);
    } catch (e) { console.error(e); }
  }, []);

  /* boot */
  useEffect(() => {
    const u = localStorage.getItem('user');
    const t = localStorage.getItem('token');
    if (u && t) { setUser(JSON.parse(u)); load(); }
    setReady(true);
  }, [load]);

  /* debounced search */
  useEffect(() => {
    if (!user) return;
    const id = setTimeout(() => load(search), 300);
    return () => clearTimeout(id);
  }, [search, user, load]);

  const handleLogin = () => { setUser(JSON.parse(localStorage.getItem('user'))); load(); };
  const handleLogout = () => { api.auth.logout(); setUser(null); setWords([]); };
  const openEdit = (w) => { setEditWord(w); setFormOpen(true); };
  const openAdd = () => { setEditWord(null); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditWord(null); };

  if (!ready) return null;
  if (!user) return <Auth onLogin={handleLogin} theme={theme} onToggle={toggleTheme} />;

  return (
    <div className="app" data-theme={theme}>
      {/* NAV */}
      <nav className="nav">
        <div className="container nav-inner">
          <div className="nav-brand">
            <div className="brand-logo">📖</div>
            <span>Lexicon</span>
          </div>

          <div className="nav-right">
            {!gaming ? (
              <div className="game-ctrl">
                <span className="game-ctrl-label">Play</span>
                <input
                  type="number"
                  value={gameCount}
                  min="1"
                  onChange={e => setGameCount(Math.max(1, +e.target.value))}
                />
                <button
                  className="btn btn-primary"
                  style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem', borderRadius: '8px' }}
                  onClick={() => setGaming(true)}
                  disabled={words.length < 4}
                >
                  Start
                </button>
              </div>
            ) : (
              <button className="btn btn-ghost" style={{ fontSize: '0.82rem' }} onClick={() => setGaming(false)}>
                ← Exit game
              </button>
            )}

            <button className="btn-icon" onClick={toggleTheme} title="Toggle theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button className="btn btn-ghost" style={{ fontSize: '0.82rem' }} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="main">
        <div className="container">
          {gaming ? (
            <Game count={gameCount} onFinish={() => { setGaming(false); load(search); }} />
          ) : (
            <div className="fade-in">
              {/* Page header */}
              <div className="page-header">
                <div>
                  <h1 className="t-display gradient-text" style={{ fontSize: '2.25rem' }}>My Lexicon</h1>
                  <p>{words.length} {words.length === 1 ? 'term' : 'terms'} in your collection</p>
                </div>
                <div className="page-tools">
                  <div className="search-wrap">
                    <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <input
                      placeholder="Search…"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                  <button className="btn btn-primary" style={{ fontSize: '0.9rem' }} onClick={openAdd}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5v14"/></svg>
                    Add term
                  </button>
                </div>
              </div>

              <WordList words={words} onEdit={openEdit} onDelete={() => load(search)} />
            </div>
          )}
        </div>
      </main>

      {/* MODAL */}
      {formOpen && (
        <WordForm word={editWord} onClose={closeForm} onSave={() => { load(search); closeForm(); }} />
      )}
    </div>
  );
}
