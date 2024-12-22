import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const { width } = Dimensions.get('window');

const LoadingScreen = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    shimmer.start();
    pulse.start();

    return () => {
      shimmer.stop();
      pulse.stop();
    };
  }, []);

  const AnimatedBlock = ({ style, delay = 0 }: { style?: any; delay?: number }) => {
    const translateX = shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-width, width],
    });

    return (
      <Animated.View
        style={[
          style,
          {
            opacity: pulseAnim,
            backgroundColor: '#E5E7EB',
            overflow: 'hidden',
          },
        ]}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              transform: [{ translateX }],
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
            },
          ]}
        />
      </Animated.View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Shop Header Skeleton */}
      <View style={styles.headerContainer}>
        <AnimatedBlock style={styles.headerImage} />
        <View style={styles.headerOverlay}>
          <AnimatedBlock style={styles.headerTitleBlock} />
          <AnimatedBlock style={styles.headerSubtitleBlock} />
        </View>
      </View>

      {/* Content Container */}
      <View style={styles.content}>
        {/* Categories */}
        <View style={styles.categoryContainer}>
          {[1, 2, 3].map((item) => (
            <AnimatedBlock key={`cat-${item}`} style={styles.categoryBlock} />
          ))}
        </View>

        {/* Menu Items Skeleton */}
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.menuItem}>
            <AnimatedBlock style={styles.menuImage} />
            <View style={styles.menuContent}>
              <AnimatedBlock style={styles.menuTitleBlock} />
              <AnimatedBlock style={styles.menuDescriptionBlock} />
              <View style={styles.menuFooter}>
                <AnimatedBlock style={styles.menuPriceBlock} />
                <AnimatedBlock style={styles.menuButtonBlock} />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Loading Indicator */}
      <View style={styles.loadingContainer}>
        <View style={styles.loadingDots}>
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  opacity: pulseAnim.interpolate({
                    inputRange: [0.85, 1],
                    outputRange: [0.3, 0.7],
                  }),
                  transform: [
                    {
                      scale: pulseAnim.interpolate({
                        inputRange: [0.85, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
        <ThemedText style={styles.loadingText}>Loading menu</ThemedText>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    height: 200,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#E5E7EB',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerTitleBlock: {
    height: 28,
    width: width * 0.6,
    borderRadius: 6,
    marginBottom: 8,
  },
  headerSubtitleBlock: {
    height: 20,
    width: width * 0.4,
    borderRadius: 4,
  },
  content: {
    padding: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  categoryBlock: {
    height: 32,
    width: 100,
    borderRadius: 16,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  menuImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  menuContent: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  menuTitleBlock: {
    height: 24,
    width: '85%',
    borderRadius: 4,
    marginBottom: 8,
  },
  menuDescriptionBlock: {
    height: 32,
    width: '70%',
    borderRadius: 4,
    marginBottom: 12,
  },
  menuFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuPriceBlock: {
    height: 20,
    width: 80,
    borderRadius: 4,
  },
  menuButtonBlock: {
    height: 32,
    width: 80,
    borderRadius: 6,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6B7280',
    marginHorizontal: 4,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default LoadingScreen;