import React, { useState } from 'react';
import { 
  Animated, 
  StyleSheet, 
  RefreshControl, 
  ScrollView,
  View,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  scrollViewProps?: any;
  refreshing: boolean;
}

export const PullToRefreshScrollView: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  scrollViewProps,
  refreshing
}) => {
  const [pullAnimation] = useState(new Animated.Value(0));

  // Simple scaling effect for the content
  const contentScale = pullAnimation.interpolate({
    inputRange: [-100, 0],
    outputRange: [0.98, 1],
    extrapolate: 'clamp'
  });

  // Opacity for the refresh icon
  const iconOpacity = pullAnimation.interpolate({
    inputRange: [-50, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  return (
    <Animated.ScrollView
      {...scrollViewProps}
      style={styles.scrollView}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: pullAnimation } } }],
        { useNativeDriver: true }
      )}
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#FC8019"
          colors={['#FC8019']}
          progressBackgroundColor="#fff"
          progressViewOffset={-15}
          style={styles.refreshControl}
        />
      }
    >
      <Animated.View 
        style={[
          styles.refreshContainer,
          {
            opacity: iconOpacity
          }
        ]}
      >
        <MaterialIcons name="refresh" size={24} color="#FC8019" />
      </Animated.View>

      <Animated.View
        style={[
          styles.contentContainer,
          {
            transform: [{ scale: contentScale }]
          }
        ]}
      >
        {children}
      </Animated.View>
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flex: 1,
  },
  refreshContainer: {
    height: 40,
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  refreshControl: {
    backgroundColor: 'transparent',
  }
});

export default PullToRefreshScrollView;