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
// This remains for backwards compatibility but is unused by the simplified UI
export const fetchTeamsList = () => axios.get('/api/onboard/teams');
// Public list of teams used during signup to display available options
export const fetchTeamsPublic = () => axios.get('/api/teams');

// Player authentication
// Submit player names to receive a JWT
export const login = (creds) => axios.post('/api/auth/login', creds);

// Player endpoints
export const fetchMe = () => axios.get('/api/users/me');
export const updateMe = (formData) =>
  axios.put('/api/users/me', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
export const fetchTeam = (teamId) => axios.get(`/api/teams/${teamId}`);
export const addTeamMember = (teamId, formData) =>
  axios.post(`/api/teams/${teamId}/members`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

// List all players for public roster screens
export const fetchPlayersPublic = () => axios.get('/api/users');
// Fetch an individual player's public profile
export const fetchPlayerById = (id) => axios.get(`/api/users/${id}`);

export const fetchClue = (clueId) => axios.get(`/api/clues/${clueId}`);
export const submitAnswer = (clueId, answer) =>
  axios.post(`/api/clues/${clueId}/answer`, { answer });
export const fetchQuestion = (id) => axios.get(`/api/questions/${id}`);
export const submitQuestionAnswer = (id, answer) =>
  axios.post(`/api/questions/${id}/answer`, { answer });
export const fetchSideQuest = (id) => axios.get(`/api/sidequests/${id}`);

// Retrieve all clues for the logged-in player. The list is ordered by creation
// time so indexes correspond to the "currentClue" number stored on each team.
export const fetchCluesPlayer = () => axios.get('/api/clues');

// Public/player side quest endpoints
export const fetchSideQuests = () => axios.get('/api/sidequests/public');
export const submitSideQuest = (id, data) =>
  axios.post(`/api/sidequests/${id}/submit`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
// Retrieve rogues gallery items with optional sorting.
// sort can be 'newest', 'hottest' or 'best'.
export const fetchRoguesGallery = (sort = 'newest') =>
  axios.get(`/api/roguery?sort=${sort}`);
// Emoji reactions on gallery items
export const addReaction = (mediaId, emoji) =>
  axios.post('/api/reactions', { mediaId, emoji });
export const fetchReactions = (mediaId) =>
  axios.get(`/api/reactions/${mediaId}`);

// Wall comments on player/team profiles
export const fetchWall = (type, id) => axios.get(`/api/wall/${type}/${id}`);
export const postComment = (type, id, data) =>
  axios.post(`/api/wall/${type}/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

// Admin gallery endpoints
export const fetchAdminGallery = () => axios.get('/api/admin/gallery');
export const updateMediaVisibility = (id, hidden) =>
  axios.put(`/api/admin/gallery/${id}`, { hidden });
export const deleteMediaAdmin = (id) =>
  axios.delete(`/api/admin/gallery/${id}`);


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

// Player progress tables
export const fetchProgress = (type) => axios.get(`/api/progress/${type}`);


// Admin CRUD for clues
export const fetchClues = () => axios.get('/api/admin/clues');
export const createClueAdmin = (data) =>
  axios.post('/api/admin/clues', data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
  });
export const updateClueAdmin = (id, data) =>
  axios.put(`/api/admin/clues/${id}`, data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
  });
export const deleteClueAdmin = (id) => axios.delete(`/api/admin/clues/${id}`);

// Admin CRUD for side quests
export const fetchSideQuestsAdmin = () => axios.get('/api/admin/sidequests');
export const createSideQuestAdmin = (data) =>
  axios.post('/api/admin/sidequests', data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
  });
export const updateSideQuestAdmin = (id, data) =>
  axios.put(`/api/admin/sidequests/${id}`, data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
  });
export const deleteSideQuestAdmin = (id) => axios.delete(`/api/admin/sidequests/${id}`);

// Admin CRUD for players
export const fetchPlayers = () => axios.get('/api/admin/players');
export const fetchPlayersByTeam = (teamId) =>
  axios.get(`/api/admin/players?team=${teamId}`);
export const createPlayer = (data) => axios.post('/api/admin/players', data);
export const updatePlayer = (id, data) => axios.put(`/api/admin/players/${id}`, data);
export const deletePlayer = (id) => axios.delete(`/api/admin/players/${id}`);

// Admin CRUD for teams
export const fetchTeamsAdmin = () => axios.get('/api/admin/teams');
export const createTeamAdmin = (data) => axios.post('/api/admin/teams', data);
export const updateTeamAdmin = (id, data) =>
  axios.put(`/api/admin/teams/${id}`, data);
export const deleteTeamAdmin = (id) => axios.delete(`/api/admin/teams/${id}`);

// Admin CRUD for questions
export const fetchQuestions = () => axios.get('/api/admin/questions');
// Image uploads require multipart/form-data
export const createQuestion = (data) =>
  axios.post('/api/admin/questions', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
export const updateQuestion = (id, data) =>
  axios.put(`/api/admin/questions/${id}`, data);
export const deleteQuestion = (id) =>
  axios.delete(`/api/admin/questions/${id}`);

// Settings endpoints
export const fetchSettings = () => axios.get('/api/settings');
export const fetchSettingsAdmin = () => axios.get('/api/admin/settings');
export const updateSettingsAdmin = (data) =>
  axios.put('/api/admin/settings', data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
  });

