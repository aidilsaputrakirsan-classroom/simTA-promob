import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Title,
  Paragraph,
  Card,
  Button,
  Badge,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../api/notifications';

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications();
      setNotifications(response.data);
      setUnreadCount(response.unread_count);
    } catch (error) {
      console.error('Load notifications error:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
      Alert.alert('Success', 'All notifications marked as read');
    } catch (error) {
      console.error('Mark all as read error:', error);
      Alert.alert('Error', 'Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNotification(id);
              setNotifications((prev) => prev.filter((n) => n.id !== id));
              // Decrease unread count if notification was unread
              const deletedNotif = notifications.find((n) => n.id === id);
              if (deletedNotif && !deletedNotif.is_read) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
              }
            } catch (error) {
              console.error('Delete notification error:', error);
              Alert.alert('Error', 'Failed to delete notification');
            }
          },
        },
      ]
    );
  };

  const handleNotificationPress = (notification) => {
    // Mark as read
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.type === 'proposal_reviewed') {
      const { tugas_akhir_id } = notification.data || {};
      if (tugas_akhir_id) {
        navigation.navigate('TADetail', { taId: tugas_akhir_id });
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <Card
        style={[
          styles.notificationCard,
          !item.is_read && styles.unreadCard,
        ]}
      >
        <Card.Content>
          <View style={styles.notificationHeader}>
            <View style={styles.titleContainer}>
              <Paragraph style={styles.notificationTitle}>
                {item.title}
              </Paragraph>
              {!item.is_read && <Badge style={styles.unreadBadge} />}
            </View>
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleDelete(item.id)}
              iconColor="#e74c3c"
            />
          </View>
          <Paragraph style={styles.notificationMessage}>
            {item.message}
          </Paragraph>
          <Paragraph style={styles.notificationTime}>
            {formatDate(item.created_at)}
          </Paragraph>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Title style={styles.headerTitle}>Notifications</Title>
          {unreadCount > 0 && (
            <Paragraph style={styles.unreadText}>
              {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
            </Paragraph>
          )}
        </View>
        {unreadCount > 0 && (
          <Button
            mode="text"
            onPress={handleMarkAllAsRead}
            textColor="#3498db"
          >
            Mark all as read
          </Button>
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Paragraph style={styles.emptyText}>
            No notifications yet
          </Paragraph>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3498db']}
            />
          }
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  unreadText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  listContainer: {
    padding: 10,
  },
  notificationCard: {
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  unreadCard: {
    backgroundColor: '#e8f4f8',
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#3498db',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#4a4a4a',
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#95a5a6',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#95a5a6',
  },
});
