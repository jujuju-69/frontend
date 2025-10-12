import React, { useEffect, useMemo, useState } from "react";
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
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";

/* =================== CONFIG (Network) =================== */
/**
 * Cara pilih BASE:
 * 1) PALING MUDAH — set env (lebih kemas):
 *    app.json / app.config.ts
 *    "expo": { "extra": { "EXPO_PUBLIC_API_BASE_URL": "http://192.168.x.x:8000/api/v1" } }
 * 2) Jika tak set env, guna flag di bawah:
 *    - `USE_PC_LAN = true`  -> telefon sebenar (atau emulator yang mahu guna IP PC)
 *    - `USE_PC_LAN = false` -> emulator/simulator (10.0.2.2 / 127.0.0.1)
 */

const ENV_BASE = process.env.EXPO_PUBLIC_API_BASE_URL;

const API_PORT = 8000;
// const PC_IP = "10.198.80.138";
const PC_IP = "192.168.0.101"; // <— tukar ke IP PC anda bila test di telefon

const SIM_HOST = Platform.OS === "android" ? "10.0.2.2" : "127.0.0.1";

// >>> Tukar flag ini ikut situasi anda <<<
const USE_PC_LAN = true; // true = telefon sebenar | false = emulator/simulator

const FALLBACK_EMULATOR = `http://${SIM_HOST}:${API_PORT}/api/v1`;
const FALLBACK_PC_LAN = `http://${PC_IP}:${API_PORT}/api/v1`;

const API_BASE_URL =
  (ENV_BASE && ENV_BASE.trim()) ||
  (USE_PC_LAN ? FALLBACK_PC_LAN : FALLBACK_EMULATOR);

/* ---------------------- TYPES ---------------------- */
type SurahItem = {
  id: number;
  number: number;
  latin: string;
  arabic: string;
  place: "Makkah" | "Madinah"; // ikut DB anda
  ayat: number;
  alias?: string | null;
};
type ApiList<T> = { data: T[] };
type FilterTab = "surat" | "juz" | "halaman";

/* ---------------------- CONSTANTS ---------------------- */
const OFTEN_READ = ["Al-Kahfi", "Ayat Kursi", "Al-Baqarah"];

// 👉 ruang tambahan khas untuk kad Surah An-Nas supaya tak overlap navbar
const LAST_CARD_EXTRA_SPACE = 96; // anggaran tinggi navbar + sedikit ruang

/* Util: fetch with timeout + verbose logs */
async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit & { timeoutMs?: number }
) {
  const timeoutMs = init?.timeoutMs ?? 12000;
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const startedAt = Date.now();
    console.log("[READ] Fetch start:", input);
    const res = await fetch(input, { ...init, signal: ctrl.signal });
    const dur = Date.now() - startedAt;
    console.log(
      "[READ] Fetch done:",
      typeof input === "string" ? input : input.toString(),
      res.status,
      `${dur}ms`
    );
    return res;
  } catch (err) {
    console.log("[READ] Fetch error:", err);
    throw err;
  } finally {
    clearTimeout(id);
  }
}

