import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  ImageBackground,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

// ✅ Guna satu sumber API sahaja
import { api, API_BASE_URL } from "../../src/constants/api";


/* ----------------- TYPES ----------------- */
type QuizItem = {
  id: number;
  title: string;
  question_count: number;
  progress?: number; // optional from API; we’ll default to 0
};

/* ----------------- SCREEN ----------------- */
export default function QuizScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [quizList, setQuizList] = useState<QuizItem[]>([]);

  const fetchQuizzes = useCallback(async () => {
    try {
      // Laravel kadang pulangkan {data:[...]} atau terus array
      const res = await api.get("/quizzes");
      const payload = res?.data;
      const list: QuizItem[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
        ? payload.data
        : [];

      const normalized = list.map((q) => ({
        ...q,
        progress: Math.max(0, Math.min(100, q.progress ?? 0)),
      }));
      setQuizList(normalized);
    } catch (err: any) {
      console.log("Failed to fetch quizzes", err?.message || err);
      Alert.alert("Network error", `Tidak dapat memuat kuiz dari ${API_BASE_URL}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchQuizzes();
  };

  const handleOpenQuiz = (quiz: QuizItem) => {
    const quizId = String(quiz.id);
    const title = quiz.title ?? "Quiz";
    // Jika file anda ialah app/quizsession.tsx:
    router.push({ pathname: "/quizsession", params: { quizId, title } });
    // Jika dynamic route (app/quizsession/[quizId].tsx), guna:
    // router.push({ pathname: "/quizsession/[quizId]", params: { quizId, title } });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
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
        <Text style={styles.headerTitle}>Quran Memory Challenge !!</Text>

        {/* Debug base untuk semak cepat */}
        <Text style={{ color: "#ffffffaa", fontSize: 10, marginTop: 4 }}>
          {API_BASE_URL}
        </Text>
      </ImageBackground>

      {/* Content */}
      <View style={styles.sheet}>
        {loading ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <ActivityIndicator color="#079793" size="large" />
            <Text style={{ color: "#999", marginTop: 10 }}>Loading quizzes...</Text>
          </View>
        ) : (
          <FlatList
            data={quizList}
            keyExtractor={(i) => String(i.id)}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={{ padding: 14, paddingBottom: 24 }}
            renderItem={({ item, index }) => (
              <QuizCard
                item={{
                  id: item.id,
                  title: item.title,
                  subtitle: `${item.question_count} Questions`,
                  progress: item.progress ?? 0,
                  emoji: ["🧠", "📚", "🌿", "🧪", "👥", "🎯", "📖"][index % 7],
                }}
                onPress={() => handleOpenQuiz(item)}
              />
            )}
            ListEmptyComponent={
              <View style={{ padding: 30, alignItems: "center" }}>
                <Text style={{ color: "#777" }}>No quiz available yet.</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

/* ----------------- SUBCOMPONENTS ----------------- */
function QuizCard({
  item,
  onPress,
}: {
  item: { id: number; title: string; subtitle: string; progress: number; emoji: string };
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.leftIcon}>
        <Text style={{ fontSize: 18 }}>{item.emoji}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>

        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${item.progress}%` }]} />
        </View>
      </View>

      <View style={styles.rightCol}>
        <ProgressRing value={item.progress} />
        <View style={{ height: 6 }} />
        <View style={styles.startBtn}>
          <Text style={styles.startText}>Start</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function ProgressRing({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.ringWrap}>
      <View style={styles.ringBg} />
      <View style={[styles.ringFg, { transform: [{ rotate: `${(clamped / 100) * 360}deg` }] }]} />
      <View style={styles.ringHole}>
        <Text style={styles.ringLabel}>{clamped}%</Text>
      </View>
    </View>
  );
}

/* ----------------- STYLES ----------------- */
const GREEN = "#0e6b45";
const GREEN_DARK = "#0a5838";
const ACCENT = "#ffd34d";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: {
    paddingTop: 36,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { width: 60, height: 60, marginBottom: 8 },
  headerTitle: { color: "#fff", fontWeight: "700", fontSize: 16 },

  sheet: {
    flex: 1,
    backgroundColor: "#fff",
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
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#f0f0f0",
  },
  leftIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e9f6ef",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: "800", color: "#244c3b" },
  cardSubtitle: { fontSize: 12, color: "#7aa28f", marginTop: 2 },

  progressTrack: {
    height: 6,
    backgroundColor: "#eef2ef",
    borderRadius: 6,
    marginTop: 8,
    overflow: "hidden",
  },
  progressBar: { height: "100%", backgroundColor: ACCENT, borderRadius: 6 },

  rightCol: { alignItems: "center", marginLeft: 10 },
  startBtn: { backgroundColor: GREEN, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 14 },
  startText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  ringWrap: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  ringBg: { position: "absolute", width: "100%", height: "100%", borderRadius: 22, borderWidth: 6, borderColor: "#e8efe9" },
  ringFg: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 22,
    borderRightColor: ACCENT,
    borderTopColor: ACCENT,
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
    borderWidth: 6,
  },
  ringHole: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  ringLabel: { fontSize: 10, fontWeight: "800", color: GREEN_DARK },
});
