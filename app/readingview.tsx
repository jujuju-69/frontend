import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

/* =================== CONFIG (Network) =================== */
const ENV_BASE = process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined;
const API_PORT = 8000;

const PC_IP = "192.168.0.101";       // <- tukar bila test di telefon
const SIM_HOST = Platform.OS === "android" ? "10.0.2.2" : "127.0.0.1";
const USE_PC_LAN = true;

const FALLBACK_EMULATOR = `http://${SIM_HOST}:${API_PORT}/api/v1`;
const FALLBACK_PC_LAN = `http://${PC_IP}:${API_PORT}/api/v1`;

const BASE = (ENV_BASE && ENV_BASE.trim()) || (USE_PC_LAN ? FALLBACK_PC_LAN : FALLBACK_EMULATOR);

/* =================== UI COLORS =================== */
const GREEN = "#0e6b45";
const GREEN_DARK = "#0a5838";
const ACCENT = "#ffd34d";
const SURFACE = "#ffffff";
const TINT = "#eaf5ef";

/* =================== TYPES =================== */
type Ayah = {
  id: number;
  surah_number?: number;
  number_in_surah: number;
  text?: string;
  text_uthmani?: string;
  text_arabic?: string;
  arabic_text?: string;
  tajweed_text?: string;
  translation_ms?: string;
  translation_en?: string;
};

type AyahResponseNoPaginate = {
  data: Ayah[];
  meta?: { count?: number; surah_id?: number; edition_id?: number; range?: { from?: number; to?: number } };
};

/* =================== HELPERS =================== */
const stripBOM = (s?: string) => (s ? s.replace(/^\uFEFF/, "") : "");

