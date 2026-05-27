import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

// Auth
export const login = (username, password) =>
  api.post('/auth/login', { username, password });

export const register = (username, password) =>
  api.post('/auth/register', { username, password });

export const logout = () => api.post('/auth/logout');

export const getMe = () => api.get('/auth/me');

// Logs
export const submitLog = (text, date) =>
  api.post('/logs', { text, ...(date && { date }) });

export const getLogs = (days = 7) => api.get(`/logs?days=${days}`);

export const getTodayLog = () => api.get('/logs/today');

// Habits
export const getHabits = () => api.get('/habits');

export const createHabit = (name) => api.post('/habits', { name });

export const updateHabit = (id, data) => api.put(`/habits/${id}`, data);

export const getHabitSuggestions = () => api.get('/habits/suggestions');

export const getHabitCompletions = (days = 30) =>
  api.get(`/habits/completions?days=${days}`);

// Goals
export const getCurrentGoal = () => api.get('/goals/current');

export const setGoal = (goals_array) => api.post('/goals', { goals: goals_array });

export const getGoalHistory = () => api.get('/goals/history');

export const completeWeek = () => api.post('/goals/complete-week');

// Insights
export const analyzeWeek = () => api.post('/insights/analyze');

export const getMomentumHistory = () => api.get('/insights/momentum-history');

export default api;
