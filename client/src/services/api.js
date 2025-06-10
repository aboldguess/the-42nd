import axios from 'axios';

// Attach tokens for both player and admin routes
axios.interceptors.request.use(
  (config) => {
    // Player token (for player routes)
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Admin token (for /api/admin routes)
    if (config.url && config.url.startsWith('/api/admin')) {
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Onboarding endpoints
export const onboard = (formData) =>
  axios.post('/api/onboard', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
export const fetchTeamsList = () => axios.get('/api/onboard/teams');

// Player endpoints
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

//export const fetchClue = (clueId) => axios.get(`/api/clues/${clueId}`);
//export const submitAnswer = (clueId, answer) =>
//  axios.post(`/api/clues/${clueId}/answer`, { answer });

export const fetchClue = (slug, clueId) =>
  axios.get(`/api/${slug}/clues/${clueId}`);
export const submitAnswer = (slug, clueId, answer) =>
  axios.post(`/api/${slug}/clues/${clueId}/answer`, { answer });


// Admin endpoints
export const adminRegister = (data) =>
  axios.post('/api/admin/auth/register', data);
export const adminLogin = (data) =>
  axios.post('/api/admin/auth/login', data);
export const fetchAdminSummary = () =>
  axios.get('/api/admin/summary');
