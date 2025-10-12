import React, { useState } from "react";
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
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

/* THEME */
const GREEN = "#0e6b45";
const GREEN_DARK = "#0a5838";
const ACCENT = "#ffd34d";

export default function ProfilePage() {
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // demo values – sambung ke data sebenar anda
  const memPct = 4;
  const quizPct = 4;
  const email = "d20221107233@siswa.upsi.edu.my";

  const onLogout = () => {
    setSettingsOpen(false);
    Alert.alert("Log out", "Anda pasti mahu log keluar?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => {
          // TODO: auth signOut di sini
          router.replace("/"); // ubah ke route login anda jika perlu
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* HEADER: background + logo tengah + kiri menu / kanan setting */}
      <ImageBackground
        source={require("../../assets/images/image_1.png")}
        style={styles.headerBg}
        imageStyle={{ resizeMode: "cover" }}
      >
        <View style={styles.headerRow}>
          <View style={styles.sideSlot}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => {}}>
              <Ionicons name="menu" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.sideSlot}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setSettingsOpen(true)}>
              <Ionicons name="settings-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
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

        {/* Stats — BOLEH DIKLIK */}
        <View style={styles.statsRow}>
          <TouchableOpacity onPress={() => router.push("/profile_memo")}>
            <StatCircle label="Memorization" value={memPct} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/profile_quiz")}>
            <StatCircle label="Quiz" value={quizPct} />
          </TouchableOpacity>
        </View>

        {/* Info ringkas */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Email</Text>
          <View style={styles.fieldBox}>
            <Text style={styles.fieldText}>{email}</Text>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Password</Text>
          <View style={styles.fieldBox}>
            <Text style={styles.fieldText}>********</Text>
          </View>
        </View>
      </View>

      {/* SETTINGS MODAL */}
      <Modal
        transparent
        visible={settingsOpen}
        animationType="slide"
        onRequestClose={() => setSettingsOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setSettingsOpen(false)} />
        <View style={styles.sheetModal}>
          <View style={styles.modalHeader}>
            <View style={styles.grabber} />
            <Text style={styles.modalTitle}>Settings</Text>
          </View>

          <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
            <Ionicons name="person-circle-outline" size={20} color="#244c3b" />
            <Text style={styles.settingText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
            <Ionicons name="key-outline" size={20} color="#244c3b" />
            <Text style={styles.settingText}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, styles.logoutItem]} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={20} color="#cc2e2e" />
            <Text style={[styles.settingText, { color: "#cc2e2e" }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ───────────── Subcomponent: StatCircle ───────────── */
function StatCircle({ label, value }: { label: string; value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.statCard}>
      <View style={styles.ringWrap}>
        <View style={styles.ringBg} />
        <View
          style={[
            styles.ringFg,
            { transform: [{ rotate: `${(clamped / 100) * 360}deg` }] },
          ]}
        />
        <View style={styles.ringHole}>
          <Text style={styles.ringLabel}>{clamped}%</Text>
        </View>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/* ───────────── Styles ───────────── */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  headerBg: { paddingTop: 36, paddingBottom: 18, paddingHorizontal: 20 },
  headerRow: {
    height: 60, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  sideSlot: { width: 60, alignItems: "center", justifyContent: "center" },
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
    alignItems: "center", 
    justifyContent: "center", 
    backgroundColor: "#e9f6ef",
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

  statsRow: {
    marginTop: 12, flexDirection: "row", justifyContent: "space-evenly", paddingHorizontal: 10,
  },
  statCard: { alignItems: "center" },
  statLabel: { marginTop: 6, color: "#4a6b5d", fontWeight: "700", fontSize: 12 },

  // Small progress ring
  ringWrap: {
    width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center",
  },
  ringBg: {
    position: "absolute", width: "100%", height: "100%", borderRadius: 36, borderWidth: 7, borderColor: "#e8efe9",
  },
  ringFg: {
    position: "absolute", width: "100%", height: "100%", borderRadius: 36,
    borderRightColor: ACCENT, borderTopColor: ACCENT, borderLeftColor: "transparent", borderBottomColor: "transparent",
    borderWidth: 7,
  },
  ringHole: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
  },
  ringLabel: { fontWeight: "800", color: GREEN_DARK, fontSize: 14 },

  field: { marginTop: 14 },
  fieldLabel: { color: "#4a6b5d", fontWeight: "700", marginBottom: 6 },
  fieldBox: {
    backgroundColor: "#f7f1ed",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  fieldText: { color: "#2d3b35", fontWeight: "600" },

  /* Modal settings */
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.2)" },
  sheetModal: {
    backgroundColor: "#fff",
    paddingTop: 8,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalHeader: { alignItems: "center", marginBottom: 10 },
  grabber: { width: 44, height: 4, borderRadius: 2, backgroundColor: "#e5e5ea", marginVertical: 6 },
  modalTitle: { fontWeight: "800", color: "#162c24" },
  settingItem: {
    flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12,
  },
  logoutItem: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#eef2ef", marginTop: 8 },
  settingText: { fontWeight: "700", color: "#244c3b" },
});
