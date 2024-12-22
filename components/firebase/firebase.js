import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKvWp2fvwRgoSoLKPHXlS0zpL9z0wjZHE",
  authDomain: "rentals-5085c.firebaseapp.com",
  projectId: "rentals-5085c",
  storageBucket: "rentals-5085c.appspot.com",
  messagingSenderId: "649476082243",
  appId: "1:649476082243:web:6c47a0fb65d72e5ac5a2f6"
};

// Initialize Firebase
let app;
let auth;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  // Initialize auth without persistence for now
  auth = getAuth(app);
} else {
  app = getApp();
  auth = getAuth(app);
}

// Initialize Firestore and Storage
const firestore = getFirestore(app);
const storage = getStorage(app);

// Get current user with additional data
const getCurrentUser = async () => {
  const user = auth.currentUser;
  if (user) {
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();
      return {
        uid: user.uid,
        email: user.email,
        role: userData?.role || 'customer',
        shopId: userData?.shopId || null
      };
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  }
  return null;
};

export { app, auth, firestore, storage, getCurrentUser };