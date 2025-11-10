import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Title, Paragraph, ProgressBar } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { uploadProposal } from '../api/proposals';

export default function UploadProposalScreen({ route, navigation }) {
  const { taId } = route.params;
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const selectedFile = result.assets[0];

        // Validasi ukuran file (max 10MB)
        const fileInfo = await FileSystem.getInfoAsync(selectedFile.uri);
        const fileSizeMB = fileInfo.size / (1024 * 1024);

        if (fileSizeMB > 10) {
          Alert.alert('Error', 'File size exceeds 10MB limit');
          return;
        }

        setFile(selectedFile);
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
    setUploadProgress(0.1);

    try {
      // Read file and convert to base64
      setUploadProgress(0.3);
      const base64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      setUploadProgress(0.5);

      // Upload to backend (backend will handle Supabase Storage upload)
      await uploadProposal({
        tugas_akhir_id: taId,
        file_name: file.name,
        file_data: `data:application/pdf;base64,${base64}`,
      });

      setUploadProgress(1.0);

      Alert.alert('Success', 'Proposal uploaded successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', error.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
      setUploadProgress(0);
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
        disabled={loading}
        theme={{
          colors: {
            outline: '#3498db',
          },
        }}
      >
        {file ? 'Change File' : 'Select PDF File'}
      </Button>

      {file && (
        <View style={styles.fileInfo}>
          <Paragraph style={styles.fileName}>📄 {file.name}</Paragraph>
          <Paragraph style={styles.fileSize}>
            Size: {(file.size / 1024).toFixed(2)} KB
          </Paragraph>
        </View>
      )}

      {loading && uploadProgress > 0 && (
        <View style={styles.progressContainer}>
          <Paragraph style={styles.progressText}>
            Uploading... {Math.round(uploadProgress * 100)}%
          </Paragraph>
          <ProgressBar
            progress={uploadProgress}
            color="#3498db"
            style={styles.progressBar}
          />
        </View>
      )}

      <Button
        mode="contained"
        onPress={handleUpload}
        loading={loading}
        disabled={loading || !file}
        style={styles.uploadButton}
      >
        {loading ? 'Uploading...' : 'Upload Proposal'}
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
  fileInfo: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  fileName: {
    color: '#2c3e50',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  fileSize: {
    color: '#7f8c8d',
    fontSize: 12,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    color: '#3498db',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  uploadButton: {
    marginTop: 20,
    paddingVertical: 5,
  },
});
