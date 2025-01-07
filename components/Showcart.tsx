import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const width = Dimensions.get('screen').width;

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  isActive: boolean;
  dietType: 'veg' | 'non-veg';
  shopId: string;
  vendorId: string;
}

interface CartItem extends MenuItem {
  quantity: number;
  shopName?: string;
}

const Showcart = () => {
  const [isCart, setIsCart] = useState(false);
  const [length, setLength] = useState(0);
  const insets = useSafeAreaInsets();

  // Calculate tab bar height
  const TAB_BAR_HEIGHT = 60;
  const bottomOffset = Platform.OS === 'ios' ? 
    TAB_BAR_HEIGHT + insets.bottom : 
    TAB_BAR_HEIGHT;

  useEffect(() => {
    loadCartItems();
  }, []);

  useEffect(() => {
    const getCartCount = async () => {
      try {
        const cartString = await AsyncStorage.getItem('cart');
        if (cartString) {
          const cart = JSON.parse(cartString);
          const count = cart.reduce((total: number, item: CartItem) => total + item.quantity, 0);
          setLength(count);
        }
      } catch (error) {
        console.error('Error getting cart count:', error);
      }
    };

    const interval = setInterval(getCartCount, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadCartItems = async () => {
    try {
      const cartString = await AsyncStorage.getItem('cart');
      if (cartString) {
        const cart = JSON.parse(cartString);
        const count = cart.reduce((total: number, item: CartItem) => total + item.quantity, 0);
        setLength(count);
        setIsCart(true);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const clearCart = async () => {
    Alert.alert(
      "Clear Cart",
      "Are you sure you want to clear your cart?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Clear",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('cart');
              setLength(0);
              setIsCart(false);
            } catch (error) {
              console.error('Error clearing cart:', error);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const cartPressed = () => {
    router.push('/Mis/cart');
  };

  if (length === 0) return null;

  return (
    <View style={[
      styles.container, 
      { bottom: bottomOffset + 16 } // Position above tab bar with padding
    ]}>
      <TouchableOpacity
        style={styles.cartButton}
        onPress={cartPressed}
        activeOpacity={0.8}
      >
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={clearCart}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-circle" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.cartContent}>
          <View style={styles.leftContent}>
            <Ionicons name="cart" size={24} color="#fff" />
            <Text style={styles.viewCartText}>View Cart</Text>
          </View>
          
          <View style={styles.rightContent}>
            <Text style={styles.itemCount}>{length} {length === 1 ? 'item' : 'items'}</Text>
            <View style={styles.proceedContainer}>
              <Text style={styles.proceedText}>Proceed</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 999,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    marginBottom:-36,
  },
  cartButton: {
    backgroundColor: '#fc8019',
    width: '100%',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  clearButton: {
    position: 'absolute',
    left: -12,
    top: -12,
    zIndex: 1,
    backgroundColor: '#fc8019',
    borderRadius: 14,
  },
  cartContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  viewCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  itemCount: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  proceedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  proceedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Showcart;