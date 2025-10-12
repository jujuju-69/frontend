// app/memorizesession.tsx
import React, { useMemo, useState } from "react";
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
import { useLocalSearchParams, useRouter } from "expo-router";

const GREEN = "#0e6b45";
const GREEN_DARK = "#0a5838";
const ACCENT = "#ffd34d";

/* --- Demo data ayat (boleh ganti dengan real mushaf) --- */
const AYAH_COUNT: Record<string, number> = { "1": 7, "2": 286, "3": 200, "4": 176 };
const AYAT_DATA: Record<string, string[]> = {
  "1": [
    "بِسْمِ ٱللّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
    "ٱلْحَمْدُ لِلّٰهِ رَبِّ ٱلْعَالَمِينَ",
    "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
    "مَٰلِكِ يَوْمِ ٱلدِّينِ",
    "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
    "ٱهْدِنَا ٱلصِّرَاطَ ٱلْمُسْتَقِيمَ",
    "صِرَاطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّالِّينَ",
  ],
};

export default function MemorizeSession() {
  const router = useRouter();
  const { surahId = "1", surahName = "Al-Fatihah", arabic = "ٱلْفَاتِحَة" } =
    useLocalSearchParams<{ surahId?: string; surahName?: string; arabic?: string }>();

  const totalAyah = AYAH_COUNT[String(surahId)] ?? 7;
  const [ayah, setAyah] = useState(1);

  // UI flow states
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showAyah, setShowAyah] = useState(false); // ayat hanya muncul selepas tekan mic

  const options = useMemo(() => Array.from({ length: totalAyah }, (_, i) => i + 1), [totalAyah]);
  const verse =
    (AYAT_DATA[String(surahId)] && AYAT_DATA[String(surahId)][ayah - 1]) ||
    `(${ayah})`;

  // Handlers
  const handlePickAyah = (n: number) => {
    setAyah(n);
    setDropdownOpen(false);
    // reset state supaya ayat tak muncul dulu
    setRecording(false);
    setSubmitted(false);
    setShowAyah(false);
  };

  const handleMic = () => {
    setRecording(true);
    setShowAyah(true);   // hanya paparkan bila mula rakam
    setSubmitted(false);
  };

  const handleStop = () => {
    setRecording(false); // berhenti rakaman -> boleh submit
  };

  const handleSubmit = () => {
    setSubmitted(true);  // lepas submit -> paparkan Next
  };

  const handleNext = () => {
    if (ayah < totalAyah) {
      setAyah(ayah + 1);
    } else {
      // last ayah — restart; boleh tukar ke router.replace("/memorize") jika mahu
      setAyah(1);
    }
    // reset flow untuk ayat seterusnya
    setRecording(false);
    setSubmitted(false);
    setShowAyah(false);
    setDropdownOpen(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* Header dengan logo center; back & coin absolute + center menegak */}
      <ImageBackground
        source={require("../assets/images/image_1.png")}
        style={styles.headerBg}
        imageStyle={{ resizeMode: "cover" }}
      >
          <View style={styles.headerRow}>
            {/* Back → Pergi ke memorize.tsx */}
            <TouchableOpacity
              onPress={() => router.push("/memorize")}
              style={[styles.actionBtn, styles.actionLeft]}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
          
          {/* LOGO tengah */}
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Coin (absolute kanan, center menegak + jelas) */}
          <View style={styles.actionRight}>
            <View style={styles.coinChip}>
              <Text style={{ fontSize: 12 }}>🪙</Text>
              <Text style={styles.coinText}>0</Text>
            </View>
          </View>
        </View>
      </ImageBackground>

      {/* Sheet */}
      <View style={styles.sheet}>
        {/* Surah info */}
        <View style={styles.surahCard}>
          <Text style={styles.surahLabel}>Surah</Text>
          <Text style={styles.surahName}>
            {surahName} — <Text style={{ fontFamily: undefined }}>{arabic}</Text>
          </Text>
        </View>

        {/* Pilih ayat */}
        <View style={styles.selectWrap}>
          <TouchableOpacity style={styles.selectBtn} onPress={() => setDropdownOpen((v) => !v)}>
            <Text style={styles.selectText}>
              Pilih ayat (semasa: Ayah {ayah} / {totalAyah})
            </Text>
            <Ionicons name={dropdownOpen ? "chevron-up" : "chevron-down"} size={18} color="#2d6b50" />
          </TouchableOpacity>

          {dropdownOpen && (
            <View style={styles.dropdown}>
              <ScrollView style={{ maxHeight: 240 }}>
                {options.map((n) => (
                  <TouchableOpacity
                    key={n}
                    style={[styles.dropItem, ayah === n && styles.dropItemActive]}
                    onPress={() => handlePickAyah(n)}
                  >
                    <Text style={[styles.dropText, ayah === n && styles.dropTextActive]}>Ayah {n}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Ayat terpilih (muncul hanya selepas tekan mic) */}
        <View style={styles.ayahBox}>
          <Text style={styles.ayahArabic}>
            {showAyah ? verse : "Tekan butang mic untuk memulakan hafalan."}
          </Text>
        </View>

        {/* Kawalan bawah mengikut state */}
        <View style={{ alignItems: "center", marginTop: 16 }}>
          {/* 1) Belum mula rakam + belum submit -> MIC */}
          {!recording && !submitted && !showAyah && (
            <TouchableOpacity style={styles.micBtn} activeOpacity={0.9} onPress={handleMic}>
              <Ionicons name="mic" size={26} color="#2b2b2b" />
              <Text style={styles.btnLabel}>Start Recording</Text>
            </TouchableOpacity>
          )}

          {/* 2) Sedang rakam -> STOP */}
          {recording && (
            <TouchableOpacity style={[styles.micBtn, styles.stopBtn]} activeOpacity={0.9} onPress={handleStop}>
              <Ionicons name="square" size={22} color="#2b2b2b" />
              <Text style={styles.btnLabel}>Stop Recording</Text>
            </TouchableOpacity>
          )}

          {/* 3) Lepas stop (ada ayat, belum submit) -> SUBMIT */}
          {!recording && showAyah && !submitted && (
            <TouchableOpacity style={[styles.actionPill, { backgroundColor: GREEN }]} onPress={handleSubmit}>
              <Ionicons name="checkmark" size={16} color="#fff" />
              <Text style={styles.actionPillText}>Submit</Text>
            </TouchableOpacity>
          )}

          {/* 4) Lepas submit -> NEXT */}
          {submitted && (
            <TouchableOpacity
              style={[styles.actionPill, { backgroundColor: ACCENT }]}
              onPress={handleNext}
            >
              <Ionicons name="arrow-forward" size={16} color="#2b2b2b" />
              <Text style={[styles.actionPillText, { color: "#2b2b2b" }]}>
                {ayah < totalAyah ? "Next Ayah" : "Restart"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f6fbf7" },

  headerBg: {
    paddingTop: 36,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },

  // Pusatkan logo; back & coin absolute + center menegak
  headerRow: {
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  actionBtn: {
    position: "absolute",
    width: 44, // lebih besar & senang tekan
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2, // pastikan atas
  },
  actionLeft: {
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  actionRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  logo: { width: 60, height: 60, zIndex: 1 },

  // Coin chip lebih jelas
  coinChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.98)",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 28,
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  coinText: { fontWeight: "800", color: "#1e3a2f", fontSize: 12 },

  sheet: {
    flex: 1,
    backgroundColor: "#f3eee7",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    marginTop: -8,
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  surahCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },
  surahLabel: { color: "#4a6b5d", fontWeight: "700", marginBottom: 4 },
  surahName: { color: "#102820", fontSize: 18, fontWeight: "800" },

  selectWrap: { marginTop: 2, marginBottom: 12 },
  selectBtn: {
    height: 44,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 1,
  },
  selectText: { color: "#7aa28f", fontSize: 12 },
  dropdown: {
    marginTop: 6,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 2,
    overflow: "hidden",
  },
  dropItem: { paddingVertical: 10, paddingHorizontal: 12 },
  dropItemActive: { backgroundColor: "#eaf5ef" },
  dropText: { color: "#244c3b", fontSize: 13, fontWeight: "600" },
  dropTextActive: { color: GREEN_DARK },

  ayahBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 28,
    paddingHorizontal: 16,
    minHeight: 140,
  },
  ayahArabic: { textAlign: "center", fontSize: 20, color: "#1e3a2f" },

  micBtn: {
    minWidth: 190,
    height: 56,
    borderRadius: 28,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    flexDirection: "row",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  stopBtn: {
    backgroundColor: "#ffd3cf",
  },
  btnLabel: { fontWeight: "800", color: "#2b2b2b" },

  actionPill: {
    marginTop: 12,
    minWidth: 140,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    flexDirection: "row",
    gap: 8,
  },
  actionPillText: { color: "#fff", fontWeight: "800" },
});
