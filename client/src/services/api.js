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

// Scoreboard endpoints
export const fetchScoreboard = () => axios.get('/api/scoreboard');
export const fetchAdminScoreboard = () => axios.get('/api/admin/scoreboard');

// Admin CRUD for games
export const fetchGames = () => axios.get('/api/admin/games');
export const createGame = (data) => axios.post('/api/admin/games', data);
export const updateGame = (id, data) => axios.put(`/api/admin/games/${id}`, data);
export const deleteGame = (id) => axios.delete(`/api/admin/games/${id}`);

// Admin CRUD for clues
export const fetchClues = () => axios.get('/api/admin/clues');
export const createClueAdmin = (data) => axios.post('/api/admin/clues', data);
export const updateClueAdmin = (id, data) => axios.put(`/api/admin/clues/${id}`, data);
export const deleteClueAdmin = (id) => axios.delete(`/api/admin/clues/${id}`);

// Admin CRUD for side quests
export const fetchSideQuestsAdmin = () => axios.get('/api/admin/sidequests');
export const createSideQuestAdmin = (data) => axios.post('/api/admin/sidequests', data);
export const updateSideQuestAdmin = (id, data) => axios.put(`/api/admin/sidequests/${id}`, data);
export const deleteSideQuestAdmin = (id) => axios.delete(`/api/admin/sidequests/${id}`);

// Admin CRUD for players
export const fetchPlayers = () => axios.get('/api/admin/players');
export const createPlayer = (data) => axios.post('/api/admin/players', data);
export const updatePlayer = (id, data) => axios.put(`/api/admin/players/${id}`, data);
export const deletePlayer = (id) => axios.delete(`/api/admin/players/${id}`);

