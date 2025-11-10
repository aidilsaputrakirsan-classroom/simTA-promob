import api from '../utils/api';

export const getAllUsers = async (role) => {
  const params = role ? { role } : {};
  const response = await api.get('/users', { params });
  return response.data.data;
};

export const getDosenList = async () => {
  const response = await api.get('/users/dosen');
  return response.data.data;
};

export const updateUser = async (id, data) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data.data;
};

export const deleteUser = async (id) => {
  await api.delete(`/users/${id}`);
};