import { useState, useEffect } from 'react';
import {
  getHabits,
  createHabit,
  updateHabit,
  getHabitSuggestions,
  getHabitCompletions,
} from '../api/client';

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newHabitName, setNewHabitName] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [habitsRes, suggestionsRes, completionsRes] = await Promise.allSettled([
        getHabits(),
        getHabitSuggestions(),
        getHabitCompletions(7),
      ]);
      if (habitsRes.status === 'fulfilled') setHabits(habitsRes.value.data || []);
      if (suggestionsRes.status === 'fulfilled') setSuggestions(suggestionsRes.value.data || []);
      if (completionsRes.status === 'fulfilled') setCompletions(completionsRes.value.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleTrackSuggestion = async (name) => {
    try {
      await createHabit(name);
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add habit.');
    }
  };

  const handleAddCustom = async () => {
    if (!newHabitName.trim()) return;
    setAddLoading(true);
    setError('');
    try {
      await createHabit(newHabitName.trim());
      setNewHabitName('');
      setShowAddInput(false);
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add habit.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await updateHabit(id, { is_active: false });
      setHabits((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      setError('Failed to remove habit.');
    }
  };

  // Get last 7 days completion dots for a habit
  function getHabitDots(habitId) {
    const today = new Date();
    const dots = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const comp = completions.find(
        (c) => c.habit_id === habitId && c.date === dateStr
      );
      dots.push(comp?.completed ? 'filled' : 'empty');
    }
    return dots;
  }

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
    <div className="container" style={{ paddingTop: '2rem', maxWidth: 760 }}>
      <div className="page-title">Habits</div>
      <p className="page-subtitle">Track what matters. We'll detect patterns automatically.</p>

      {error && (
        <div className="auth-error" style={{ marginBottom: '1rem' }}>{error}</div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="section-header">
            <span className="section-title">💡 Suggested Habits</span>
            <span style={{ color: 'var(--text-sec)', fontSize: '0.8rem' }}>From your recent logs</span>
          </div>
          <p style={{ color: 'var(--text-sec)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            We noticed these activities appearing regularly in your logs:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {suggestions.map((s) => (
              <div
                key={s.name}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem 1rem', background: 'var(--surface-el)',
                  borderRadius: '0.6rem', border: '1px solid var(--border)',
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{s.name}</span>
                  <span style={{ color: 'var(--text-sec)', fontSize: '0.82rem', marginLeft: '0.75rem' }}>
                    {s.frequency}x in last 7 days
                  </span>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleTrackSuggestion(s.name)}
                  id={`track-suggestion-${s.name}`}
                >
                  Track This
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Habits */}
      <div className="card">
        <div className="section-header">
          <span className="section-title">Active Habits</span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowAddInput((v) => !v)}
            id="add-custom-habit-btn"
          >
            + Add Custom
          </button>
        </div>

        {showAddInput && (
          <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}>
            <input
              id="custom-habit-input"
              className="input"
              placeholder="Habit name (e.g. Reading, Meditation)"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
              disabled={addLoading}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={handleAddCustom}
              disabled={addLoading || !newHabitName.trim()}
            >
              {addLoading ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : 'Add'}
            </button>
          </div>
        )}

        {/* Day labels */}
        {habits.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, marginBottom: '0.5rem', paddingRight: '0.5rem' }}>
            {['7d', '6d', '5d', '4d', '3d', '2d', 'T'].map((d) => (
              <div key={d} style={{ width: 10, textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-sec)' }}>{d}</div>
            ))}
          </div>
        )}

        {habits.length === 0 && !showAddInput ? (
          <div className="empty-state">
            <div className="empty-state-icon">🌱</div>
            <p className="empty-state-text">
              No habits tracked yet.<br />Log a few days and we'll suggest some automatically.
            </p>
          </div>
        ) : (
          habits.map((h) => (
            <div key={h.id} className="habit-row">
              <span className="habit-name">{h.name}</span>
              <div className="habit-dots">
                {getHabitDots(h.id).map((status, i) => (
                  <div
                    key={i}
                    className={`habit-dot ${status === 'filled' ? 'habit-dot-filled' : 'habit-dot-empty'}`}
                    title={status === 'filled' ? 'Completed' : 'Missed'}
                  />
                ))}
              </div>
              <button
                className="habit-toggle"
                onClick={() => handleDeactivate(h.id)}
                title="Remove habit"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
