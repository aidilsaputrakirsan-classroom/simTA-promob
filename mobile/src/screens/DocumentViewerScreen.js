import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { Paragraph, Button } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import { getProposalFileUrl } from '../api/proposals';

export default function DocumentViewerScreen({ route, navigation }) {
  const { proposalId, fileName } = route.params;
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [webViewLoading, setWebViewLoading] = useState(true);

  useEffect(() => {
    loadFile();
  }, []);

  const loadFile = async () => {
    try {
      setLoading(true);
      const response = await getProposalFileUrl(proposalId);
      const url = response.data.file_url;

      // For PDF viewing in WebView, we use Google Docs Viewer for cross-platform compatibility
      // This works better than direct PDF URL in WebView
      const viewerUrl = Platform.select({
        web: url, // Direct URL for web
        default: `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`,
      });

      setFileUrl(viewerUrl);
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
          📄 {fileName || 'Document'}
        </Paragraph>
      </View>

      {webViewLoading && (
        <View style={styles.webViewLoadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Paragraph style={styles.loadingText}>Loading PDF...</Paragraph>
        </View>
      )}

      <WebView
        source={{ uri: fileUrl }}
        style={styles.webView}
        onLoadStart={() => setWebViewLoading(true)}
        onLoadEnd={() => setWebViewLoading(false)}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
          Alert.alert('Error', 'Failed to load PDF. Please try again.');
        }}
        startInLoadingState={true}
        scalesPageToFit={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
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
  },
  webViewLoadingContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});
