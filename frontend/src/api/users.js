import api from './index.js';

export const fetchUsers = () => api.get('/users');
export const fetchUser = id => api.get(`/users/${id}`);
export const createUser = data => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = id => api.delete(`/users/${id}`);