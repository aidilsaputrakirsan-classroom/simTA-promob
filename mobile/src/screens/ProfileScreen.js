import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, Divider } from 'react-native-paper';
import { logout } from '../api/auth';

export default function ProfileScreen({ user, setUser }) {
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            await logout();
            setUser(null);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Card 
        style={styles.card}
        theme={{ colors: { surface: '#ffffff' } }}
      >
        <Card.Content>
          <Title style={styles.cardTitle}>Profile</Title>
          <Divider style={styles.divider} />
          
          <Paragraph style={styles.label}>Nama:</Paragraph>
          <Paragraph style={styles.value}>{user?.nama}</Paragraph>
          
          <Paragraph style={styles.label}>Email:</Paragraph>
          <Paragraph style={styles.value}>{user?.email}</Paragraph>
          
          <Paragraph style={styles.label}>Role:</Paragraph>
          <Paragraph style={styles.value}>{user?.role}</Paragraph>
          
          {user?.nim && (
            <>
              <Paragraph style={styles.label}>NIM:</Paragraph>
              <Paragraph style={styles.value}>{user.nim}</Paragraph>
            </>
          )}
          
          {user?.nip && (
            <>
              <Paragraph style={styles.label}>NIP:</Paragraph>
              <Paragraph style={styles.value}>{user.nip}</Paragraph>
            </>
          )}
        </Card.Content>
      </Card>
      
      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
        buttonColor="#F44336"
      >
        Logout
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
  card: {
    elevation: 2,
    backgroundColor: '#ffffff',
  },
  cardTitle: {
    color: '#2c3e50',
    fontSize: 22,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 15,
    backgroundColor: '#e0e0e0',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
    color: '#2c3e50',
    fontSize: 14,
  },
  value: {
    fontSize: 16,
    marginBottom: 5,
    color: '#4a4a4a',
  },
  logoutButton: {
    marginTop: 20,
    paddingVertical: 5,
  },
});
