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
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, useLocalSearchParams, useRouter } from "expo-router";

const GREEN = "#0e6b45";
const ACCENT = "#ffd34d";

/** Demo history jawapan */
type HistoryItem = {
  id: string;
  surah: string;
  ayah: number;
  chosen: string;
  correct: string;
};

const SAMPLE_HISTORY: HistoryItem[] = [
  { id: "1", surah: "Surah al-Fil", ayah: 2, chosen: "ثُمَّ بَدَّلْنَا مَكَانَهُمْ", correct: "لَمْ" },
  { id: "2", surah: "Surah al-Fil", ayah: 2, chosen: "لَمْ", correct: "لَمْ" },
  { id: "3", surah: "Surah al-Fil", ayah: 4, chosen: "عَلَيْهِمْ", correct: "عَلَيْهِمْ" },
];

export default function ProfileKuizDetail() {
  const router = useRouter();
  const { quizId = "1", title = "JUZ 1" } = useLocalSearchParams<{ quizId?: string; title?: string }>();

  const retake = () => {
    router.push({ pathname: "/quizsession", params: { juz: String(quizId), title: String(title) } });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* Header dengan logo center + back kiri + gear kanan */}
      <ImageBackground
        source={require("../assets/images/image_1.png")}
        style={styles.headerBg}
        imageStyle={{ resizeMode: "cover" }}
      >
        <View style={styles.headerRow}>
          <Link href="/profile_quiz" asChild>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
          </Link>

          <Image source={require("../assets/images/logo.png")} style={styles.logo} resizeMode="contain" />

          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="settings-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {/* Sheet putih */}
      <View style={styles.sheet}>
        {/* Avatar + Nama ringkas + chip “Quiz 4%” */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatarRing}>
            <Image source={{ uri: "https://i.pravatar.cc/120?img=5" }} style={styles.avatar} />
            <TouchableOpacity style={styles.camBtn}>
              <Ionicons name="camera" size={14} color="#2b2b2b" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>ALI</Text>
        </View>

        <Text style={styles.sectionTitle}>History — {title}</Text>

        <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
          {SAMPLE_HISTORY.map((h, idx) => {
            const isCorrect = h.chosen === h.correct;
            return (
              <View key={h.id} style={{ marginBottom: 14 }}>
                <Text style={styles.indexNum}>{idx + 1}.</Text>

                <View style={styles.greenCard}>
                  {/* Label bar kecil */}
                  <View style={styles.topLabel}>
                    <View style={styles.dot} />
                    <Text style={styles.topLabelText}>
                      {h.surah} ayat: {h.ayah}
                    </Text>
                    <Ionicons
                      name={isCorrect ? "checkmark-circle" : "close-circle"}
                      size={16}
                      color={isCorrect ? "#0f8a53" : "#cc2e2e"}
                      style={{ marginLeft: "auto" }}
                    />
                  </View>

                  {/* Pills jawapan */}
                  <View style={styles.pillsRow}>
                    {/* Dipilih */}
                    <View style={[styles.pill, isCorrect ? styles.pillGreen : styles.pillRed]}>
                      <Text style={[styles.pillText, isCorrect ? styles.pillTextDark : styles.pillTextLight]}>
                        {h.chosen}
                      </Text>
                      <Ionicons
                        name={isCorrect ? "checkmark-circle" : "close-circle"}
                        size={16}
                        color={isCorrect ? "#0b6d42" : "#fff"}
                        style={{ marginLeft: 8 }}
                      />
                    </View>

                    {/* Betul (papar juga jika salah) */}
                    {!isCorrect && (
                      <View style={[styles.pill, styles.pillGreen]}>
                        <Text style={[styles.pillText, styles.pillTextDark]}>{h.correct}</Text>
                        <Ionicons name="checkmark-circle" size={16} color="#0b6d42" style={{ marginLeft: 8 }} />
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* BUTANG RETAKE QUIZ – melekat di bawah */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.retakeBtn} onPress={retake}>
          <Ionicons name="refresh" size={18} color="#2b2b2b" />
          <Text style={styles.retakeText}>Retake Quiz</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ───────────── STYLES ───────────── */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  headerBg: { paddingTop: 36, paddingBottom: 18, paddingHorizontal: 20 },
  headerRow: {
    height: 59, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
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

  progressChip: {
    marginTop: 10,
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#dff1e7", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10,
  },
  pct: { fontWeight: "800", color: "#1e3a2f" },
  pctLabel: { color: "#3f6b59", fontWeight: "700" },

  sectionTitle: { marginTop: 16, marginBottom: 8, fontWeight: "800", color: "#1e3a2f" },
  indexNum: { fontWeight: "800", color: "#173a2d", marginBottom: 6 },

  greenCard: {
    backgroundColor: "#2f7f57",
    borderRadius: 14,
    padding: 10,
  },
  topLabel: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 10,
    paddingVertical: 6, paddingHorizontal: 10,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: GREEN, marginRight: 6 },
  topLabelText: { fontWeight: "800", color: "#143428" },

  pillsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 10,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  pillGreen: { backgroundColor: "#cfeee1" },
  pillRed: { backgroundColor: "#e24d4d" },
  pillText: { fontSize: 14, fontWeight: "800" },
  pillTextDark: { color: "#0b3b2a" },
  pillTextLight: { color: "#fff" },

  /* Bottom retake bar */
  bottomBar: {
    position: "absolute",
    left: 0, right: 0, bottom: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e6ede8",
  },
  retakeBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  retakeText: { fontWeight: "900", color: "#2b2b2b" },
});
