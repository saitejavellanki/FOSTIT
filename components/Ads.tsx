import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
  SafeAreaView,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_HEIGHT * 0.25; // Reduced from 0.35 to 0.25 to make boxes smaller

// Built-in advertisement data
const SAMPLE_ADS = [
  {
    id: '1',
    imageUrl: 'https://picsum.photos/800/400',
    title: 'Special Offer',
    description: 'Get 50% off on all products',
    ctaText: 'Shop Now',
    link: 'https://example.com/offer1',
    gradient: ['#FF6B6B', '#FFE66D'],
  },
  {
    id: '2',
    imageUrl: 'https://picsum.photos/800/400',
    title: 'New Collection',
    description: 'Check out our latest arrivals',
    ctaText: 'View More',
    link: 'https://example.com/collection',
    gradient: ['#4ECDC4', '#556270'],
  },
  {
    id: '3',
    imageUrl: 'https://picsum.photos/800/400',
    title: 'Limited Time Deal',
    description: 'Flash sale ending soon',
    ctaText: 'Buy Now',
    link: 'https://example.com/deal',
    gradient: ['#FF8C42', '#FF3C38'],
  },
];

const Ads = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slideRef = useRef<any>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % SAMPLE_ADS.length;
      slideRef.current?.scrollTo({
        x: nextIndex * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }, 4000);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleMomentumScrollEnd = (event: any) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(newIndex);
  };

  const handleAdPress = (link: string) => {
    Linking.openURL(link).catch((err) => console.error('Error opening URL:', err));
  };

  const getCardAnimation = (index: number) => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.7, 1, 0.7],
      extrapolate: 'clamp',
    });

    return { scale, opacity };
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Animated.ScrollView
          ref={slideRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToInterval={SCREEN_WIDTH}
        >
          {SAMPLE_ADS.map((ad, index) => {
            const { scale, opacity } = getCardAnimation(index);
            return (
              <Animated.View
                key={ad.id}
                style={[
                  styles.slideContainer,
                  {
                    transform: [{ scale }],
                    opacity,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.slide}
                  onPress={() => handleAdPress(ad.link)}
                  activeOpacity={0.95}
                >
                  <Image
                    source={{ uri: ad.imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                  <View style={styles.overlay} />
                  <View style={styles.textContainer}>
                    <View style={styles.contentWrapper}>
                      <Text style={styles.title}>{ad.title}</Text>
                      <Text style={styles.description}>{ad.description}</Text>
                      <TouchableOpacity
                        style={styles.ctaButton}
                        onPress={() => handleAdPress(ad.link)}
                      >
                        <Text style={styles.ctaText}>{ad.ctaText}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </Animated.ScrollView>

        <View style={styles.pagination}>
          {SAMPLE_ADS.map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive,
                {
                  transform: [
                    {
                      scale: scrollX.interpolate({
                        inputRange: [
                          (index - 1) * SCREEN_WIDTH,
                          index * SCREEN_WIDTH,
                          (index + 1) * SCREEN_WIDTH,
                        ],
                        outputRange: [1, 1.4, 1],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    height: CARD_HEIGHT,
    marginVertical: 10,
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 15,
  },
  slide: {
    height: CARD_HEIGHT - 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
  },
  textContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(10px)',
  },
  contentWrapper: {
    marginBottom: Platform.OS === 'ios' ? 10 : 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  ctaButton: {
    backgroundColor: '#ff8500',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-start',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  ctaText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 122, 255, 0.3)',
    marginHorizontal: 4,
    transition: 'all 0.3s ease',
  },
  paginationDotActive: {
    backgroundColor: '#ff8500',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default Ads;