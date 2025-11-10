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
      <Card style={styles.card}>
        <Card.Content>
          <Title>Profile</Title>
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
  },
  divider: {
    marginVertical: 15,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
    color: '#666',
  },
  value: {
    fontSize: 16,
    marginBottom: 5,
  },
  logoutButton: {
    marginTop: 20,
    paddingVertical: 5,
  },
});