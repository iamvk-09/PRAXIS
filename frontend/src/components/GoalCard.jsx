import { useState } from 'react';
import { Link } from 'react-router-dom';
import { completeWeek } from '../api/client';

function formatWeekRange(weekStart) {
  const start = new Date(weekStart + 'T00:00:00');
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', fmt)} – ${end.toLocaleDateString('en-US', fmt)}`;
}

export default function GoalCard({ goal, logs = [] }) {
  const [showModal, setShowModal] = useState(false);
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState('');

  if (!goal) {
    return (
      <div className="card" style={{ height: '100%' }}>
        <div className="section-header">
          <span className="section-title">Weekly Goals</span>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">🎯</div>
          <p className="empty-state-text">No goals set for this week.</p>
          <Link to="/goals" className="btn btn-primary btn-sm" style={{ marginTop: '1rem', textDecoration: 'none' }}>
            Set Goals →
          </Link>
        </div>
      </div>
    );
  }

  // Check if keywords from a goal appear in recent logs
  function isGoalLikelyMet(goalText) {
    const keywords = goalText.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    if (!logs || logs.length === 0) return false;
    const allActivities = logs.flatMap(l => l.activities || []);
    return keywords.some(kw =>
      allActivities.some(a =>
        a.name?.toLowerCase().includes(kw) && a.type !== 'skipped'
      )
    );
  }

  const handleGenerateSummary = async () => {
    setLoadingSummary(true);
    setSummaryError('');
    try {
      const res = await completeWeek();
      setSummary(res.data.summary);
      setShowModal(true);
    } catch (err) {
      setSummaryError(err.response?.data?.error || 'Failed to generate summary.');
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <>
      <div className="card" style={{ height: '100%' }}>
        <div className="section-header">
          <span className="section-title">Weekly Goals</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-sec)' }}>
            {formatWeekRange(goal.week_start)}
          </span>
        </div>

        <div>
          {(goal.goals || []).map((g, i) => (
            <div key={i} className="goal-item">
              <span className="goal-check">{isGoalLikelyMet(g) ? '✅' : '🔲'}</span>
              <span className="goal-text">{g}</span>
            </div>
          ))}
        </div>

        {summaryError && (
          <p style={{ color: 'var(--danger)', fontSize: '0.82rem', marginTop: '0.75rem' }}>{summaryError}</p>
        )}

        <button
          className="btn btn-secondary btn-sm"
          style={{ marginTop: '1.25rem' }}
          onClick={handleGenerateSummary}
          disabled={loadingSummary}
          id="generate-week-summary"
        >
          {loadingSummary ? <><span className="spinner" /> Analyzing...</> : '✨ Generate Week Summary'}
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">📊 Week Summary</div>
            <p style={{ color: 'var(--text-sec)', fontSize: '0.82rem', marginBottom: '1rem' }}>
              {formatWeekRange(goal.week_start)}
            </p>
            <div style={{ color: 'var(--text)', lineHeight: 1.7, fontSize: '0.93rem', whiteSpace: 'pre-wrap' }}>
              {summary || goal.ai_summary}
            </div>
            <button
              className="btn btn-secondary"
              style={{ marginTop: '1.5rem' }}
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