/* =================== SCREEN =================== */
export default function ReadingView() {
  const params = useLocalSearchParams<{ surahId?: string; surahName?: string; arabic?: string }>();
  const { width } = useWindowDimensions();

  const rawSurahId = params.surahId ? Number(params.surahId) : NaN;
  const validSurahId = Number.isFinite(rawSurahId) && rawSurahId > 0 ? rawSurahId : 1;
  const surahName = params.surahName ?? "Al-Fatihah";
  const arabicTitle = params.arabic ?? "ٱلْفَاتِحَة";

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [pickedEditionId, setPickedEditionId] = useState<number | null>(null);

  // ✨ Basmalah setup
  const BASMALAH = "بِسْمِ ٱللّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
  const showBasmallah = validSurahId !== 1 && validSurahId !== 9; // kecuali Al-Fatihah (1) & At-Taubah (9)

  const fetchAyahs = useCallback(
    async (showRefreshing = false) => {
      try {
        showRefreshing ? setRefreshing(true) : setLoading(true);
        setError(null);

        const res = await fetch(`${BASE}/surahs/${validSurahId}/ayahs`);
        if (!res.ok) throw new Error(`Gagal ambil ayat (HTTP ${res.status})`);

        const json: AyahResponseNoPaginate = await res.json();
        const items = Array.isArray(json?.data) ? json.data : [];

        setAyahs(
          items.map((a: any) => ({
            ...a,
            number_in_surah: a.number_in_surah ?? a.ayah_number ?? a.number ?? 0,
            text: stripBOM(a.text ?? a.text_uthmani ?? a.text_arabic ?? a.arabic_text),
          }))
        );
        setCount(json?.meta?.count ?? items.length);
        setPickedEditionId(json?.meta?.edition_id ?? null);
      } catch (e: any) {
        setError(e?.message ?? "Ralat tidak diketahui semasa ambil ayat");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [validSurahId]
  );

  useEffect(() => {
    fetchAyahs(false);
  }, [validSurahId, fetchAyahs]);

  const onRefresh = () => fetchAyahs(true);

  const getArabic = (a: Ayah) => stripBOM(a.text ?? a.text_uthmani ?? a.text_arabic ?? a.arabic_text ?? "");
  const getTranslation = (a: Ayah) => a.translation_ms ?? a.translation_en ?? "";

  // Tipografi berskala ikut lebar skrin
  const ARABIC_SIZE = Math.min(30, Math.max(22, width / 16));
  const ARABIC_LINE = ARABIC_SIZE * 1.6;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.headerWrap}>
        <ImageBackground
          source={require("../assets/images/image_1.png")}
          style={styles.headerBg}
          imageStyle={{ resizeMode: "cover" }}
        >
          <LinearGradient
            colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0.35)"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.headerRow}>
            <View style={styles.sideSlot}>
              <Link href="/read" asChild>
                <TouchableOpacity style={styles.iconBtn}>
                  <Ionicons name="arrow-back" size={22} color="#fff" />
                </TouchableOpacity>
              </Link>
            </View>

            <Image source={require("../assets/images/logo.png")} style={styles.logo} resizeMode="contain" />

            <View style={styles.sideSlot}>
              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="settings-outline" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.segmentWrap}>
            <Chip text="Surah" />
            <Chip text={surahName} active />
            <Chip text={count != null ? `${count} ayat` : "Memuat…"} />
            {pickedEditionId != null ? <Chip text={`ed ${pickedEditionId}`} /> : null}
          </View>

          {!params.surahId && (
            <Text style={styles.headerNote}>Nota: 'surahId' tiada, guna Surah 1.</Text>
          )}
        </ImageBackground>
      </View>

      {/* CONTENT */}
      <View style={styles.sheet}>
        {loading && ayahs.length === 0 ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchAyahs(false)} />
        ) : (
          <FlatList
            contentContainerStyle={{ padding: 16, paddingBottom: 150 }}
            data={ayahs}
            keyExtractor={(item) => String(item.id ?? `${validSurahId}-${item.number_in_surah}`)}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={GREEN_DARK}
                colors={[GREEN_DARK]}
                progressBackgroundColor={TINT}
              />
            }
            ListHeaderComponent={
              <View style={{ marginBottom: 8 }}>
                <Text style={styles.pageInfoLeft}>
                  {surahName} — <Text style={{ fontFamily: undefined }}>{arabicTitle}</Text>
                </Text>
                {count != null ? <Text style={styles.pageInfoRight}>Jumlah ayat: {count}</Text> : null}

                {/* ✨ BASMALAH: dipaparkan untuk semua surah kecuali 1 & 9 */}
                {showBasmallah && (
                  <Text style={[styles.basmallah, { fontSize: ARABIC_SIZE + 2, lineHeight: (ARABIC_SIZE + 2) * 1.7 }]}>
                    {BASMALAH}
                  </Text>
                )}
              </View>
            }
            ListEmptyComponent={
              <View style={{ padding: 16 }}>
                <Text style={{ textAlign: "center", color: "#668c79" }}>Tiada ayat untuk dipaparkan.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const arabicText = getArabic(item);
              const tajweedText = item.tajweed_text;
              const translation = getTranslation(item);

              return (
                <View style={styles.ayahCard}>
                  <View style={styles.ayahHeader}>
                    <AyahBadge n={item.number_in_surah} />
                  </View>

                  {/* ARABIC */}
                  <Text
                    style={[
                      styles.arabic,
                      { fontSize: ARABIC_SIZE, lineHeight: ARABIC_LINE },
                    ]}
                  >
                    {arabicText}
                  </Text>

                  {/* TAJWEED (jika ada) */}
                  {!!tajweedText && <Text style={styles.tajweed}>{tajweedText}</Text>}

                  {/* TRANSLATION (jika ada) */}
                  {!!translation && <Text style={styles.translation}>{translation}</Text>}
                </View>
              );
            }}
            initialNumToRender={20}
            windowSize={8}
            removeClippedSubviews
            maxToRenderPerBatch={20}
            updateCellsBatchingPeriod={50}
          />
        )}
      </View>

      {/* MINI PLAYER */}
      <View style={styles.playerWrap}>
        <View style={styles.playerBar}>
          <TouchableOpacity style={styles.ctrlBtn} disabled>
            <Ionicons name="play-back" size={20} color="#e5fff2" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.playBtn} disabled>
            <Ionicons name="book" size={26} color="#2b2b2b" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.ctrlBtn} disabled>
            <Ionicons name="play-forward" size={20} color="#e5fff2" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

/* ============ SUBCOMPONENTS ============ */
function Chip({ text, active }: { text: string; active?: boolean }) {
  return (
    <View style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{text}</Text>
    </View>
  );
}

