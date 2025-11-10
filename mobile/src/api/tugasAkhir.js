import api from '../utils/api';

export const getTugasAkhir = async () => {
  const response = await api.get('/tugas-akhir');
  return response.data.data;
};

export const getTAById = async (id) => {
  const response = await api.get(`/tugas-akhir/${id}`);
  return response.data.data;
};

export const createTA = async (data) => {
  const response = await api.post('/tugas-akhir', data);
  return response.data.data;
};

export const updateTA = async (id, data) => {
  const response = await api.put(`/tugas-akhir/${id}`, data);
  return response.data.data;
};

export const deleteTA = async (id) => {
  await api.delete(`/tugas-akhir/${id}`);
};