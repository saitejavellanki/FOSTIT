import React, { useEffect } from 'react';
import { Animated } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

const FadeInView = ({ children, duration = 500, style = {} }) => {
  const isFocused = useIsFocused();
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    if (isFocused) {
      // Reset the animation value to 0
      fadeAnim.setValue(0);
      // Start the fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: duration,
        useNativeDriver: true,
      }).start();
    }
  }, [isFocused]); // Run effect when focus changes

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          opacity: fadeAnim,
        },
        style,
      ]}>
      {children}
    </Animated.View>
  );
};

export default FadeInView;