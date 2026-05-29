import { useState, useEffect } from 'react';
import { getCurrentGoal, setGoal, getGoalHistory, completeWeek } from '../api/client';


function getMonday(d = new Date()) {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d.setDate(diff));
  return mon;
}

function formatWeekRange(weekStart) {
  const start = new Date(weekStart + 'T00:00:00');
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', fmt)} – ${end.toLocaleDateString('en-US', fmt)}`;
}

function parseGoals(text) {
  return text
    .split(/[\n,]+/)
    .map((g) => g.trim())
    .filter((g) => g.length > 0);
}

export default function Goals() {
  const [currentGoal, setCurrentGoal] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [goalText, setGoalText] = useState('');
  const [preview, setPreview] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [openAccordion, setOpenAccordion] = useState(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState('');

  // Detect stale error fallback strings stored in DB
  const isErrorSummary = (s) => !s || s.includes('Could not generate insights');


  const monday = getMonday(new Date());
  const weekStr = monday.toISOString().split('T')[0];

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [currentRes, historyRes] = await Promise.allSettled([
        getCurrentGoal(),
        getGoalHistory(),
      ]);
      if (currentRes.status === 'fulfilled') setCurrentGoal(currentRes.value.data);
      if (historyRes.status === 'fulfilled') setHistory(historyRes.value.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    setPreview(goalText ? parseGoals(goalText) : []);
  }, [goalText]);

  const handleSave = async () => {
    const goals = parseGoals(goalText);
    if (!goals.length) { setError('Please enter at least one goal.'); return; }
    setSaving(true);
    setError('');
    setSummaryError('');
    try {
      const res = await setGoal(goals);
      setCurrentGoal(res.data);
      setEditing(false);
      setGoalText('');
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save goals.');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    setSummaryError('');
    try {
      await completeWeek();
      await fetchAll();
    } catch (err) {
      setSummaryError(err.response?.data?.error || 'AI summary failed. Please try again.');
    } finally {
      setGeneratingSummary(false);
    }
  };


  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
          <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', maxWidth: 720 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <div className="page-title">Weekly Goal Contract</div>
        <div style={{ color: 'var(--text-sec)', fontSize: '0.85rem', paddingTop: '0.5rem' }}>
          {formatWeekRange(weekStr)}
        </div>
      </div>
      <p className="page-subtitle">Commit to your week. Praxis holds you accountable.</p>

      {error && <div className="auth-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Current Week Goals */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="section-header">
          <span className="section-title">This Week</span>
          {currentGoal && !editing && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setGoalText((currentGoal.goals || []).join('\n'));
                setEditing(true);
              }}
            >
              Edit
            </button>
          )}
        </div>

        {!currentGoal || editing ? (
          <div>
            <label className="label">
              What do you want to achieve this week?
            </label>
            <textarea
              id="goals-textarea"
              className="textarea"
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              placeholder={"Study 2 hours daily\nGym 3 times this week\nRead 30 minutes before bed"}
              style={{ minHeight: 140 }}
              disabled={saving}
            />

            {preview.length > 0 && (
              <div style={{ marginTop: '0.75rem' }}>
                <div className="label" style={{ marginBottom: '0.4rem' }}>Preview:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {preview.map((g, i) => (
                    <span key={i} className="goals-pill">{g}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                id="commit-goals-btn"
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving || !goalText.trim()}
              >
                {saving ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving...</> : '🤝 Commit to These Goals'}
              </button>
              {editing && (
                <button
                  className="btn btn-secondary"
                  onClick={() => { setEditing(false); setGoalText(''); setError(''); }}
                  disabled={saving}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            {(currentGoal.goals || []).map((g, i) => (
              <div key={i} className="goal-item">
                <span className="goal-check">🎯</span>
                <span className="goal-text">{g}</span>
              </div>
            ))}

            {/* AI Summary block */}
            {!isErrorSummary(currentGoal.ai_summary) ? (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--surface-el)', borderRadius: '0.5rem', borderLeft: '3px solid var(--primary)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>AI Summary</div>
                <p style={{ color: 'var(--text)', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{currentGoal.ai_summary}</p>
              </div>
            ) : (
              <div style={{ marginTop: '1rem' }}>
                {summaryError && (
                  <p style={{ color: 'var(--error, #f87171)', fontSize: '0.82rem', marginBottom: '0.5rem' }}>{summaryError}</p>
                )}
                <button
                  id="generate-summary-btn"
                  className="btn btn-secondary btn-sm"
                  onClick={handleGenerateSummary}
                  disabled={generatingSummary}
                >
                  {generatingSummary
                    ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Analyzing week...</>
                    : '✨ Generate AI Summary'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Previous Weeks Accordion */}
      {history.filter(h => h.week_start !== weekStr).length > 0 && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: '0.5rem' }}>Previous Weeks</div>
          {history
            .filter((h) => h.week_start !== weekStr)
            .map((h, i) => (
              <div key={h.id}>
                <div
                  className="accordion-header"
                  onClick={() => setOpenAccordion(openAccordion === i ? null : i)}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{formatWeekRange(h.week_start)}</span>
                  <span style={{ color: 'var(--text-sec)', fontSize: '0.85rem' }}>
                    {h.goals?.length || 0} goal{(h.goals?.length || 0) !== 1 ? 's' : ''} · {openAccordion === i ? '▲' : '▼'}
                  </span>
                </div>
                {openAccordion === i && (
                  <div style={{ padding: '0.75rem 0 1rem' }}>
                    {(h.goals || []).map((g, j) => (
                      <div key={j} className="goal-item">
                        <span className="goal-check">🎯</span>
                        <span className="goal-text">{g}</span>
                      </div>
                    ))}
                    {h.ai_summary && !isErrorSummary(h.ai_summary) ? (
                      <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: 'var(--surface-el)', borderRadius: '0.5rem', borderLeft: '3px solid var(--primary)' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>AI Summary</div>
                        <p style={{ color: 'var(--text)', fontSize: '0.88rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{h.ai_summary}</p>
                      </div>
                    ) : !h.ai_summary ? (
                      <p style={{ color: 'var(--text-sec)', fontSize: '0.82rem', fontStyle: 'italic', marginTop: '0.5rem' }}>No AI summary generated for this week.</p>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
