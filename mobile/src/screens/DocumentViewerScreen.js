import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { Title, Button, Paragraph } from 'react-native-paper';
import Pdf from 'react-native-pdf';
import { getProposalFileUrl } from '../api/proposals';

export default function DocumentViewerScreen({ route, navigation }) {
  const { proposalId, fileName } = route.params;
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadFile();
  }, []);

  const loadFile = async () => {
    try {
      setLoading(true);
      const response = await getProposalFileUrl(proposalId);
      setFileUrl(response.data.file_url);
    } catch (error) {
      console.error('Load file error:', error);
      Alert.alert(
        'Error',
        'Failed to load document. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Paragraph style={styles.loadingText}>Loading document...</Paragraph>
      </View>
    );
  }

  if (!fileUrl) {
    return (
      <View style={styles.errorContainer}>
        <Paragraph style={styles.errorText}>Failed to load document</Paragraph>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Paragraph style={styles.fileName} numberOfLines={1}>
          {fileName || 'Document'}
        </Paragraph>
        <Paragraph style={styles.pageInfo}>
          Page {currentPage} of {totalPages}
        </Paragraph>
      </View>

      <Pdf
        source={{ uri: fileUrl, cache: true }}
        onLoadComplete={(numberOfPages) => {
          setTotalPages(numberOfPages);
        }}
        onPageChanged={(page) => {
          setCurrentPage(page);
        }}
        onError={(error) => {
          console.error('PDF error:', error);
          Alert.alert('Error', 'Failed to load PDF');
        }}
        style={styles.pdf}
        trustAllCerts={false}
        enablePaging={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 15,
    color: '#7f8c8d',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  pageInfo: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    backgroundColor: '#ecf0f1',
  },
});
