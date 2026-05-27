import { useState } from 'react';
import { analyzeWeek } from '../api/client';

export default function InsightPanel({ logCount = 0 }) {
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analyzed, setAnalyzed] = useState(false);

  const handleAnalyze = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await analyzeWeek();
      setInsights(res.data.insights || '');
      setAnalyzed(true);
    } catch (err) {
      setError('Could not load insights. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const bullets = insights
    ? insights.split('\n').filter((l) => l.trim())
    : [];

  return (
    <div className="card">
      <div className="insight-panel-header">
        <span className="insight-panel-title">🧠 AI Behavioral Insights</span>
        <button
          id="analyze-week-btn"
          className="btn btn-primary btn-sm"
          onClick={handleAnalyze}
          disabled={loading || logCount < 1}
          title={logCount < 1 ? 'Log at least 1 day first' : ''}
        >
          {loading ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Analyzing...</> : '✨ Analyze My Week'}
        </button>
      </div>

      {logCount < 3 && !analyzed && (
        <p style={{ color: 'var(--text-sec)', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '0.75rem' }}>
          💡 Log at least 3 days for the best insights (you have {logCount} so far).
        </p>
      )}

      {loading && (
        <div>
          <p style={{ color: 'var(--text-sec)', fontSize: '0.87rem', marginBottom: '1rem' }}>
            Gemini is analyzing your last 7 days...
          </p>
          {[1, 2, 3].map((i) => (
            <div key={i} className="shimmer" style={{ marginBottom: '0.75rem', height: '2.5rem', width: i === 3 ? '70%' : '100%' }} />
          ))}
        </div>
      )}

      {error && !loading && (
        <p style={{ color: 'var(--danger)', fontSize: '0.87rem' }}>{error}</p>
      )}

      {!loading && !analyzed && !error && (
        <p className="insight-placeholder">
          Click 'Analyze My Week' to surface patterns in your recent behavior.
        </p>
      )}

      {!loading && analyzed && bullets.length > 0 && (
        <div>
          {bullets.map((b, i) => (
            <div key={i} className="insight-bullet">
              {b.startsWith('•') ? b : `• ${b}`}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
