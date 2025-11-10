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
      />
      
      <TextInput
        label="Catatan (opsional)"
        value={catatan}
        onChangeText={setCatatan}
        mode="outlined"
        style={styles.input}
        multiline
        numberOfLines={4}
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
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  segmented: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 20,
  },
  button: {
    paddingVertical: 5,
  },
});