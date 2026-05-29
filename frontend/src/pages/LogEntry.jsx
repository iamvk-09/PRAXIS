import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTodayLog, submitLog } from '../api/client';
import VoiceInput from '../components/VoiceInput';

function formatDate(d) {
  return d.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function toDateString(d) {
  return d.toISOString().split('T')[0];
}

function ResultsPanel({ log, date, onReset }) {
  const moodEmoji = { positive: '😊', neutral: '😐', negative: '😔' };
  const energyEmoji = { high: '⚡', medium: '⚖️', low: '🔋' };
  const mood = log.mood || log.mood_signal;
  const energy = log.energy || log.energy_signal;

  return (
    <div className="card">
      <div className="results-header">
        <div className="results-check">✓</div>
        <div>
          <div className="results-title">Log saved</div>
          <div className="results-date">{formatDate(new Date(date + 'T00:00:00'))}</div>
        </div>
      </div>

      {log.activities && log.activities.length > 0 && (
        <div className="results-section">
          <div className="results-section-title">Activities Extracted</div>
          <div className="results-badges">
            {log.activities.map((a, i) => (
              <span key={i} className={`badge badge-${a.type || 'productive'}`}>
                {a.name}
                {a.duration_minutes > 0 && <span style={{ opacity: 0.7 }}> {a.duration_minutes}m</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="results-section">
        <div className="results-section-title">Signals</div>
        <div className="results-meta">
          <div className="results-meta-item">
            <span>{moodEmoji[mood] || '😐'}</span>
            <span style={{ textTransform: 'capitalize' }}>{mood || 'Neutral'}</span>
          </div>
          <div className="results-meta-item">
            <span>{energyEmoji[energy] || '⚖️'}</span>
            <span style={{ textTransform: 'capitalize' }}>{energy || 'Medium'} Energy</span>
          </div>
        </div>
      </div>

      {log.distractions && log.distractions.length > 0 && (
        <div className="results-section">
          <div className="results-section-title">Distractions</div>
          <div className="results-distractions">
            {log.distractions.map((d, i) => (
              <span key={i} className="distraction-tag">{d}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
        <button className="btn btn-secondary" onClick={onReset}>
          Edit This Log
        </button>
        <a href="/habits" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          Check Habits →
        </a>
      </div>
    </div>
  );
}

export default function LogEntry() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(true);
  const navigate = useNavigate();

  const today = new Date();
  const todayStr = toDateString(today);

  useEffect(() => {
    getTodayLog()
      .then((res) => {
        if (res.data) {
          setResult(res.data);
          setText(res.data.raw_input || '');
          setShowForm(false);
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const handleTranscript = (transcript) => {
    setText((prev) => (prev ? prev + ' ' + transcript : transcript));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setError('');
    setLoading(true);
    try {
      const res = await submitLog(text.trim(), todayStr);
      setResult(res.data);
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze log. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setShowForm(true);
  };

  if (checking) {
    return (
      <div className="container" style={{ paddingTop: '2rem' }}>
        <div className="log-page">
          <div className="log-loading">
            <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, margin: '0 auto' }} />
            <p className="log-loading-text">Loading today's log...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div className="log-page">
        <div className="log-date">Today</div>
        <div className="log-date-big">{formatDate(today)}</div>

        {!showForm && result ? (
          <ResultsPanel log={result} date={todayStr} onReset={handleReset} />
        ) : (
          <div className="card">
            {loading ? (
              <div className="log-loading" style={{ padding: '3rem' }}>
                <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3, margin: '0 auto' }} />
                <p className="log-loading-text">AI is extracting your habits...</p>
                <p style={{ color: 'var(--text-sec)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  Gemini 2.5 Flash is analyzing your day
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="auth-error" style={{ marginBottom: '1rem' }}>{error}</div>
                )}
                <textarea
                  id="log-textarea"
                  className="textarea"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="How was your day? Tell me about what you studied, worked on, skipped, how you're feeling..."
                  disabled={loading}
                  style={{ minHeight: 180 }}
                />
                <div className="log-actions">
                  <button
                    id="log-submit"
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading || !text.trim()}
                  >
                    Analyze My Day →
                  </button>
                  <VoiceInput onTranscript={handleTranscript} disabled={loading} />
                </div>
                <p style={{ color: 'var(--text-sec)', fontSize: '0.78rem', marginTop: '0.75rem' }}>
                  AI will extract your activities, mood, and energy from natural text.
                </p>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
