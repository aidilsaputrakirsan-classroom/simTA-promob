import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Button, FAB, Chip } from 'react-native-paper';
import { getTugasAkhir } from '../api/tugasAkhir';

export default function HomeScreen({ navigation, user }) {
  const [tugasAkhir, setTugasAkhir] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getTugasAkhir();
      setTugasAkhir(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      draft: '#9E9E9E',
      diajukan: '#2196F3',
      disetujui: '#4CAF50',
      ditolak: '#F44336',
      selesai: '#FF9800',
    };
    return colors[status] || '#9E9E9E';
  };

  const renderItem = ({ item }) => (
    <Card 
      style={styles.card} 
      onPress={() => navigation.navigate('TADetail', { id: item.id })}
      theme={{ colors: { surface: '#ffffff' } }}
    >
      <Card.Content>
        <Title style={styles.cardTitle}>{item.judul}</Title>
        <Paragraph style={styles.cardDescription} numberOfLines={2}>
          {item.deskripsi}
        </Paragraph>
        
        <View style={styles.infoRow}>
          <Chip 
            mode="flat" 
            style={{ backgroundColor: getStatusColor(item.status) }}
            textStyle={styles.chipText}
          >
            {item.status}
          </Chip>
        </View>
        
        {item.mahasiswa && (
          <Paragraph style={styles.subtitle}>
            Mahasiswa: {item.mahasiswa.nama}
          </Paragraph>
        )}
        
        {item.dosen && (
          <Paragraph style={styles.subtitle}>
            Dosen: {item.dosen.nama}
          </Paragraph>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={tugasAkhir}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Paragraph style={styles.emptyText}>Belum ada tugas akhir</Paragraph>
          </View>
        }
      />
      
      {user?.role === 'mahasiswa' && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate('CreateTA')}
        />
      )}
    </View>
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
    backgroundColor: '#ffffff',
  },
  cardTitle: {
    color: '#2c3e50',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardDescription: {
    color: '#4a4a4a',
    marginTop: 5,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 5,
  },
  chipText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  empty: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#3498db',
  },
});
