import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const Game = ({ count, onFinish }) => {
  const [words, setWords] = useState([]);
  const [idx, setIdx] = useState(0);
  const [test, setTest] = useState(null);
  const [phase, setPhase] = useState('play'); // play | feedback | done
  const [input, setInput] = useState('');
  const [chosen, setChosen] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [hints, setHints] = useState(0);
  const [score, setScore] = useState({ ok: 0, err: 0 });
  const [loading, setLoading] = useState(true);

  /* Build a single test from an array + index */
  const buildTest = useCallback((all, i) => {
    const w = all[i];
    const forward = Math.random() > 0.5;       // EN→UA or UA→EN
    const spell   = Math.random() > 0.5;       // choice or spell
    const q = forward ? w.word : w.translation;
    const a = forward ? w.translation : w.word;
    let opts = [];
    if (!spell) {
      const pool = all
        .filter((_, j) => j !== i)
        .map(x => forward ? x.translation : x.word)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      opts = [a, ...pool].sort(() => Math.random() - 0.5);
    }
    return { w, q, a, opts, spell, forward };
  }, []);

  /* Load words */
  useEffect(() => {
    (async () => {
      try {
        const data = await api.words.play(count);
        if (data.length < 4) { alert('Need at least 4 words'); onFinish(); return; }
        setWords(data);
        setTest(buildTest(data, 0));
      } catch (e) { alert(e.message); onFinish(); }
      finally { setLoading(false); }
    })();
  }, [count, buildTest, onFinish]);

  /* Answer logic */
  const answer = async (pick) => {
    const ans = test.spell ? input.trim() : pick;
    const ok  = ans.toLowerCase() === test.a.toLowerCase();

    setChosen(ans);
    setIsCorrect(ok);
    setPhase('feedback');
    setScore(s => ({ ok: ok ? s.ok + 1 : s.ok, err: ok ? s.err : s.err + 1 }));

    try {
      await api.words.update(test.w.id, {
        times_played:     (test.w.times_played     || 0) + 1,
        correct_answers:  (test.w.correct_answers   || 0) + (ok ? 1 : 0),
        incorrect_answers:(test.w.incorrect_answers || 0) + (ok ? 0 : 1),
      });
    } catch (e) { /* non-blocking */ }
  };

  const next = () => {
    const ni = idx + 1;
    if (ni < words.length) {
      setIdx(ni);
      setTest(buildTest(words, ni));
      setInput(''); setChosen(null); setIsCorrect(null); setHints(0); setPhase('play');
    } else {
      setPhase('done');
    }
  };

  /* ============================================================= */
  if (loading) return (
    <div className="game-wrap fade-in" style={{ textAlign: 'center', color: 'var(--text-3)', paddingTop: '6rem' }}>
      Preparing session…
    </div>
  );

  /* DONE */
  if (phase === 'done') return (
    <div className="card game-wrap game-done fade-in">
      <span className="game-done-icon">{score.err === 0 ? '🏆' : '📈'}</span>
      <h2 className="t-display">Session complete</h2>
      <p>You trained {words.length} terms this round.</p>
      <div className="result-grid">
        <div className="result-card">
          <div className="result-card-val">{words.length}</div>
          <div className="result-card-label">Total</div>
        </div>
        <div className="result-card" style={{ borderColor: 'var(--good-soft)' }}>
          <div className="result-card-val" style={{ color: 'var(--good)' }}>{score.ok}</div>
          <div className="result-card-label">Correct</div>
        </div>
        <div className="result-card" style={{ borderColor: 'var(--bad-soft)' }}>
          <div className="result-card-val" style={{ color: 'var(--bad)' }}>{score.err}</div>
          <div className="result-card-label">Missed</div>
        </div>
      </div>
      <button className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }} onClick={onFinish}>
        Back to collection
      </button>
    </div>
  );

  const progress = ((idx + 1) / words.length) * 100;
  const hintText = test
    ? test.a.split('').map((c, i) => c === ' ' ? ' ' : i < hints ? c : '·').join('')
    : '';

  return (
    <div className="game-wrap fade-in">
      {/* Progress bar */}
      <div className="game-progress">
        <div className="game-progress-bar" style={{ width: `${progress}%` }} />
      </div>

      {/* Meta */}
      <div className="game-meta">
        <span>{idx + 1} / {words.length}</span>
        <span style={{ color: 'var(--accent)' }}>{test.forward ? 'Term → Translation' : 'Translation → Term'}</span>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <span className="chip chip-good">✓ {score.ok}</span>
          <span className="chip chip-bad">✗ {score.err}</span>
        </div>
      </div>

      {/* Question */}
      <div className="game-q">{test.q}</div>
      <p className="game-q-hint">
        {test.spell ? 'Write the translation' : 'Choose the correct translation'}
      </p>

      {/* Feedback */}
      {phase === 'feedback' && (
        <div className={`game-feedback fade-in ${isCorrect ? 'ok' : 'err'}`}>
          <div className={`feedback-title ${isCorrect ? 'ok' : 'err'}`}>
            {isCorrect ? 'Correct! 🎉' : 'Not quite…'}
          </div>
          {!isCorrect && (
            <div style={{ fontSize: '0.9rem', color: 'var(--text-2)', marginTop: '0.25rem' }}>
              You said: <strong style={{ color: 'var(--bad)' }}>{chosen || '(empty)'}</strong>
              {'  ·  '}
              Answer: <strong style={{ color: 'var(--good)' }}>{test.a}</strong>
            </div>
          )}
        </div>
      )}

      {/* Choice buttons */}
      {!test.spell && (
        <div className="choice-grid">
          {test.opts.map((opt, i) => {
            let cls = 'choice-btn';
            if (phase === 'feedback') {
              if (opt === test.a) cls += ' correct';
              else if (opt === chosen) cls += ' wrong';
            }
            return (
              <button key={i} className={cls} onClick={() => answer(opt)} disabled={phase === 'feedback'}>
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* Spell input */}
      {test.spell && phase === 'play' && (
        <div>
          {hints > 0 && <div className="hint-row">{hintText}</div>}
          <input
            className="input-field lg"
            autoFocus
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && input.trim() && answer()}
            placeholder="Type translation…"
          />
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button
              className="btn btn-ghost"
              style={{ flex: 1 }}
              onClick={() => setHints(h => Math.min(h + 1, test.a.length))}
              disabled={hints >= test.a.length}
            >
              💡 Hint ({hints} / {test.a.length})
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 2 }}
              onClick={() => answer()}
              disabled={!input.trim()}
            >
              Confirm →
            </button>
          </div>
        </div>
      )}

      {/* Spell feedback display */}
      {test.spell && phase === 'feedback' && (
        <div
          className="input-field lg"
          style={{
            color: isCorrect ? 'var(--good)' : 'var(--bad)',
            border: `1px solid ${isCorrect ? 'var(--good)' : 'var(--bad)'}`,
            background: isCorrect ? 'var(--good-soft)' : 'var(--bad-soft)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {chosen || '(empty)'}
        </div>
      )}

      {/* Next / Finish */}
      {phase === 'feedback' && (
        <button
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '2rem', padding: '1rem', fontSize: '1rem' }}
          onClick={next}
        >
          {idx + 1 < words.length ? 'Next term →' : 'See results'}
        </button>
      )}
    </div>
  );
};

export default Game;
