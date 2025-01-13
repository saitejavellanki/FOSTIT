import React, { useEffect, useState } from 'react';
import { View, Animated, Easing, StyleSheet, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { firestore } from '../../components/firebase/firebase'; // Ensure this path matches your Firebase config file

interface OrderSuccessScreenProps {
  onAnimationComplete: () => void;
  accentColor?: string;
  backgroundColor?: string;
}

interface CheckIconProps {
  color: string;
  size: number;
  strokeWidth: number;
}

const CheckIcon: React.FC<CheckIconProps> = ({ color, size, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 6L9 17L4 12" />
  </Svg>
);

const OrderSuccessScreen: React.FC<OrderSuccessScreenProps> = ({ 
  onAnimationComplete,
  accentColor = '#22c55e',
  backgroundColor = '#dcfce7',
}) => {
  // Animation values
  const [animation] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scale] = useState(new Animated.Value(0.3));
  const [rippleAnim] = useState(new Animated.Value(0));
  const [confettiAnim] = useState(new Animated.Value(0));
  const [counterAnim] = useState(new Animated.Value(0));
  const [displayNumber, setDisplayNumber] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    const fetchTodayOrders = async () => {
      try {
        // Get today's start and end timestamps
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const startOfDay = Timestamp.fromDate(today);
        const endOfDay = Timestamp.fromDate(tomorrow);

        // Create query to get today's orders
        const ordersRef = collection(firestore, 'orders');
        const q = query(
          ordersRef,
          where('createdAt', '>=', startOfDay),
          where('createdAt', '<', endOfDay)
        );

        // Execute query
        const querySnapshot = await getDocs(q);
        const orderCount = querySnapshot.size;
        setTotalOrders(orderCount);
        
        // Start animations after getting the count
        startAnimations(orderCount);
      } catch (error) {
        console.error('Error fetching orders:', error);
        // Start animations with 0 as fallback
        startAnimations(0);
      }
    };

    fetchTodayOrders();
  }, []);

  const startAnimations = (orderCount: number) => {
    // Counter animation listener
    counterAnim.addListener(({ value }) => {
      setDisplayNumber(Math.floor(value));
    });

    // Main animation sequence
    Animated.sequence([
      // Initial fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      // Scale up with bounce
      Animated.spring(scale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      // Parallel animations
      Animated.parallel([
        Animated.timing(animation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(rippleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(counterAnim, {
          toValue: orderCount,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]),
    ]).start(() => {
      setTimeout(onAnimationComplete, 1500);
    });

    return () => {
      counterAnim.removeAllListeners();
    };
  };

  // Animation interpolations
  const checkmarkTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  const checkmarkOpacity = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.4, 0.2, 0],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.animatedContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale }]
          }
        ]}
      >
        {/* Ripple effect */}
        <Animated.View
          style={[
            styles.ripple,
            {
              backgroundColor,
              transform: [{ scale: rippleScale }],
              opacity: rippleOpacity,
            }
          ]}
        />

        {/* Main circle with checkmark */}
        <View style={[styles.circleContainer, { backgroundColor }]}>
          <Animated.View
            style={[
              styles.checkmarkContainer,
              {
                transform: [{ translateY: checkmarkTranslateY }],
                opacity: checkmarkOpacity,
              }
            ]}
          >
            <CheckIcon color={accentColor} size={48} strokeWidth={3} />
          </Animated.View>
        </View>

        {/* Text content */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: animation,
              transform: [
                {
                  translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            }
          ]}
        >
          <Animated.Text style={styles.title}>
            Order Received!
          </Animated.Text>
          <Animated.Text style={styles.subtitle}>
            Your order has been successfully placed
          </Animated.Text>
          
          {/* Order counter */}
          <Animated.View style={styles.counterContainer}>
            <Animated.Text style={styles.counterText}>
             {displayNumber} Orders
            </Animated.Text>
            <Text style={styles.counterSubtext}>
              placed today
            </Text>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  animatedContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  ripple: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    top: -12,
  },
  circleContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  checkmarkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 22,
    marginBottom: 16,
  },
  counterContainer: {
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  counterText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  counterSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default OrderSuccessScreen;