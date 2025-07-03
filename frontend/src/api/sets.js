import api from './index.js';

export const fetchSets = () => api.get('/sets');
export const fetchSet = id => api.get(`/sets/${id}`);
export const createSet = data => api.post('/sets', data);
export const updateSet = (id, data) => api.put(`/sets/${id}`, data);
export const deleteSet = id => api.delete(`/sets/${id}`);