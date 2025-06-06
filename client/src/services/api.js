import axios from 'axios';

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export const register = (data) => axios.post('/api/auth/register', data);
export const login = (data) => axios.post('/api/auth/login', data);

export const fetchMe = () => axios.get('/api/users/me');
export const updateMe = (formData) =>
  axios.put('/api/users/me', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const fetchTeam = (teamId) => axios.get(`/api/teams/${teamId}`);
export const updateTeamColour = (teamId, colours) => axios.put(`/api/teams/${teamId}/colour`, colours);
export const addTeamMember = (teamId, formData) =>
  axios.post(`/api/teams/${teamId}/members`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const fetchSideQuestProgress = (teamId) => axios.get(`/api/teams/${teamId}/sidequests`);
export const submitSideQuest = (teamId, sqId, formData) =>
  axios.post(`/api/teams/${teamId}/sidequests/${sqId}/complete`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const fetchClue = (clueId) => axios.get(`/api/clues/${clueId}`);
export const fetchAllClues = () => axios.get('/api/clues');
export const createClue = (formData) =>
  axios.post('/api/clues', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const submitAnswer = (clueId, answer) => axios.post(`/api/clues/${clueId}/answer`, { answer });

export const fetchAllSideQuests = () => axios.get('/api/sidequests');
export const createSideQuest = (data) => axios.post('/api/sidequests', data);
export const updateSideQuest = (sqId, data) => axios.put(`/api/sidequests/${sqId}`, data);

export const fetchAllMedia = (params) => axios.get('/api/roguery', params ? { params } : {});
export const fetchAdminSummary = () => axios.get('/api/admin/summary');