/* ---------------------- COMPONENT ---------------------- */
export default function ReadScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("surat");

  const [surahs, setSurahs] = useState<SurahItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [debugUrl, setDebugUrl] = useState<string>("");

  useEffect(() => {
    let alive = true;
    (async () => {
      const url = `${API_BASE_URL}/surahs`;
      setDebugUrl(url);
      try {
        setLoading(true);
        setErr(null);
        console.log("[READ] Using API_BASE_URL:", API_BASE_URL);
        const res = await fetchWithTimeout(url, { timeoutMs: 12000 });
        if (!res.ok) {
          const body = await res.text().catch(() => "");
          console.log("[READ] Non-200 body:", body?.slice(0, 400));
          throw new Error(`HTTP ${res.status}`);
        }

        // 👇 FIX: sokong {data:[...]} atau terus [...]
        const payload = (await res.json()) as ApiList<SurahItem> | SurahItem[];
        const list: SurahItem[] = Array.isArray(payload)
          ? payload
          : payload?.data ?? [];

        console.log("[READ] Surah count:", list.length);
        if (alive) setSurahs(list);
      } catch (e: any) {
        const msg =
          e?.name === "AbortError"
            ? "Request timeout/aborted"
            : e?.message || "Gagal memuat surah";
        console.log("[READ] Final error:", msg);
        if (alive) setErr(msg);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return surahs;
    return surahs.filter(
      (s) =>
        s.latin.toLowerCase().includes(q) ||
        s.arabic.includes(query) ||
        (!!s.alias && s.alias.toLowerCase().includes(q)) ||
        String(s.number) === q
    );
  }, [query, surahs]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* HEADER */}
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

          {/* DEBUG BANNER: tunjuk BASE URL supaya mudah semak */}
          <View
            style={{
              marginBottom: 8,
              backgroundColor: "#ffffff30",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 10, color: "#043b2a" }}>
              BASE: {API_BASE_URL}
            </Text>
          </View>

          {/* Search */}
          <View style={[styles.fullWidth, styles.searchWrap]}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Pencarian surah dalam Al-Quran…"
              placeholderTextColor="#cfead8"
              style={styles.searchInput}
            />
            <TouchableOpacity style={styles.searchBtn}>
              <Text style={styles.searchBtnText}>🔎</Text>
            </TouchableOpacity>
          </View>

          {/* Sering dibaca */}
          <View style={[styles.fullWidth, { marginTop: 14 }]}>
            <Text style={styles.sectionLabel}>Sering dibaca:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingRight: 8 }}
            >
              {OFTEN_READ.map((t) => (
                <TouchableOpacity key={t} style={styles.pill} onPress={() => setQuery(t)}>
                  <Text style={styles.pillText}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Filter Tabs (visual) */}
          <View style={[styles.fullWidth, styles.tabsRow]}>
            <Tab
              label="Surat"
              active={activeTab === "surat"}
              onPress={() => setActiveTab("surat")}
              icon="📄"
            />
            <Tab
              label="Juz"
              active={activeTab === "juz"}
              onPress={() => setActiveTab("juz")}
              icon="🧩"
            />
            <Tab
              label="Halaman"
              active={activeTab === "halaman"}
              onPress={() => setActiveTab("halaman")}
              icon="📑"
            />
          </View>
        </ImageBackground>

        {/* Content */}
        <View style={styles.contentSheet}>
          {activeTab !== "surat" ? (
            <View style={styles.comingSoon}>
              <Text style={styles.comingSoonText}>
                {activeTab === "juz" ? "Fungsi Juz" : "Fungsi Halaman"} akan datang.
              </Text>
            </View>
          ) : loading ? (
            <View style={{ padding: 24, alignItems: "center" }}>
              <ActivityIndicator />
              <Text style={{ marginTop: 8, color: "#668c79" }}>
                Memuat senarai surah…
              </Text>
            </View>
          ) : err ? (
            <View style={{ padding: 24 }}>
              <Text style={{ color: "#b00020", marginBottom: 6 }}>Ralat: {err}</Text>
              {!!debugUrl && (
                <>
                  <Text style={{ color: "#666" }}>URL: {debugUrl}</Text>
                  <Text style={{ color: "#666", marginTop: 4 }}>
                    Tip: Emulator Android gunakan{" "}
                    <Text style={{ fontWeight: "700" }}>
                      http://10.0.2.2:{API_PORT}
                    </Text>
                    . Telefon sebenar gunakan IP PC:{" "}
                    <Text style={{ fontWeight: "700" }}>{PC_IP}</Text>.
                  </Text>
                </>
              )}
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(i) => String(i.id)}
              scrollEnabled={false}
              contentContainerStyle={{ padding: 14 }}
              renderItem={({ item }) => (
                <SurahCard
                  // ✅ hanya Surah An-Nas (114) dapat margin bawah extra
                  extraStyle={
                    item.number === 114 ? { marginBottom: LAST_CARD_EXTRA_SPACE } : undefined
                  }
                  item={item}
                  onPress={() => {
                    console.log("[READ] Tap surah:", item.number, item.latin);
                    // ✅ Navigate ke skrin bacaan dan pass params
                    router.push({
                      pathname: "/readingview", // tukar jika route anda lain (cth: "/read/[surahId]")
                      params: {
                        surahId: String(item.number),
                        surahName: item.latin,
                        arabic: item.arabic,
                      },
                    });
                  }}
                />
              )}
            />
          )}
        </View>
      </ScrollView>

      {/* Bottom Navbar */}
      <BottomNav />
    </SafeAreaView>
  );
}

