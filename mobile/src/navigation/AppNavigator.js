import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import CreateTAScreen from '../screens/CreateTAScreen';
import TADetailScreen from '../screens/TADetailScreen';
import UploadProposalScreen from '../screens/UploadProposalScreen';
import ReviewProposalScreen from '../screens/ReviewProposalScreen';
import ProfileScreen from '../screens/ProfileScreen';
import UsersScreen from '../screens/UsersScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import DocumentViewerScreen from '../screens/DocumentViewerScreen';
import { getUnreadCount } from '../api/notifications';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs({ user, setUser }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Load unread count error:', error);
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'bell' : 'bell-outline';
          } else if (route.name === 'Users') {
            iconName = focused ? 'account-group' : 'account-group-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          }

          // Show badge for notifications
          if (route.name === 'Notifications' && unreadCount > 0) {
            return (
              <View>
                <MaterialCommunityIcons name={iconName} size={size} color={color} />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              </View>
            );
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen
        name="Home"
        options={{ title: 'Tugas Akhir' }}
      >
        {(props) => <HomeScreen {...props} user={user} />}
      </Tab.Screen>

      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications', headerShown: false }}
        listeners={{
          tabPress: () => {
            // Reset badge when user opens notifications
            setTimeout(() => setUnreadCount(0), 1000);
          },
        }}
      />

      {user?.role === 'admin' && (
        <Tab.Screen
          name="Users"
          component={UsersScreen}
          options={{ title: 'Users' }}
        />
      )}

      <Tab.Screen
        name="Profile"
      >
        {(props) => <ProfileScreen {...props} user={user} setUser={setUser} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function AppNavigator({ user, setUser }) {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          <>
            <Stack.Screen name="Login" options={{ headerShown: false }}>
              {(props) => <LoginScreen {...props} setUser={setUser} />}
            </Stack.Screen>
            <Stack.Screen name="Register" options={{ title: 'Register' }}>
              {(props) => <RegisterScreen {...props} setUser={setUser} />}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen 
              name="Main" 
              options={{ headerShown: false }}
            >
              {(props) => <HomeTabs {...props} user={user} setUser={setUser} />}
            </Stack.Screen>
            
            <Stack.Screen 
              name="CreateTA" 
              component={CreateTAScreen}
              options={{ title: 'Buat Tugas Akhir' }}
            />
            
            <Stack.Screen 
              name="TADetail"
              options={{ title: 'Detail Tugas Akhir' }}
            >
              {(props) => <TADetailScreen {...props} user={user} />}
            </Stack.Screen>
            
            <Stack.Screen 
              name="UploadProposal" 
              component={UploadProposalScreen}
              options={{ title: 'Upload Proposal' }}
            />
            
            <Stack.Screen
              name="ReviewProposal"
              component={ReviewProposalScreen}
              options={{ title: 'Review Proposal' }}
            />

            <Stack.Screen
              name="DocumentViewer"
              component={DocumentViewerScreen}
              options={{ title: 'View Document' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -8,
    top: -4,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});