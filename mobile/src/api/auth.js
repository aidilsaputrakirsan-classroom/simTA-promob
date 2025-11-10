import api from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  const { token, user } = response.data;
  
  await AsyncStorage.setItem('token', token);
  await AsyncStorage.setItem('user', JSON.stringify(user));
  
  return { token, user };
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  const { token, user } = response.data;
  
  await AsyncStorage.setItem('token', token);
  await AsyncStorage.setItem('user', JSON.stringify(user));
  
  return { token, user };
};

export const logout = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
};

export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data.user;
};