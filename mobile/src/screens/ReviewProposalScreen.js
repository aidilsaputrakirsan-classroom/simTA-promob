import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Title, SegmentedButtons } from 'react-native-paper';
import { reviewProposal } from '../api/proposals';

export default function ReviewProposalScreen({ route, navigation }) {
  const { proposalId } = route.params;
  const [status, setStatus] = useState('approved');
  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await reviewProposal(proposalId, status, catatan);
      Alert.alert('Success', 'Review submitted successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Review Proposal</Title>
      
      <SegmentedButtons
        value={status}
        onValueChange={setStatus}
        buttons={[
          { value: 'approved', label: 'Approve' },
          { value: 'rejected', label: 'Reject' },
        ]}
        style={styles.segmented}
        theme={{
          colors: {
            secondaryContainer: '#4CAF50',
            onSecondaryContainer: '#ffffff',
            onSurface: '#424242',
            outline: '#cccccc',
          }
        }}
      />
      
      <TextInput
        label="Catatan (opsional)"
        value={catatan}
        onChangeText={setCatatan}
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
      
      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Submit Review
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
  segmented: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
  },
  button: {
    paddingVertical: 5,
  },
});
