import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Title, SegmentedButtons } from 'react-native-paper';
import { register } from '../api/auth';

export default function RegisterScreen({ navigation, setUser }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nama: '',
    role: 'mahasiswa',
    nim: '',
    nip: '',
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!formData.email || !formData.password || !formData.nama) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.role === 'mahasiswa' && !formData.nim) {
      Alert.alert('Error', 'NIM is required for mahasiswa');
      return;
    }

    if (formData.role !== 'mahasiswa' && !formData.nip) {
      Alert.alert('Error', 'NIP is required for dosen/admin');
      return;
    }

    setLoading(true);
    try {
      const { user } = await register(formData);
      setUser(user);
    } catch (error) {
      Alert.alert('Registration Failed', error.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Register</Title>
      
      <TextInput
        label="Nama Lengkap"
        value={formData.nama}
        onChangeText={(text) => setFormData({ ...formData, nama: text })}
        mode="outlined"
        style={styles.input}
      />
      
      <TextInput
        label="Email"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        mode="outlined"
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        label="Password"
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
        mode="outlined"
        style={styles.input}
        secureTextEntry
      />
      
      <SegmentedButtons
        value={formData.role}
        onValueChange={(value) => setFormData({ ...formData, role: value })}
        buttons={[
          { value: 'mahasiswa', label: 'Mahasiswa' },
          { value: 'dosen', label: 'Dosen' },
          { value: 'admin', label: 'Admin' },
        ]}
        style={styles.segmented}
      />
      
      {formData.role === 'mahasiswa' ? (
        <TextInput
          label="NIM"
          value={formData.nim}
          onChangeText={(text) => setFormData({ ...formData, nim: text })}
          mode="outlined"
          style={styles.input}
        />
      ) : (
        <TextInput
          label="NIP"
          value={formData.nip}
          onChangeText={(text) => setFormData({ ...formData, nip: text })}
          mode="outlined"
          style={styles.input}
        />
      )}
      
      <Button
        mode="contained"
        onPress={handleRegister}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Register
      </Button>
      
      <Button
        mode="text"
        onPress={() => navigation.goBack()}
        style={styles.linkButton}
      >
        Already have an account? Login
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  input: {
    marginBottom: 15,
  },
  segmented: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    paddingVertical: 5,
  },
  linkButton: {
    marginTop: 15,
    marginBottom: 40,
  },
});