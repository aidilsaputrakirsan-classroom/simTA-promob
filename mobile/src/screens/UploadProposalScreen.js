import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Title, Paragraph } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import { uploadProposal } from '../api/proposals';

export default function UploadProposalScreen({ route, navigation }) {
  const { taId } = route.params;
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });
      
      if (!result.canceled) {
        setFile(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      Alert.alert('Error', 'Please select a file');
      return;
    }

    setLoading(true);
    try {
      // Dalam implementasi nyata, upload file ke storage (misal Supabase Storage)
      // Untuk MVP, kita simpan URL dummy
      const fileUrl = `https://storage.example.com/${file.name}`;
      
      await uploadProposal({
        tugas_akhir_id: taId,
        file_url: fileUrl,
        file_name: file.name,
      });
      
      Alert.alert('Success', 'Proposal uploaded successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Upload Proposal</Title>
      
      <Button
        mode="outlined"
        onPress={pickDocument}
        style={styles.button}
        icon="file-document"
        textColor="#3498db"
        theme={{
          colors: {
            outline: '#3498db',
          }
        }}
      >
        {file ? 'Change File' : 'Select PDF File'}
      </Button>
      
      {file && (
        <Paragraph style={styles.fileName}>
          Selected: {file.name}
        </Paragraph>
      )}
      
      <Button
        mode="contained"
        onPress={handleUpload}
        loading={loading}
        disabled={loading || !file}
        style={styles.uploadButton}
      >
        Upload
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#2c3e50',
  },
  button: {
    marginBottom: 15,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
  },
  fileName: {
    marginBottom: 20,
    color: '#4a4a4a',
    fontSize: 14,
    fontStyle: 'italic',
  },
  uploadButton: {
    marginTop: 20,
    paddingVertical: 5,
  },
});
