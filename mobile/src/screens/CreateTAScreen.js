import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Title, Menu, Divider } from 'react-native-paper';
import { createTA } from '../api/tugasAkhir';
import { getDosenList } from '../api/users';

export default function CreateTAScreen({ navigation }) {
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    dosen_id: '',
  });
  const [dosenList, setDosenList] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedDosen, setSelectedDosen] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDosenList();
  }, []);

  const loadDosenList = async () => {
    try {
      const data = await getDosenList();
      setDosenList(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.judul) {
      Alert.alert('Error', 'Judul is required');
      return;
    }

    setLoading(true);
    try {
      await createTA(formData);
      Alert.alert('Success', 'TA created successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Title style={styles.title}>Buat Tugas Akhir Baru</Title>
      
      <TextInput
        label="Judul TA"
        value={formData.judul}
        onChangeText={(text) => setFormData({ ...formData, judul: text })}
        mode="outlined"
        style={styles.input}
        textColor="#000000"
        outlineColor="#cccccc"
        activeOutlineColor="#3498db"
        theme={{
          colors: {
            background: '#ffffff',
            onSurfaceVariant: '#666666',
          }
        }}
      />
      
      <TextInput
        label="Deskripsi"
        value={formData.deskripsi}
        onChangeText={(text) => setFormData({ ...formData, deskripsi: text })}
        mode="outlined"
        style={styles.input}
        multiline
        numberOfLines={4}
        textColor="#000000"
        outlineColor="#cccccc"
        activeOutlineColor="#3498db"
        theme={{
          colors: {
            background: '#ffffff',
            onSurfaceVariant: '#666666',
          }
        }}
      />
      
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        contentStyle={styles.menuContent}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setMenuVisible(true)}
            style={styles.menuButton}
            textColor="#4a4a4a"
            theme={{
              colors: {
                outline: '#cccccc',
              }
            }}
          >
            {selectedDosen ? selectedDosen.nama : 'Pilih Dosen Pembimbing'}
          </Button>
        }
      >
        {dosenList.map((dosen) => (
          <Menu.Item
            key={dosen.id}
            onPress={() => {
              setSelectedDosen(dosen);
              setFormData({ ...formData, dosen_id: dosen.id });
              setMenuVisible(false);
            }}
            title={`${dosen.nama} (${dosen.nip})`}
            titleStyle={styles.menuItemTitle}
          />
        ))}
      </Menu>
      
      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Simpan
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#ffffff',
  },
  menuButton: {
    marginBottom: 15,
    backgroundColor: '#ffffff',
    borderColor: '#cccccc',
  },
  menuContent: {
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
  menuItemTitle: {
    color: '#2c3e50',
  },
  button: {
    marginTop: 10,
    paddingVertical: 5,
  },
});
