import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Linking,
  Platform,
  ViewStyle,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface FooterProps {
  style?: ViewStyle;
  onPress?: () => void;
  version?: string;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const FostFooter: React.FC<FooterProps> = ({
  style,
  onPress,
  version = '1.0.0',
}) => {
  const heartScale = useSharedValue(1);
  const footerOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(30);
  const backgroundScale = useSharedValue(0.95);

  useEffect(() => {
    // Enhanced initial animation sequence
    footerOpacity.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.quad),
    });
    
    backgroundScale.value = withDelay(200, withSpring(1, {
      damping: 12,
      stiffness: 100,
    }));

    textTranslateY.value = withDelay(600, withSpring(0, {
      damping: 14,
      stiffness: 80,
    }));

    // Enhanced heart beat animation
    const pulseHeart = () => {
      heartScale.value = withSequence(
        withSpring(1.4, { damping: 3, stiffness: 400 }),
        withSpring(1, { damping: 5, stiffness: 400 }),
      );
      
      setTimeout(pulseHeart, 2500);
    };

    setTimeout(pulseHeart, 1000);
  }, []);

  const animatedHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const animatedFooterStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
    transform: [
      { translateY: textTranslateY.value },
      { scale: backgroundScale.value }
    ],
  }));

  const handlePress = () => {
    heartScale.value = withSequence(
      withSpring(1.6, { damping: 2, stiffness: 400 }),
      withSpring(1, { damping: 4, stiffness: 400 }),
    );
    
    onPress?.();
    Linking.openURL('https://fost.com').catch((err) => console.error('Error opening URL:', err));
  };

  return (
    <AnimatedTouchableOpacity
      style={[styles.container, style, animatedFooterStyle]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.gradientOverlay} />
      
      <View style={styles.badge}>
        <MaterialIcons name="verified" size={20} color="#4CAF50" />
        <ThemedText style={styles.badgeText}>Official App</ThemedText>
      </View>

      <View style={styles.content}>
        <ThemedText style={styles.text}>Made with</ThemedText>
        <Animated.View style={[styles.heartContainer, animatedHeartStyle]}>
          <MaterialIcons name="favorite" size={28} color="#ff4d4d" />
        </Animated.View>
        <ThemedText style={styles.text}>by</ThemedText>
        <ThemedText style={styles.fostText}>Fost</ThemedText>
      </View>

      {version && (
        <ThemedText style={styles.version}>Version {version}</ThemedText>
      )}
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    width: width,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: -3,
        },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 18,
    color: '#555',
    fontWeight: '500',
    marginHorizontal: 6,
    letterSpacing: 0.3,
  },
  heartContainer: {
    marginHorizontal: 4,
    transform: [{ translateY: -2 }],
  },
  fostText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fc8019',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  version: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    position: 'absolute',
    right: 16,
    top: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  badgeText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default FostFooter;