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
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const ACCENT = "#ffd34d";
const GREEN = "#0e6b45";
const GREEN_DARK = "#0a5838";

/** Demo history: setiap item ada details { ayah, issue } */
type Mistake = { ayah: number; issue: string };
type HistoryItem = {
  id: string;
  name: string;
  done: boolean;
  details: Mistake[];
};

const MEMO_HISTORY: HistoryItem[] = [
  {
    id: "67",
    name: "Surah al-Mulk",
    done: true,
    details: [], // tiada kesalahan
  },
  {
    id: "105",
    name: "Surah al-Fil",
    done: false,
    details: [
      { ayah: 1, issue: "Tajwid: Idgham tidak jelas" },
      { ayah: 2, issue: "Sebutan huruf ‘ق’ kurang tepat" },
    ],
  },
];

/** Demo senarai semua surah + progress (%) */
const SURAH_PROGRESS = [
  { id: "1", latin: "Al-Fatihah", arabic: "ٱلْفَاتِحَة", percent: 100 },
  { id: "2", latin: "Al-Baqarah", arabic: "ٱلْبَقَرَة", percent: 12 },
  { id: "3", latin: "Ali Imran", arabic: "آلِ عِمْرَان", percent: 5 },
  { id: "4", latin: "An-Nisa’", arabic: "ٱلنِّسَاء", percent: 0 },
  { id: "55", latin: "Ar-Rahman", arabic: "ٱلرَّحْمَٰن", percent: 42 },
  { id: "67", latin: "Al-Mulk", arabic: "ٱلْمُلْك", percent: 78 },
  { id: "105", latin: "Al-Fil", arabic: "ٱلْفِيل", percent: 20 },
];

