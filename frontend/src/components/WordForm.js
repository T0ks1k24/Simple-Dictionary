import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const WordForm = ({ word, onClose, onSave }) => {
  const [form, setForm] = useState({ word: '', translation: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (word) setForm({ word: word.word, translation: word.translation });
  }, [word]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (word) await api.words.update(word.id, form);
      else await api.words.create(form);
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <h2 className="t-title">{word ? 'Edit term' : 'Add new term'}</h2>
            <p>{word ? 'Update the lexical entry' : 'Add a term to your lexicon'}</p>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit}>
          {/* Term */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="field-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              Original term
            </label>
            <input
              className="input-field"
              value={form.word}
              onChange={set('word')}
              placeholder="Word or phrase…"
              required autoFocus
            />
          </div>

          {/* Translation */}
          <div style={{ marginBottom: '2rem' }}>
            <label className="field-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m5 8 6 6 6-6"/></svg>
              Translation / Meaning
            </label>
            <input
              className="input-field"
              value={form.translation}
              onChange={set('translation')}
              placeholder="Translation or meaning…"
              required
            />
          </div>

          {error && (
            <div style={{
              padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem',
              background: 'var(--bad-soft)', border: '1px solid rgba(248,113,113,0.2)',
              color: 'var(--bad)', fontSize: '0.875rem', fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg className="spin-anim" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  Saving…
                </span>
              ) : word ? 'Save changes' : 'Add term'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WordForm;
