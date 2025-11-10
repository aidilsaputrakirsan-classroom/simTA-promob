import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, Chip, Divider } from 'react-native-paper';
import { getTAById } from '../api/tugasAkhir';
import { getProposals } from '../api/proposals';

export default function TADetailScreen({ route, navigation, user }) {
  const { id } = route.params;
  const [ta, setTA] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const taData = await getTAById(id);
      const proposalData = await getProposals(id);
      setTA(taData);
      setProposals(proposalData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <View style={styles.container}><Paragraph>Loading...</Paragraph></View>;
  }

  const getStatusColor = (status) => {
    const colors = {
      draft: '#9E9E9E',
      diajukan: '#2196F3',
      disetujui: '#4CAF50',
      ditolak: '#F44336',
      selesai: '#FF9800',
      pending: '#FF9800',
      approved: '#4CAF50',
      rejected: '#F44336',
    };
    return colors[status] || '#9E9E9E';
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>{ta.judul}</Title>
          <Chip mode="flat" style={{ backgroundColor: getStatusColor(ta.status), alignSelf: 'flex-start', marginVertical: 10 }}>
            {ta.status}
          </Chip>
          
          <Paragraph style={styles.section}>{ta.deskripsi}</Paragraph>
          
          <Divider style={styles.divider} />
          
          {ta.mahasiswa && (
            <>
              <Paragraph style={styles.label}>Mahasiswa:</Paragraph>
              <Paragraph>{ta.mahasiswa.nama} ({ta.mahasiswa.nim})</Paragraph>
            </>
          )}
          
          {ta.dosen && (
            <>
              <Paragraph style={styles.label}>Dosen Pembimbing:</Paragraph>
              <Paragraph>{ta.dosen.nama} ({ta.dosen.nip})</Paragraph>
            </>
          )}
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title>Proposals</Title>
          {proposals.length === 0 ? (
            <Paragraph>Belum ada proposal</Paragraph>
          ) : (
            proposals.map((proposal) => (
              <View key={proposal.id} style={styles.proposalItem}>
                <Paragraph style={styles.fileName}>{proposal.file_name}</Paragraph>
                <Chip mode="flat" style={{ backgroundColor: getStatusColor(proposal.status) }}>
                  {proposal.status}
                </Chip>
                {proposal.catatan && (
                  <Paragraph style={styles.catatan}>Catatan: {proposal.catatan}</Paragraph>
                )}
                
                {user?.role === 'dosen' && proposal.status === 'pending' && (
                  <View style={styles.reviewButtons}>
                    <Button
                      mode="contained"
                      onPress={() => navigation.navigate('ReviewProposal', { proposalId: proposal.id })}
                      style={styles.reviewButton}
                    >
                      Review
                    </Button>
                  </View>
                )}
              </View>
            ))
          )}
        </Card.Content>
      </Card>
      
      {user?.role === 'mahasiswa' && user.id === ta.mahasiswa_id && (
        <Button
          mode="contained"
          onPress={() => navigation.navigate('UploadProposal', { taId: id })}
          style={styles.uploadButton}
        >
          Upload Proposal
        </Button>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 10,
    elevation: 2,
  },
  section: {
    marginTop: 10,
  },
  divider: {
    marginVertical: 15,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  proposalItem: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  fileName: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  catatan: {
    marginTop: 5,
    fontStyle: 'italic',
    color: '#666',
  },
  reviewButtons: {
    marginTop: 10,
  },
  reviewButton: {
    marginTop: 5,
  },
  uploadButton: {
    margin: 20,
    paddingVertical: 5,
  },
});