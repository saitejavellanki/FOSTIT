import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Platform, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ShowcartProps {
  triggerAnimation?: boolean;
}

const Showcart: React.FC<ShowcartProps> = ({ triggerAnimation }) => {
  const [isCart, setIsCart] = useState(false);
  const [length, setLength] = useState(0);
  const insets = useSafeAreaInsets();
  const popupAnimation = useRef(new Animated.Value(1)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const previousLength = useRef(length);
  
  const TAB_BAR_HEIGHT = 60;
  const BOTTOM_SPACING = 16;
  
  // Calculate bottom offset based on device and safe area
  const bottomOffset = Platform.OS === 'ios' 
    ? TAB_BAR_HEIGHT + insets.bottom + BOTTOM_SPACING
    : TAB_BAR_HEIGHT + BOTTOM_SPACING;

  useEffect(() => {
    loadCartItems();
  }, []);

  useEffect(() => {
    const checkCartChanges = async () => {
      try {
        const cartString = await AsyncStorage.getItem('cart');
        if (cartString) {
          const cart = JSON.parse(cartString);
          const count = cart.reduce((total: number, item: any) => total + item.quantity, 0);
          setLength(count);
          setIsCart(count > 0);
        } else {
          setLength(0);
          setIsCart(false);
        }
      } catch (error) {
        console.error('Error checking cart:', error);
        setLength(0);
        setIsCart(false);
      }
    };

    const interval = setInterval(checkCartChanges, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (length > previousLength.current) {
      animateCart();
    }
    previousLength.current = length;
  }, [length]);

  useEffect(() => {
    if (triggerAnimation) {
      animateCart();
    }
  }, [triggerAnimation]);

  const animateCart = () => {
    scaleAnimation.setValue(1);
    Animated.sequence([
      Animated.spring(scaleAnimation, {
        toValue: 1.1,
        useNativeDriver: true,
        friction: 5,
        tension: 200
      }),
      Animated.spring(scaleAnimation, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
        tension: 200
      })
    ]).start();
  };

  const loadCartItems = async () => {
    try {
      const cartString = await AsyncStorage.getItem('cart');
      if (cartString) {
        const cart = JSON.parse(cartString);
        const count = cart.reduce((total: number, item: any) => total + item.quantity, 0);
        setLength(count);
        setIsCart(count > 0);
      } else {
        setLength(0);
        setIsCart(false);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setLength(0);
      setIsCart(false);
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

  if (!isCart || length === 0) return null;

  return (
    <Animated.View style={[
      styles.container, 
      { 
        bottom: bottomOffset,
        transform: [{ scale: scaleAnimation }]
      }
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
          <Ionicons name="close-circle" size={24} color="#FF5733" />
        </TouchableOpacity>

        <View style={styles.cartContent}>
          <View style={styles.leftContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="cart" size={20} color="#FF5733" />
            </View>
            <Text style={styles.viewCartText}>View Cart</Text>
          </View>
          
          <View style={styles.rightContent}>
            <Text style={styles.itemCount}>{length} {length === 1 ? 'item' : 'items'}</Text>
            <View style={styles.proceedContainer}>
              <Text style={styles.proceedText}>Proceed</Text>
              <Ionicons name="arrow-forward" size={18} color="#FF5733" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 99999,
    elevation: 99999,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  cartButton: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 87, 51, 0.1)',
  },
  clearButton: {
    position: 'absolute',
    left: -8,
    top: -8,
    zIndex: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  cartContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 87, 51, 0.1)',
    padding: 8,
    borderRadius: 8,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  viewCartText: {
    color: '#2D3436',
    fontSize: 15,
    fontWeight: '600',
  },
  itemCount: {
    color: '#636E72',
    fontSize: 13,
    marginBottom: 4,
  },
  proceedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  proceedText: {
    color: '#FF5733',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default Showcart;