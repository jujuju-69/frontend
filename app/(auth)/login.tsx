// app/(auth)/login.tsx — Expo Go ready + Laravel API + AuthGuard
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ✅ NAMED import (pastikan hook export named)
import { useAuthGuard } from "../../src/features/auth/guard/useAuthGuard";

/* =================== CONFIG =================== */
// Boleh tukar ke env nanti (EXPO_PUBLIC_API_BASE_URL). Buat masa ni guna nilai tetap.
const API_BASE_URL = "http://192.168.0.101:8000/api/v1";

/* =============== UI CONSTANTS ================= */
const GREEN_DARK = "#0a5838";
const ACCENT = "#ffd34d";
// Lebih stabil: pergi ke root tabs, bukan screen spesifik
const HOME_PATH = "/(tabs)/Homepage";

/* =============== HELPERS ===================== */
// Timeout universal tanpa AbortController (kurang isu platform)
async function fetchWithTimeout(url: string, options: any = {}, ms = 12000) {
  return Promise.race([
    fetch(url, options),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), ms)
    ),
  ]);
}

async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

/* =============== COMPONENT ==================== */
export default function LoginScreen() {
  const router = useRouter();

  // Jika token wujud, guard akan redirect (elak user nampak login)
  useAuthGuard();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hide, setHide] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const res: any = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          device_name: "react-native",
        }),
      });

      if (!res || !res.ok) {
        const json = res ? await safeJson(res) : null;
        const apiMsg =
          (json &&
            (json.message ||
              json?.errors?.email?.[0] ||
              json?.errors?.password?.[0])) ||
          "Login failed. Please check your credentials.";
        throw new Error(apiMsg);
      }

      const json = await res.json();

      // Terima beberapa bentuk response Laravel
      const token: string | null =
        json?.token ?? json?.data?.token ?? json?.access_token ?? null;
      const user = json?.user ?? json?.data?.user ?? null;

      if (!token) throw new Error("Token not found in response.");

      await AsyncStorage.setItem("auth_token", token);
      if (user) await AsyncStorage.setItem("auth_user", JSON.stringify(user));

      router.replace(HOME_PATH);
    } catch (e: any) {
      setErrorMsg(e?.message || "Unexpected error. Please try again.");
      console.log("LOGIN_ERROR:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <ImageBackground
        source={require("../../assets/images/image_1.png")} // ✅ path betul dari (auth)
        style={styles.bg}
        imageStyle={{ resizeMode: "cover" }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1, width: "100%", alignItems: "center" }}
        >
          {/* Header */}
          <View style={styles.headerTop}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.welcome}>Welcome, back</Text>
          </View>

          {/* Card */}
          <View style={styles.cardWrap}>
            <View style={styles.cardShadow} />
            <View style={styles.card}>
              <View style={styles.archCap} />

              <View style={styles.avatarWrap}>
                <View style={styles.avatarCircle}>
                  <Ionicons name="person" size={38} color={GREEN_DARK} />
                </View>
              </View>

              <View style={{ paddingHorizontal: 16, paddingTop: 6 }}>
                {errorMsg ? <Text style={styles.errorMsg}>{errorMsg}</Text> : null}

                <View style={styles.inputRow}>
                  <Ionicons name="mail-outline" size={18} color="#89a79a" />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#98b7a9"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={[styles.inputRow, { marginTop: 12 }]}>
                  <Ionicons name="lock-closed-outline" size={18} color="#89a79a" />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#98b7a9"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={hide}
                  />
                  <TouchableOpacity onPress={() => setHide((v) => !v)}>
                    <Ionicons
                      name={hide ? "eye-off-outline" : "eye-outline"}
                      size={18}
                      color="#89a79a"
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.btn, loading && { opacity: 0.7 }]}
                  onPress={handleLogin}
                  activeOpacity={0.9}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator /> : <Text style={styles.btnText}>Sign In</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push("/(auth)/register")} style={{ marginTop: 12 }}>
                  <Text style={styles.link}>Create an account? Register</Text>
                </TouchableOpacity>

                {/* Debug URL */}
                <Text style={styles.debugUrl}>{API_BASE_URL}</Text>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0e6b45" },
  bg: { flex: 1, alignItems: "center" },

  headerTop: { alignItems: "center", marginTop: 22 },
  logo: { width: 56, height: 56, marginBottom: 6 },
  welcome: { color: "#fff", fontSize: 22, fontWeight: "800" },

  cardWrap: { width: "100%", alignItems: "center", marginTop: 100, paddingHorizontal: 22 },
  cardShadow: {
    position: "absolute",
    bottom: 8,
    width: "86%",
    height: 14,
    backgroundColor: "rgba(0,0,0,0.10)",
    borderRadius: 12,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingBottom: 18,
    paddingTop: 54,
    overflow: "visible",
    borderWidth: 1,
    borderColor: "#edf3ef",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  archCap: {
    position: "absolute",
    top: -78,
    left: "50%",
    marginLeft: -118,
    width: 236,
    height: 156,
    backgroundColor: "#fff",
    borderTopLeftRadius: 118,
    borderTopRightRadius: 118,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 1,
    borderColor: "#edf3ef",
  },

  avatarWrap: { position: "absolute", top: -38, left: 0, right: 0, alignItems: "center" },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#eaf5ef",
    borderWidth: 3,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f6fbf7",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: "#e5efe9",
  },
  input: { flex: 1, color: "#17362b", fontSize: 14 },

  btn: {
    marginTop: 14,
    height: 46,
    borderRadius: 10,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  btnText: { fontWeight: "900", color: "#2b2b2b" },

  link: { textAlign: "center", color: GREEN_DARK, fontWeight: "700" },

  errorMsg: { color: "#c0392b", textAlign: "center", marginBottom: 8, fontWeight: "700" },

  debugUrl: { marginTop: 10, textAlign: "center", color: "#8aa39b", fontSize: 12 },
});
