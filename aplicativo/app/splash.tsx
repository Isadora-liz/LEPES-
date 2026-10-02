import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  View
} from 'react-native';

export default function Splash() {

  const escala = useRef(new Animated.Value(0.5)).current;
  const opacidade = useRef(new Animated.Value(0)).current;

  useEffect(() => {

    Animated.parallel([
      Animated.timing(escala, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),

      Animated.timing(opacidade, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace('/(tabs)/explorar');
    }, 2000);

    return () => clearTimeout(timer);

  }, []);

  return (
    <View style={styles.container}>

      <Animated.Image
        source={require('../assets/images/splash-icon.png')}
        style={[
          styles.logo,
          {
            opacity: opacidade,
            transform: [{ scale: escala }],
          },
        ]}
      />

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#119fb8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    width: 220,
    height: 220,
    resizeMode: 'contain',
  },

});