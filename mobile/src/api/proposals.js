import api from '../utils/api';

export const getProposals = async (tugasAkhirId) => {
  const params = tugasAkhirId ? { tugas_akhir_id: tugasAkhirId } : {};
  const response = await api.get('/proposals', { params });
  return response.data.data;
};

export const uploadProposal = async (data) => {
  const response = await api.post('/proposals', data);
  return response.data.data;
};

export const reviewProposal = async (id, status, catatan) => {
  const response = await api.put(`/proposals/${id}/review`, { status, catatan });
  return response.data.data;
};

export const getProposalFileUrl = async (id) => {
  const response = await api.get(`/proposals/${id}/file-url`);
  return response;
};

export const deleteProposal = async (id) => {
  const response = await api.delete(`/proposals/${id}`);
  return response.data;
};