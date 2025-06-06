import axios from 'axios';

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Onboarding endpoint
export const onboard = (formData) =>
  axios.post('/api/onboard', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const fetchTeamsList = () => axios.get('/api/teams/list/all');

// Existing endpoints
export const fetchMe = () => axios.get('/api/users/me');
export const updateMe = (formData) =>
  axios.put('/api/users/me', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
export const fetchTeam = (teamId) => axios.get(`/api/teams/${teamId}`);
export const updateTeamColour = (teamId, colours) =>
  axios.put(`/api/teams/${teamId}/colour`, colours);
export const addTeamMember = (teamId, formData) =>
  axios.post(`/api/teams/${teamId}/members`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const fetchClue = (clueId) => axios.get(`/api/clues/${clueId}`);
export const submitAnswer = (clueId, answer) =>
  axios.post(`/api/clues/${clueId}/answer`, { answer });