function LoadingState() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator />
      <Text style={{ marginTop: 8, color: "#567", fontWeight: "600" }}>Memuatkan ayat…</Text>
    </View>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }}>
      <Text style={{ color: "#b00020", textAlign: "center" }}>{message}</Text>
      <TouchableOpacity onPress={onRetry} style={[styles.ctrlBtn, { marginTop: 12, backgroundColor: "#b00020" }]}>
        <Text style={{ color: "#fff", fontWeight: "700" }}>Cuba Lagi</Text>
      </TouchableOpacity>
    </View>
  );
}

/** Nombor ayat dengan bingkai hiasan. Akan guna imej jika wujud. */
function AyahBadge({ n }: { n: number }) {
  const ornament = (() => {
    try {
      // letak di: app/assets/images/ayah_badge.png
      return require("../assets/images/ayah_badge.png");
    } catch {
      return null;
    }
  })();

  if (ornament) {
    return (
      <ImageBackground source={ornament} style={styles.badgeImg} imageStyle={{ resizeMode: "contain" }}>
        <Text style={styles.badgeImgText}>{n}</Text>
      </ImageBackground>
    );
  }

  // fallback ringkas jika image tiada
  return (
    <View style={styles.fallbackBadge}>
      <View style={styles.fallbackBadgeInner}>
        <Text style={styles.fallbackBadgeText}>{n}</Text>
      </View>
    </View>
  );
}

/* ============ STYLES ============ */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f6fbf7" },

  headerWrap: { overflow: "hidden", borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
  headerBg: {
    paddingTop: 36,
    paddingBottom: 28,
    paddingHorizontal: 20,
    backgroundColor: GREEN, // fallback bila image tak load
  },
  headerRow: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sideSlot: { width: 60, alignItems: "center", justifyContent: "center" },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  logo: { width: 60, height: 60 },

  segmentWrap: {
    marginTop: 12,
    alignSelf: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.18)",
    padding: 6,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.25)",
  },
  chip: { backgroundColor: TINT, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10 },
  chipActive: { backgroundColor: ACCENT },
  chipText: { fontSize: 12, color: GREEN_DARK, fontWeight: "700" },
  chipTextActive: { color: "#3a2a00" },
  headerNote: {
    color: ACCENT,
    marginTop: 6,
    alignSelf: "center",
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.18)",
    textShadowRadius: 3,
  },

  sheet: {
    flex: 1,
    backgroundColor: "#f6fbf7",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    marginTop: -10,
    paddingTop: 10,
  },

  pageInfoLeft: { marginHorizontal: 16, color: "#375f4f", fontWeight: "700" },
  pageInfoRight: { marginHorizontal: 16, color: "#789e8f", fontWeight: "600" },

  // ✨ Basmalah style
  basmallah: {
    marginTop: 14,
    marginHorizontal: 8,
    textAlign: "center",
    color: "#1f2d28",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e3eee7",
    writingDirection: "rtl" as any,
    includeFontPadding: false,
  },

  ayahCard: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e8efe9",
  },
  ayahHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },

  // Ornament badge
  badgeImg: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  badgeImgText: { fontWeight: "800", color: "#2f3a35" },

  // Fallback badge
  fallbackBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#e9f6ef",
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackBadgeInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d1e6da",
  },
  fallbackBadgeText: { color: GREEN_DARK, fontWeight: "800" },

  arabic: {
    color: "#19221f",
    textAlign: "right",
    writingDirection: "rtl" as any,
    includeFontPadding: false,
  },
  tajweed: {
    marginTop: 10,
    color: "#6b4e00",
    backgroundColor: "#fff4d6",
    borderRadius: 10,
    padding: 10,
    textAlign: "right",
    writingDirection: "rtl" as any,
    fontSize: 16,
    lineHeight: 28,
  },
  translation: {
    marginTop: 10,
    color: "#3a4b46",
    fontSize: 15,
    lineHeight: 23,
  },

  playerWrap: { position: "absolute", left: 0, right: 0, bottom: 14, alignItems: "center" },
  playerBar: {
    backgroundColor: GREEN,
    width: "92%",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  ctrlBtn: {
    minWidth: 56,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#134f36",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -28,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
});