/* ---------------------- SUBCOMPONENTS ---------------------- */
function Tab({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  icon: string;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.tabBtn, active && styles.tabBtnActive]}>
      <Text style={styles.tabIcon}>{icon}</Text>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function SurahCard({
  item,
  onPress,
  extraStyle,
}: {
  item: SurahItem;
  onPress: () => void;
  extraStyle?: any;
}) {
  return (
    <TouchableOpacity activeOpacity={0.85} style={[styles.card, extraStyle]} onPress={onPress}>
      <View style={styles.leftBadgeWrap}>
        <View style={styles.badgeOuter}>
          <View style={styles.badgeInner}>
            <Text style={styles.badgeNum}>{item.number}</Text>
          </View>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>
          {item.latin} {item.alias ? <Text style={styles.alias}>({item.alias})</Text> : null}
        </Text>
        <View style={styles.metaRow}>
          <SmallTag text={item.place} />
          <SmallDot />
          <SmallTag text={`${item.ayat} Ayat`} />
        </View>
      </View>

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
function SmallDot() {
  return <View style={styles.dot} />;
}

function BottomNav() {
  const items = [
    { key: "home", label: "Home", icon: "🏠" },
    { key: "read", label: "Read", icon: "📘", active: true },
    { key: "memorize", label: "Memorize", icon: "🧠" },
    { key: "quiz", label: "Quiz", icon: "❔" },
    { key: "profile", label: "Profile", icon: "👤" },
  ];
  return (
    <View style={styles.navbar}>
      {items.map((it) => (
        <TouchableOpacity key={it.key} style={styles.navItem}>
          <Text style={[styles.navIcon, it.active && styles.navIconActive]}>{it.icon}</Text>
          <Text style={[styles.navLabel, it.active && styles.navLabelActive]}>{it.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

/* ---------------------- STYLES ---------------------- */
const GREEN = "#0e6b45";
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
  searchBtnText: { fontSize: 16 },

  sectionLabel: { color: "#ffffff", marginBottom: 8, fontSize: 12, opacity: 0.95 },
  pill: {
    backgroundColor: "#e2fff0",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  pillText: { color: GREEN_DARK, fontSize: 12, fontWeight: "600" },

  tabsRow: { marginTop: 12, flexDirection: "row", gap: 10 },
  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#eaf5ef",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#eaf5ef",
  },
  tabBtnActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  tabIcon: { fontSize: 14 },
  tabText: { color: GREEN_DARK, fontWeight: "700", fontSize: 12 },
  tabTextActive: { color: "#3a2a00" },

  contentSheet: {
    backgroundColor: "#f6fbf7",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    marginTop: 10,
  },

  comingSoon: { padding: 24 },
  comingSoonText: { color: "#668c79", textAlign: "center" },

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
  leftBadgeWrap: { paddingRight: 12 },
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
  badgeNum: { color: GREEN_DARK, fontWeight: "800" },

  cardTitle: { fontSize: 14, fontWeight: "700", color: "#244c3b" },
  alias: { color: "#7aa28f", fontWeight: "600" },
  metaRow: { marginTop: 6, flexDirection: "row", alignItems: "center", gap: 6 },

  smallTag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#e9f6ef",
  },
  smallTagText: { fontSize: 10, color: GREEN_DARK, fontWeight: "700" },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#c2d7cd" },

  arabic: { fontSize: 18, color: "#1e3a2f", marginLeft: 12, textAlign: "right" },

  navbar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#004d25",
    paddingVertical: 12,
    elevation: 10,
  },
  navItem: { alignItems: "center", gap: 2 },
  navIcon: { fontSize: 18, color: "#d5f2e4" },
  navIconActive: { color: ACCENT },
  navLabel: { fontSize: 11, color: "#d5f2e4" },
  navLabelActive: { color: "#ffd34d", fontWeight: "700" },
});
