import api from './index.js';

export const fetchCardTypes = () => api.get('/card-types');
export const fetchCardType = id => api.get(`/card-types/${id}`);
export const createCardType = data => api.post('/card-types', data);
export const updateCardType = (id, data) => api.put(`/card-types/${id}`, data);
export const deleteCardType = id => api.delete(`/card-types/${id}`);