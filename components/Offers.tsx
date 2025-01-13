import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Share,
  ActivityIndicator,
  Platform,
  Clipboard
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { firestore } from '@/components/firebase/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';

interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderAmount: number;
  maxDiscount: number;
  validUntil: Timestamp;
  validFrom: Timestamp;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
  metadata: {
    campaign: string;
    source: string;
  };
  categories: string[];
  excludedProducts: string[];
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const OfferCard: React.FC<{
  coupon: Coupon;
  index: number;
  onPress: () => void;
}> = ({ coupon, index, onPress }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const translateX = React.useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const daysLeft = Math.ceil((coupon.validUntil.toDate().getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysLeft <= 3;

  return (
    <AnimatedTouchableOpacity
      style={[
        styles.offerCard,
        {
          opacity: fadeAnim,
          transform: [{ translateX }],
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#FF8C00', '#FF6B6B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />
      
      <View style={styles.offerContent}>
        <View style={styles.leftContent}>
          <View style={styles.discountBadge}>
            <ThemedText style={styles.discountText}>
              {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
            </ThemedText>
            <ThemedText style={styles.discountSubtext}>OFF</ThemedText>
          </View>
        </View>

        <View style={styles.rightContent}>
          <ThemedText style={styles.code}>{coupon.code}</ThemedText>
          <ThemedText style={styles.details}>Min ₹{coupon.minimumOrderAmount}</ThemedText>
          {isExpiringSoon && (
            <ThemedText style={styles.expiryText}>
              {daysLeft === 0 ? 'Expires today' : `${daysLeft}d left`}
            </ThemedText>
          )}
        </View>
      </View>
    </AnimatedTouchableOpacity>
  );
};

const OffersSection: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCoupons = async () => {
    try {
      const couponsRef = collection(firestore, 'coupons');
      const q = query(
        couponsRef,
        where('isActive', '==', true),
        where('validUntil', '>', Timestamp.now())
      );

      const querySnapshot = await getDocs(q);
      const fetchedCoupons: Coupon[] = [];
      
      querySnapshot.forEach((doc) => {
        fetchedCoupons.push({
          id: doc.id,
          ...doc.data()
        } as Coupon);
      });

      setCoupons(fetchedCoupons.sort((a, b) => 
        b.validUntil.toDate().getTime() - a.validUntil.toDate().getTime()
      ));
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCouponPress = async (coupon: Coupon) => {
    try {
      await Clipboard.setString(coupon.code);
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Share.share({
          message: `${coupon.code}`,
        });
      }
    } catch (error) {
      console.error('Error sharing coupon:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FC8019" />
      </View>
    );
  }

  if (coupons.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="local-offer" size={60} color="#ddd" />
        <ThemedText style={styles.emptyTitle}>No Active Offers</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Available Offers</ThemedText>
      </View>

      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.offersContainer}
      >
        {coupons.map((coupon, index) => (
          <OfferCard
            key={coupon.id}
            coupon={coupon}
            index={index}
            onPress={() => handleCouponPress(coupon)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f8f8',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  offersContainer: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  offerCard: {
    width: 200,
    height: 80,
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  gradientBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  offerContent: {
    flexDirection: 'row',
    padding: 8,
    height: '100%',
  },
  leftContent: {
    justifyContent: 'center',
    marginRight: 8,
  },
  rightContent: {
    flex: 1,
    justifyContent: 'center',
  },
  discountBadge: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
  },
  discountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  discountSubtext: {
    fontSize: 8,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  code: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  details: {
    fontSize: 10,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 2,
  },
  expiryText: {
    fontSize: 9,
    color: '#fff',
    opacity: 0.8,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
});

export default OffersSection;