export default function ProfileMemo() {
  const router = useRouter();

  // Dialog "Detail" — kini simpan senarai mistakes
  const [dialog, setDialog] = useState<{
    visible: boolean;
    surah: string;
    details: Mistake[];
  }>({
    visible: false,
    surah: "",
    details: [],
  });

  // Modal senarai semua surah + progress
  const [progressModal, setProgressModal] = useState(false);

  const openDialog = (surah: string, details: Mistake[]) =>
    setDialog({ visible: true, surah, details });
  const closeDialog = () => setDialog((d) => ({ ...d, visible: false }));

  const retake = () => {
    closeDialog();
    router.push({
      pathname: "/memorizesession",
      params: { surahId: "105", surahName: dialog.surah, arabic: "" },
    });
  };

  const openAllSurah = () => setProgressModal(true);
  const closeAllSurah = () => setProgressModal(false);

  const goMemorize = (id: string, latin: string, arabic: string) => {
    closeAllSurah();
    router.push({
      pathname: "/memorizesession",
      params: { surahId: id, surahName: latin, arabic },
    });
  };

  const totalPercent = useMemo(() => {
    if (!SURAH_PROGRESS.length) return 0;
    const s = SURAH_PROGRESS.reduce((acc, v) => acc + v.percent, 0);
    return Math.round(s / SURAH_PROGRESS.length);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* Header hijau + back kiri + logo center + settings kanan */}
      <ImageBackground
        source={require("../assets/images/image_1.png")}
        style={styles.headerBg}
        imageStyle={{ resizeMode: "cover" }}
      >
        <View style={styles.headerRow}>
          {/* Back di atas kiri (absolute, center menegak) */}
          <TouchableOpacity
            onPress={() => router.push("/profile")}
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

          {/* Settings kanan */}
          <TouchableOpacity style={[styles.actionBtn, styles.actionRight]}>
            <Ionicons name="settings-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {/* SHEET PUTIH */}
      <View style={styles.sheet}>
        {/* Avatar + Nama */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatarRing}>
            <Image source={{ uri: "https://i.pravatar.cc/120?img=5" }} style={styles.avatar} />
            <TouchableOpacity style={styles.camBtn} onPress={() => {}}>
              <Ionicons name="camera" size={14} color="#2b2b2b" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>ALI</Text>
        </View>

        {/* Chip progress (Surah) -> tekan untuk buka senarai semua surah */}
        <View style={styles.progressRow}>
          <TouchableOpacity style={styles.progressChip} onPress={openAllSurah} activeOpacity={0.85}>
            <Ionicons name="leaf-outline" size={16} color="#1e3a2f" />
            <Text style={styles.pct}>{totalPercent}%</Text>
            <Text style={styles.pctLabel}>Surah</Text>
            <View style={styles.badgeBtn}>
              <Text style={styles.badgeBtnText}>Lihat Semua</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* History */}
        <Text style={styles.sectionTitle}>History</Text>
        <View style={styles.historyCard}>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="pencil" size={14} color="#1e3a2f" />
          </TouchableOpacity>

          {MEMO_HISTORY.map((h) => {
            const errorsCount = h.details.length;
            return (
              <View key={h.id} style={styles.historyRow}>
                <Text style={styles.historyName}>{h.name}</Text>

                <TouchableOpacity
                  style={styles.detailBtn}
                  onPress={() => openDialog(h.name, h.details)}
                >
                  <Text style={styles.detailText}>Detail</Text>
                </TouchableOpacity>

                <Ionicons
                  name={h.done ? "checkmark-circle" : "close-circle"}
                  size={18}
                  color={h.done ? "#0f8a53" : "#cc2e2e"}
                  style={{ marginLeft: 8 }}
                />
                {/* Papar jumlah ringkas */}
                <Text style={styles.errCount}>{errorsCount}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* ───────────── Overlay Message Box: DETAIL ───────────── */}
      <Modal visible={dialog.visible} transparent animationType="fade" onRequestClose={closeDialog}>
        <Pressable style={styles.backdrop} onPress={closeDialog} />

        <View style={styles.msgWrap}>
          <View style={styles.msgCard}>
            <View style={styles.msgHeaderRow}>
              <Text style={styles.msgTitle}>DETAIL</Text>
              <TouchableOpacity onPress={closeDialog} style={styles.msgClose}>
                <Ionicons name="close" size={18} color="#2b2b2b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.msgLine}>{dialog.surah}</Text>

            {/* Senarai kesalahan: Ayah berapa + isu apa */}
            {dialog.details.length === 0 ? (
              <Text style={styles.msgLine2}>Tiada kesalahan ditemui. 👍</Text>
            ) : (
              <View style={{ marginTop: 8 }}>
                {dialog.details.map((m, idx) => (
                  <View key={idx} style={styles.mistakeRow}>
                    <View style={styles.bullet} />
                    <Text style={styles.mistakeText}>
                      Ayah <Text style={{ fontWeight: "800" }}>{m.ayah}</Text> — {m.issue}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.retakeBtn} onPress={retake}>
              <Text style={styles.retakeText}>Retake</Text>
            </TouchableOpacity>
          </View>

        </View>
      </Modal>

      {/* ───────────── Modal Semua Surah + Progress ───────────── */}
      <Modal visible={progressModal} transparent animationType="fade" onRequestClose={closeAllSurah}>
        <Pressable style={styles.backdrop} onPress={closeAllSurah} />
        <View style={styles.sheetWrap}>
          <View style={styles.sheetCard}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Kemajuan Hafalan</Text>
              <TouchableOpacity onPress={closeAllSurah} style={styles.sheetClose}>
                <Ionicons name="close" size={18} color="#2b2b2b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ paddingBottom: 8 }}>
              {SURAH_PROGRESS.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={styles.surahRow}
                  activeOpacity={0.85}
                  onPress={() => goMemorize(s.id, s.latin, s.arabic)}
                >
                  <View style={{ flex: 1 }}>
                    <View style={styles.surahRowTop}>
                      <Text style={styles.surahLatin}>{s.latin}</Text>
                      <Text style={styles.surahArabic}>{s.arabic}</Text>
                    </View>

                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${Math.min(Math.max(s.percent, 0), 100)}%` }]} />
                    </View>
                  </View>

                  <Text style={styles.percentText}>{s.percent}%</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */
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
  actionLeft: {
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  actionRight: {
    right: 10,
    top: 0,
    bottom: 10,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
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
    borderRadius: 12,
  },
  pct: { fontWeight: "800", color: "#1e3a2f" },
  pctLabel: { color: "#3f6b59", fontWeight: "700" },
  badgeBtn: {
    marginLeft: 8,
    paddingHorizontal: 10,
    height: 24,
    borderRadius: 12,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeBtnText: { fontWeight: "800", color: "#2b2b2b", fontSize: 12 },

  sectionTitle: { marginTop: 16, marginBottom: 8, fontWeight: "800", color: "#1e3a2f" },

  historyCard: {
    backgroundColor: "#2f7f57",
    borderRadius: 14,
    padding: 12,
    position: "relative",
  },
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
  errCount: { marginLeft: 8, fontWeight: "800", color: "#fff", backgroundColor: "#ef4444", paddingHorizontal: 8, borderRadius: 10, overflow: "hidden", fontSize: 12 },

  /* Overlay */
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.15)" },

  msgWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  msgCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#d8f3eb",
    borderRadius: 14,
    padding: 14,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  msgHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  msgTitle: { fontSize: 16, fontWeight: "900", color: "#143e31" },
  msgClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  msgLine: { marginTop: 10, fontWeight: "800", color: "#0e2e24" },
  msgLine2: { marginTop: 4, color: "#1f4b3d", fontWeight: "700" },

  // Senarai mistakes
  mistakeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingVertical: 6,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    backgroundColor: "#0e6b45",
  },
  mistakeText: { flex: 1, color: "#153d31", fontWeight: "700" },

  retakeBtn: {
    alignSelf: "center",
    marginTop: 12,
    backgroundColor: "#ff6b6b",
    paddingVertical: 10,
    paddingHorizontal: 26,
    borderRadius: 16,
  },
  retakeText: { color: "#fff", fontWeight: "800" },

  msgBaseShadow: {
    width: "92%",
    height: 64,
    backgroundColor: GREEN,
    borderRadius: 14,
    marginTop: -10,
  },

  /* Modal Semua Surah + Progress */
  sheetWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
  },
  sheetCard: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 14,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  sheetTitle: { fontSize: 16, fontWeight: "900", color: "#163229" },
  sheetClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f1f5f4",
    alignItems: "center",
    justifyContent: "center",
  },

  surahRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f7faf9",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e6efe9",
  },
  surahRowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  surahLatin: { fontWeight: "800", color: "#203d33" },
  surahArabic: { fontSize: 16, color: "#1e3a2f" },

  progressBar: {
    marginTop: 8,
    height: 8,
    borderRadius: 6,
    backgroundColor: "#e8f2ed",
    overflow: "hidden",
  },
  progressFill: {
    height: 8,
    borderRadius: 6,
    backgroundColor: ACCENT,
  },
  percentText: { marginLeft: 6, fontWeight: "800", color: "#2b2b2b", minWidth: 40, textAlign: "right" },
});
