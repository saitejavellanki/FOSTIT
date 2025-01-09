// components/CartButton.tsx
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { styles } from '../app/Mis/styles';
import { CartItem } from '../app/Mis/types';

export const CartButton = ({navigation}) => {
  const [itemCount, setItemCount] = useState(0);

  useEffect(()=> {
    if(navigation.isFocused()){
      
      const hello = async()=>{
        const cartString = await AsyncStorage.getItem('cart');
        if (cartString) {
          const cart = JSON.parse(cartString);
          const count = cart.reduce((total: number, item: CartItem) => total + item.quantity, 0);
          setItemCount(count);
       
        }else{
          setItemCount(0)
         
        }
      
      }
      hello()
    
    }
  },[navigation.isFocused()])
  useEffect(() => {
    const getCartCount = async () => {
      try {
        const cartString = await AsyncStorage.getItem('cart');
        if (cartString) {
          const cart = JSON.parse(cartString);
          const count = cart.reduce((total: number, item: CartItem) => total + item.quantity, 0);
          setItemCount(count);
        }
      } catch (error) {
        console.error('Error getting cart count:', error);
      }
    };

    getCartCount();
    
    const interval = setInterval(getCartCount, 1000);
    return () => clearInterval(interval);
  }, []);

  return (

    <>
    {itemCount >0 && (
      <>
    <TouchableOpacity 
      style={styles.cartButton}
      onPress={() => router.push("/Mis/cart")}
    >
      <MaterialIcons name="shopping-cart" size={34} color="#fff" />
      {itemCount > 0 && (
        <View style={styles.badge}>
          <ThemedText style={styles.badgeText}>{itemCount}</ThemedText>
        </View>
      )}
    </TouchableOpacity>
      </>
    )}
    </>

  );
};