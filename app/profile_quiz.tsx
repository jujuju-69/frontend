import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const ACCENT = "#ffd34d";

const QUIZ_HISTORY = [
  { id: "1", name: "JUZ 1", done: true },
  { id: "2", name: "JUZ 2", done: false },
];

export default function ProfileKuiz() {
  const router = useRouter();

  const goBackToProfile = () => {
    // Terus balik ke tab Profile
    router.replace("/(tabs)/profile");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <ImageBackground
        source={require("../assets/images/image_1.png")}
        style={styles.headerBg}
        imageStyle={{ resizeMode: "cover" }}
      >
        {/* Header: back kiri (absolute), logo center, settings kanan (absolute) */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={goBackToProfile}
            style={[styles.actionBtn, styles.actionLeft]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <TouchableOpacity style={[styles.actionBtn, styles.actionRight]}>
            <Ionicons name="settings-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <View style={styles.sheet}>
        {/* Avatar + Nama */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatarRing}>
            <Image source={{ uri: "https://i.pravatar.cc/120?img=5" }} style={styles.avatar} />
            <TouchableOpacity style={styles.camBtn}>
              <Ionicons name="camera" size={14} color="#2b2b2b" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>ALI</Text>
        </View>

        {/* Chip progress (Quiz) */}
        <View style={styles.progressRow}>
          <View style={styles.progressChip}>
            <Ionicons name="book-outline" size={16} color="#1e3a2f" />
            <Text style={styles.pct}>4%</Text>
            <Text style={styles.pctLabel}>Quiz</Text>
          </View>
        </View>

        {/* History */}
        <Text style={styles.sectionTitle}>History</Text>
        <View style={styles.historyCard}>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="pencil" size={14} color="#1e3a2f" />
          </TouchableOpacity>

          {QUIZ_HISTORY.map((h) => (
            <View key={h.id} style={styles.historyRow}>
              <Text style={styles.historyName}>{h.name}</Text>

              <TouchableOpacity
                style={styles.detailBtn}
                onPress={() =>
                  router.push({
                    pathname: "/profile_quiz_detail",
                    params: { quizId: h.id, title: h.name },
                  })
                }
              >
                <Text style={styles.detailText}>Detail</Text>
              </TouchableOpacity>

              <Ionicons
                name={h.done ? "checkmark-circle" : "close-circle"}
                size={18}
                color={h.done ? "#0f8a53" : "#cc2e2e"}
                style={{ marginLeft: 8 }}
              />
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

/* styles */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  headerBg: { paddingTop: 36, paddingBottom: 18, paddingHorizontal: 20 },
  headerRow: {
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  actionBtn: {
    position: "absolute",
    width: 44,
    height: 64,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLeft: { left: 0, top: 0, bottom: 0, justifyContent: "center" },
  actionRight: { right: 0, top: 0, bottom: 0, justifyContent: "center" },
  logo: { width: 60, height: 60 },

  sheet: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    marginTop: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  avatarWrap: { alignItems: "center", marginTop: 6 },
  avatarRing: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: "#e9f6ef",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: { width: 108, height: 108, borderRadius: 54 },
  camBtn: {
    position: "absolute",
    right: 4,
    bottom: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { marginTop: 8, fontSize: 18, fontWeight: "800", color: "#162c24" },

  progressRow: { marginTop: 12, alignItems: "center" },
  progressChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#dff1e7",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  pct: { fontWeight: "800", color: "#1e3a2f" },
  pctLabel: { color: "#3f6b59", fontWeight: "700" },

  sectionTitle: { marginTop: 16, marginBottom: 8, fontWeight: "800", color: "#1e3a2f" },

  historyCard: { backgroundColor: "#2f7f57", borderRadius: 14, padding: 12, position: "relative" },
  editBtn: {
    position: "absolute",
    right: 10,
    top: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  historyName: { flex: 1, color: "#102820", fontWeight: "700" },
  detailBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12, backgroundColor: ACCENT },
  detailText: { fontWeight: "800", color: "#2b2b2b", fontSize: 12 },
});
