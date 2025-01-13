import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons } from '@expo/vector-icons';
import { firestore } from '../components/firebase/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import ConfettiCannon from 'react-native-confetti-cannon';

interface CouponComponentProps {
  totalAmount: number;
  onApplyCoupon: (discount: number) => void;
  onRemoveCoupon: () => void;
}

interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderAmount: number;
  maxDiscount: number;
  usageLimit: number;
  usageCount: number;
  userLimit: number;
  validFrom: Timestamp;
  validUntil: Timestamp;
  isActive: boolean;
  categories?: string[];
  excludedProducts?: string[];
}

const SavingsPopup: React.FC<{ visible: boolean; amount: number; onClose: () => void }> = ({
  visible,
  amount,
  onClose
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => onClose());
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible}>
      <View style={styles.popupOverlay}>
        <Animated.View style={[styles.popupContent, { opacity: fadeAnim }]}>
          <MaterialIcons name="savings" size={32} color="#48c479" />
          <ThemedText style={styles.savingsText}>
            Yay! You saved ₹{amount}
          </ThemedText>
        </Animated.View>
      </View>
    </Modal>
  );
};

const CouponComponent: React.FC<CouponComponentProps> = ({
  totalAmount,
  onApplyCoupon,
  onRemoveCoupon,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [savedAmount, setSavedAmount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const calculateDiscount = (coupon: Coupon): number => {
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (totalAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }
    return Math.min(discount, totalAmount);
  };

  const validateCoupon = async (code: string) => {
    if (!code.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const couponsRef = collection(firestore, 'coupons');
      const q = query(
        couponsRef,
        where('code', '==', code.toUpperCase()),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setError('Invalid coupon code');
        return;
      }

      const couponData = querySnapshot.docs[0].data() as Coupon;
      const now = Timestamp.now();

      // Validation checks
      if (now < couponData.validFrom) {
        setError('Coupon is not yet valid');
        return;
      }

      if (now > couponData.validUntil) {
        setError('Coupon has expired');
        return;
      }

      if (couponData.usageCount >= couponData.usageLimit) {
        setError('Coupon usage limit exceeded');
        return;
      }

      if (totalAmount < couponData.minimumOrderAmount) {
        setError(`Minimum order amount should be ₹${couponData.minimumOrderAmount}`);
        return;
      }

      // Calculate and apply discount
      const discount = calculateDiscount(couponData);
      if (discount <= 0) {
        setError('Unable to apply discount');
        return;
      }

      setAppliedCoupon(couponData);
      onApplyCoupon(discount);
      setSavedAmount(discount);
      setShowPopup(true);
      setShowConfetti(true);
      
    } catch (error) {
      console.error('Error validating coupon:', error);
      setError('Failed to validate coupon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    onRemoveCoupon();
  };

  const getDiscountText = (coupon: Coupon): string => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% off${coupon.maxDiscount ? ` up to ₹${coupon.maxDiscount}` : ''}`;
    }
    return `₹${coupon.discountValue} off`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter coupon code"
          value={couponCode}
          onChangeText={setCouponCode}
          autoCapitalize="characters"
          editable={!appliedCoupon}
        />
        {loading ? (
          <ActivityIndicator style={styles.loadingIndicator} color="#0066cc" />
        ) : appliedCoupon ? (
          <TouchableOpacity onPress={removeCoupon} style={styles.removeButton}>
            <MaterialIcons name="close" size={24} color="#ff4d4d" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => validateCoupon(couponCode)}
            style={styles.applyButton}
          >
            <ThemedText style={styles.applyButtonText}>Apply</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={16} color="#ff4d4d" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      )}

      {appliedCoupon && (
        <View style={styles.appliedCouponContainer}>
          <MaterialIcons name="check-circle" size={20} color="#48c479" />
          <View style={styles.appliedCouponTextContainer}>
            <ThemedText style={styles.appliedCouponText}>
              Coupon applied successfully!
            </ThemedText>
            <ThemedText style={styles.discountText}>
              {getDiscountText(appliedCoupon)}
            </ThemedText>
          </View>
        </View>
      )}

      <SavingsPopup
        visible={showPopup}
        amount={savedAmount}
        onClose={() => setShowPopup(false)}
      />

      {showConfetti && (
        <ConfettiCannon
          count={50}
          origin={{ x: -10, y: 0 }}
          autoStart={true}
          fadeOut={true}
          onAnimationEnd={() => setShowConfetti(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  applyButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  removeButton: {
    padding: 8,
  },
  loadingIndicator: {
    marginHorizontal: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    color: '#ff4d4d',
    marginLeft: 4,
    fontSize: 14,
  },
  appliedCouponContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9eb',
    padding: 12,
    borderRadius: 4,
    marginTop: 8,
  },
  appliedCouponTextContainer: {
    marginLeft: 8,
  },
  appliedCouponText: {
    color: '#48c479',
    fontWeight: '600',
  },
  discountText: {
    color: '#666',
    fontSize: 14,
    marginTop: 2,
  },
  popupOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  popupContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  savingsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#48c479',
    marginTop: 8,
  },
});

export default CouponComponent;