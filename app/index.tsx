// app/index.tsx
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Animated,
  Easing,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";

const ACCENT = "#ffd34d";

/* Saiz besar */
const COMP1_SIZE = 280;
const COMP2_SIZE = 320;
const LOGO_SIZE  = 132;

export default function Splash() {
  const router = useRouter();

  const comp1T = useRef(new Animated.ValueXY({ x: -50, y: -40 })).current;
  const comp1R = useRef(new Animated.Value(0)).current;
  const comp1O = useRef(new Animated.Value(0)).current;

  const comp2T = useRef(new Animated.ValueXY({ x: 50, y: 40 })).current;
  const comp2R = useRef(new Animated.Value(0)).current;
  const comp2O = useRef(new Animated.Value(0)).current;

  const logoS = useRef(new Animated.Value(0.7)).current;
  const logoO = useRef(new Animated.Value(0)).current;

  const titleO = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(comp1T, { toValue: { x: 0, y: 0 }, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(comp1R, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(comp1O, { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),

      Animated.timing(comp2T, { toValue: { x: 0, y: 0 }, duration: 700, delay: 100, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(comp2R, { toValue: 1, duration: 700, delay: 100, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(comp2O, { toValue: 1, duration: 500, delay: 100, easing: Easing.out(Easing.quad), useNativeDriver: true }),

      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.spring(logoS, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
          Animated.timing(logoO, { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]),
      ]),

      Animated.sequence([
        Animated.delay(600),
        Animated.timing(titleO, { toValue: 1, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
    ]).start();

    const t = setTimeout(() => {
      router.replace("/(auth)/login");
    }, 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("../assets/images/image_1.png")}
        style={styles.bg}
        imageStyle={{ resizeMode: "cover" }}
      >
        {/* component_1 (atas kiri) */}
        <Animated.Image
          source={require("../assets/images/component_1.png")}
          style={[
            styles.comp1,
            {
              opacity: comp1O,
              transform: [
                { translateX: comp1T.x },
                { translateY: comp1T.y },
                { rotate: comp1R.interpolate({ inputRange: [0, 1], outputRange: ["-6deg", "0deg"] }) },
              ],
            },
          ]}
          resizeMode="contain"
        />

        {/* component_2 (bawah kanan) */}
        <Animated.Image
          source={require("../assets/images/component_2.png")}
          style={[
            styles.comp2,
            {
              opacity: comp2O,
              transform: [
                { translateX: comp2T.x },
                { translateY: comp2T.y },
                { rotate: comp2R.interpolate({ inputRange: [0, 1], outputRange: ["6deg", "0deg"] }) },
              ],
            },
          ]}
          resizeMode="contain"
        />

        {/* Logo (sentiasa di atas hiasan) */}
        <Animated.View style={[styles.centerWrap, { transform: [{ scale: logoS }], opacity: logoO }]}>
          <Image
            source={require("../assets/images/logo.png")}
            style={{ width: 150, height: 150 }}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.Text style={[styles.title, { opacity: titleO }]}>
          Mushaf.<Text style={{ color: ACCENT }}>AI</Text>
        </Animated.Text>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0e6b45" },
  bg: { flex: 1, alignItems: "center", justifyContent: "center" },

  /* Hiasan: tolak sikit keluar sudut + sentiasa di belakang (zIndex 0) */
  comp1: {
    position: "absolute",
    top: -26,         // ← tolak naik sedikit
    left: 1,        // ← tolak keluar kiri
    width: COMP1_SIZE,
    height: COMP1_SIZE,
    zIndex: 0,
  },
  comp2: {
    position: "absolute",
    right: -2,       // ← tolak keluar kanan
    bottom: -75,      // ← tolak turun sedikit
    width: COMP2_SIZE,
    height: COMP2_SIZE,
    zIndex: 0,
  },

  /* Logo & tajuk duduk di lapisan atas */
  centerWrap: { alignItems: "center", zIndex: 1 },
  title: { marginTop: 14, fontSize: 22, fontWeight: "800", color: "#ffffff", zIndex: 1 },
});
