import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ---- Equipment ----
export const getEquipments = (params) => api.get('/equipments', { params });
export const getEquipment = (id) => api.get(`/equipments/${id}`);
export const getEquipmentStats = () => api.get('/equipments/stats');
export const createEquipment = (data) => api.post('/equipments', data);
export const updateEquipment = (id, data) => api.put(`/equipments/${id}`, data);
export const deleteEquipment = (id) => api.delete(`/equipments/${id}`);

// ---- Maintenance ----
export const getRequests = (params) => api.get('/maintenance', { params });
export const getRequest = (id) => api.get(`/maintenance/${id}`);
export const getKanbanData = () => api.get('/maintenance/kanban');
export const getRequestStats = () => api.get('/maintenance/stats');
export const getCalendarEvents = (params) => api.get('/maintenance/calendar', { params });
export const createRequest = (data) => api.post('/maintenance', data);
export const updateRequest = (id, data) => api.put(`/maintenance/${id}`, data);
export const updateStage = (id, stage) => api.patch(`/maintenance/${id}/stage`, { stage });
export const deleteRequest = (id) => api.delete(`/maintenance/${id}`);

// ---- Teams ----
export const getTeams = () => api.get('/teams');
export const createTeam = (data) => api.post('/teams', data);
export const updateTeam = (id, data) => api.put(`/teams/${id}`, data);
export const deleteTeam = (id) => api.delete(`/teams/${id}`);

// ---- Users ----
export const getUsers = () => api.get('/users');
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

export default api;
