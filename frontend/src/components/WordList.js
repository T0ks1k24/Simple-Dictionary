import React from 'react';
import { api } from '../services/api';

const WordList = ({ words, onEdit, onDelete }) => {
  const del = async (id) => {
    if (!window.confirm('Remove this term?')) return;
    try { await api.words.delete(id); onDelete(); }
    catch (e) { alert(e.message); }
  };

  if (words.length === 0) {
    return (
      <div className="tbl-wrap">
        <div className="empty">
          <div className="empty-icon">🔖</div>
          <p>Your lexicon is empty — add your first term!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tbl-wrap fade-in">
      <table className="tbl">
        <thead>
          <tr>
            <th>Term</th>
            <th>Translation</th>
            <th>Mastery</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {words.map(w => (
            <tr key={w.id}>
              <td className="tbl-word">{w.word}</td>
              <td className="tbl-trans">{w.translation}</td>
              <td>
                <div className="score-badge">
                  <span className="sc-ok">✓ {w.correct_answers ?? 0}</span>
                  <span style={{ color: 'var(--border)' }}>|</span>
                  <span className="sc-er">✗ {w.incorrect_answers ?? 0}</span>
                </div>
              </td>
              <td className="tbl-actions">
                <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                  <button className="btn-icon" onClick={() => onEdit(w)} title="Edit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
                  </button>
                  <button className="btn-icon btn-danger" onClick={() => del(w.id)} title="Delete">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WordList;
