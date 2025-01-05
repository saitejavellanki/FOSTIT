import { Tabs } from 'expo-router';
import { useColorScheme, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { auth } from '../../components/firebase/firebase';
import React from 'react';
export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const [userPhotoURL, setUserPhotoURL] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser?.photoURL) {
      setUserPhotoURL(currentUser.photoURL);
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user?.photoURL) {
        setUserPhotoURL(user.photoURL);
      } else {
        setUserPhotoURL(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    
    <Tabs
      screenOptions={{
        
        tabBarActiveTintColor: '#fc8019',
        tabBarInactiveTintColor: colorScheme === 'dark' ? '#ffffff' : '#3d4152',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          
        },
        
      }}>
      <Tabs.Screen
      
        name="index"
        options={{
          title: 'Home',
          headerShown:false,
         
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}

      />
   
       <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown:false,
                    
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'person-sharp' : 'person-sharp'} size={24} color={color} />
          ),
        }}
      />

    </Tabs>
  );
}