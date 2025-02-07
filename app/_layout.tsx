import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { User } from 'firebase/auth';
import React from 'react';
import { auth } from '../components/firebase/firebase';
import {
  createUserWithEmailAndPassword,
      getAuth,
      signInWithEmailAndPassword,
      GoogleAuthProvider,
      signInWithPopup,
      initializeAuth,
      
    } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Create auth context
export const AuthContext = React.createContext({
  user: null as User | null,
  loading: true,
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();
  const auth = getAuth();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    
  });

  useEffect(() => {
    if (loaded) {
      UserCheck()
     
    }
  }, [loaded]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);


  const UserCheck = async ()=>{
    const users = await AsyncStorage.getItem('user');
    if (!users){
      return SplashScreen.hideAsync();
    }
    if (users){
    const ram =  JSON.parse(users)
   
     await signInWithEmailAndPassword(auth, ram.email, ram.password);
     router.replace('/');
     SplashScreen.hideAsync();
    
    }
  }
  useEffect(() => {
    
    if (authLoading || !loaded) return;

    const inAuthGroup = segments[0] === '(auth)';
    
   
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/welcome');
    } else if (user && inAuthGroup) {
      router.replace('/');
    }
  }, [user, authLoading, loaded, segments]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, loading: authLoading }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{headerShown:false, }}>
          <Stack.Screen name="(auth)" options={{headerShown:false}}  />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </AuthContext.Provider>
  );
}