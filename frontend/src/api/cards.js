import axios from 'axios';

const api = axios.create({
	baseURL: '/api',
});

export const fetchCards = () => api.get('/cards');
export const fetchCard  = id => api.get(`/cards/${id}`);
export const createCard = data => api.post('/cards', data);
export const updateCard = (id, data) => api.put(`/cards/${id}`, data);
export const deleteCard = id => api.delete(`/cards/${id}`);