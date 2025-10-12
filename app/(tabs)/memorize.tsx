import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  StatusBar,
  Image,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";

/* ---------------------- DATA ---------------------- */
type SurahItem = {
  id: string;
  latin: string;
  arabic: string;
  place: "Mekkah" | "Madinah";
  ayat: number;
  alias?: string;
  number: number;
};

const SURAH_LIST: SurahItem[] = [
  { id: "1", latin: "Al-Fatihah", arabic: "ٱلْفَاتِحَة", place: "Mekkah", ayat: 7, alias: "Pembuka", number: 1 },
  { id: "2", latin: "Al-Baqarah", arabic: "ٱلْبَقَرَة", place: "Madinah", ayat: 286, alias: "Sapi Betina", number: 2 },
  { id: "3", latin: "Ali Imran", arabic: "آلِ عِمْرَان", place: "Madinah", ayat: 200, alias: "Keluarga Imran", number: 3 },
  { id: "4", latin: "An-Nisa’", arabic: "ٱلنِّسَاء", place: "Madinah", ayat: 176, alias: "Wanita", number: 4 },
  { id: "5", latin: "Al-Ma’idah", arabic: "ٱلْمَائِدَة", place: "Madinah", ayat: 120, alias: "Hidangan", number: 5 },
  { id: "6", latin: "Al-An’am", arabic: "ٱلْأَنْعَام", place: "Mekkah", ayat: 165, alias: "Binatang Ternak", number: 6 },
  { id: "7", latin: "Al-A’raf", arabic: "ٱلْأَعْرَاف", place: "Mekkah", ayat: 206, alias: "Tempat yang Tertinggi", number: 7 },
  { id: "8", latin: "Al-Anfal", arabic: "ٱلْأَنْفَال", place: "Madinah", ayat: 75, alias: "Rampasan Perang", number: 8 },
  { id: "9", latin: "At-Taubah", arabic: "ٱلتَّوْبَة", place: "Madinah", ayat: 129, alias: "Pengampunan", number: 9 },
  { id: "10", latin: "Yunus", arabic: "يُونُس", place: "Mekkah", ayat: 109, alias: "Nabi Yunus", number: 10 },
  // ... (anda boleh tambah lebih banyak surah di sini)
];

/* ---------------------- MAIN ---------------------- */
export default function MemorizePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SURAH_LIST;
    return SURAH_LIST.filter(
      (s) =>
        s.latin.toLowerCase().includes(q) ||
        s.arabic.includes(query) ||
        (s.alias && s.alias.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header (sama gaya dengan Home/Read) */}
        <ImageBackground
          source={require("../../assets/images/image_1.png")}
          style={styles.header}
          imageStyle={{ resizeMode: "cover" }}
        >
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Search */}
          <View style={[styles.fullWidth, styles.searchWrap]}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Pencarian surah dalam Alquran…"
              placeholderTextColor="#cfead8"
              style={styles.searchInput}
            />
            <TouchableOpacity style={styles.searchBtn}>
              <Text style={{ fontSize: 16 }}>🔎</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {/* Senarai Surah */}
        <View style={styles.contentSheet}>
          <FlatList
            data={filtered}
            keyExtractor={(i) => i.id}
            scrollEnabled={false}
            contentContainerStyle={{ padding: 14, paddingBottom: 24 }}
            renderItem={({ item }) => (
              <SurahCard
                item={item}
                onPress={() =>
                  router.push({
                    pathname: "/memorizesession",
                    params: { surahId: item.id, surahName: item.latin, arabic: item.arabic },
                  })
                }
              />
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------------- SUB ---------------------- */
function SurahCard({
  item,
  onPress,
}: {
  item: SurahItem;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.card} onPress={onPress}>
      {/* Badge nombor */}
      <View style={{ paddingRight: 12 }}>
        <View style={styles.badgeOuter}>
          <View style={styles.badgeInner}>
            <Text style={{ color: "#0a5838", fontWeight: "800" }}>{item.number}</Text>
          </View>
        </View>
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>
          {item.latin} {item.alias ? <Text style={styles.alias}>({item.alias})</Text> : null}
        </Text>
        <View style={styles.metaRow}>
          <SmallTag text={item.place} />
          <View style={styles.dot} />
          <SmallTag text={`${item.ayat} Ayat`} />
        </View>
      </View>

      {/* Arabic */}
      <Text style={styles.arabic}>{item.arabic}</Text>
    </TouchableOpacity>
  );
}

function SmallTag({ text }: { text: string }) {
  return (
    <View style={styles.smallTag}>
      <Text style={styles.smallTagText}>{text}</Text>
    </View>
  );
}

/* ---------------------- STYLES ---------------------- */
const GREEN_DARK = "#0a5838";
const ACCENT = "#ffd34d";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  header: {
    paddingTop: 36,
    paddingBottom: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { width: 60, height: 60, marginBottom: 10 },
  fullWidth: { alignSelf: "stretch" },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GREEN_DARK,
    borderRadius: 28,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: { flex: 1, color: "#ffffff", fontSize: 14 },
  searchBtn: {
    backgroundColor: ACCENT,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  contentSheet: {
    backgroundColor: "#f6fbf7",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    marginTop: 10,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  badgeOuter: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#e9f6ef",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d1e6da",
  },

  cardTitle: { fontSize: 14, fontWeight: "700", color: "#244c3b" },
  alias: { color: "#7aa28f", fontWeight: "600" },

  metaRow: { marginTop: 6, flexDirection: "row", alignItems: "center", gap: 6 },
  smallTag: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, backgroundColor: "#e9f6ef" },
  smallTagText: { fontSize: 10, color: GREEN_DARK, fontWeight: "700" },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#c2d7cd" },

  arabic: { fontSize: 18, color: "#1e3a2f", marginLeft: 12, textAlign: "right" },
});
