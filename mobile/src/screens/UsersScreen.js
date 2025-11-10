import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, FAB, Chip } from 'react-native-paper';
import { getAllUsers, deleteUser } from '../api/users';

export default function UsersScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = (userId, userName) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(userId);
              loadUsers();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.error || 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const getRoleColor = (role) => {
    const colors = {
      mahasiswa: '#2196F3',
      dosen: '#4CAF50',
      admin: '#FF9800',
    };
    return colors[role] || '#9E9E9E';
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Title>{item.nama}</Title>
          <Chip mode="flat" style={{ backgroundColor: getRoleColor(item.role) }}>
            {item.role}
          </Chip>
        </View>
        
        <Paragraph>{item.email}</Paragraph>
        {item.nim && <Paragraph>NIM: {item.nim}</Paragraph>}
        {item.nip && <Paragraph>NIP: {item.nip}</Paragraph>}
        
        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={() => handleDelete(item.id, item.nama)}
            textColor="#F44336"
          >
            Delete
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={loadUsers}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Paragraph>No users found</Paragraph>
          </View>
        }
      />
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  empty: {
    padding: 20,
    alignItems: 'center',
  },
});