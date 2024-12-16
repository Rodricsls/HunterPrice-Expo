import React, { useEffect, useState } from 'react';
import { View, Image, Text, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';

const SplashScreen = () => {
  const [screenIndex, setScreenIndex] = useState(0);
  const [offsetX] = useState(new Animated.Value(0));
  const router = useRouter();

  const splashImages = [
    require('../../assets/images/splash1.png'),
    require('../../assets/images/splash2.png'),
    require('../../assets/images/splash3.png'),
  ];

  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    if (screenIndex < splashImages.length) {
      const timer = setTimeout(() => {
        Animated.timing(offsetX, {
          toValue: -(screenIndex + 1) * width,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setScreenIndex((prevIndex) => prevIndex + 1);
        });
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      router.replace('/(tabs)/home' as const);
    }
  }, [screenIndex]);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right' && screenIndex > 0) {
      Animated.timing(offsetX, {
        toValue: -(screenIndex - 1) * width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setScreenIndex(screenIndex - 1));
    } else if (direction === 'left' && screenIndex < splashImages.length - 1) {
      Animated.timing(offsetX, {
        toValue: -(screenIndex + 1) * width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setScreenIndex(screenIndex + 1));
    }
  };

  const handleSkip = () => {
    router.replace('/home'as const);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PanGestureHandler
        onGestureEvent={(e) => {
          if (e.nativeEvent.translationX > 50) {
            handleSwipe('right');
          } else if (e.nativeEvent.translationX < -50) {
            handleSwipe('left');
          }
        }}
      >
        <View style={{ flex: 1, backgroundColor: '#fff', overflow: 'hidden' }}>
          <Animated.View
            style={{
              flexDirection: 'row',
              width: splashImages.length * width,
              transform: [{ translateX: offsetX }],
            }}
          >
            {splashImages.map((image, index) => (
              <Image
                key={index}
                source={image}
                style={{ width, height }}
                resizeMode="cover" // Ensures the image fills the entire screen
              />
            ))}
          </Animated.View>

          <TouchableOpacity
            onPress={handleSkip}
            style={{
              position: 'absolute',
              bottom: 50,
              right: 20,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              padding: 10,
              borderRadius: 5,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16 }}>Skip</Text>
          </TouchableOpacity>
        </View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

export default SplashScreen;
