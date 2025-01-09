import { Tabs } from 'expo-router';
import { useColorScheme, Image, Platform, ActivityIndicator, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { auth } from '../../components/firebase/firebase';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { createUserWithEmailAndPassword,  getAuth, updateCurrentUser, updateProfile, updatePhoneNumber } from 'firebase/auth';
export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const [userPhotoURL, setUserPhotoURL] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
const auth = getAuth()  
const [loading, setLoading] = useState<Boolean>(false);
const [auths, setAuths] = useState<string | null>(null);
useEffect(()=>{
const getuser = async ()=>{
const ram:any = await AsyncStorage.getItem('auth')
const hello = JSON.parse(ram)
if(ram){

  const currentUser = auth.currentUser;

  await updateProfile(currentUser,{displayName:hello.name})


  await AsyncStorage.removeItem('auth')
 setLoading(true)
}else{
  setLoading(true)
}



}
getuser()
},[])
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
    <>
    {!loading && (
      <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
        <Text style={{fontSize:20, fontWeight:'600', color:'#fc8019'}}>
          Loading, please wait
        </Text>
      <ActivityIndicator size={46} color='#fc8019' />
      </View>
    )}
    {loading && (
      <>
      <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#fc8019',
        tabBarInactiveTintColor: colorScheme === 'dark' ? '#ffffff' : '#3d4152',
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: Math.max(8, insets.bottom),
          paddingTop: 8,
          backgroundColor: colorScheme === 'dark' ? '#1c1c1c' : '#ffffff',
          borderTopColor: colorScheme === 'dark' ? '#2c2c2c' : '#f0f0f0',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowOffset: {
            width: 0,
            height: -2,
          },
        },
        tabBarItemStyle: {
          paddingBottom: Platform.OS === 'ios' ? (insets.bottom > 0 ? 0 : 8) : 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
              style={{ marginTop: 4 }}
            />
          ),
          
        freezeOnBlur:true
          
        }}
        
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'person-sharp' : 'person-outline'}
              size={24}
              color={color}
              style={{ marginTop: 4 }}
            />
          ),
        }}
      />
    </Tabs>
      </>
    )}
    </>
    
  );
}