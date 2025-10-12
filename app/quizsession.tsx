import React, { useEffect, useState, useMemo } from "react";
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
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";

/* ---------------- CONFIG ---------------- */
const API_PORT = 8000;
const PC_IP = "192.168.0.101"; // ubah ikut IP PC kamu
const USE_PC_LAN = true; // jika guna telefon sebenar
const SIM_HOST = Platform.OS === "android" ? "10.0.2.2" : "127.0.0.1";
const BASE_URL = USE_PC_LAN
  ? `http://${PC_IP}:${API_PORT}/api/v1`
  : `http://${SIM_HOST}:${API_PORT}/api/v1`;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

/* ---------------- TYPES ---------------- */
type Option = { id: number; label?: string; option_text: string };
type Question = {
  id: number;
  question_text: string;
  options: Option[];
  // backend TIDAK patut hantar jawapan betul di sini untuk attempt sebenar
};

const GREEN = "#0e6b45";
const GREEN_DARK = "#0a5838";
const ACCENT = "#ffd34d";

/* ---------------- COMPONENT ---------------- */
export default function QuizSession() {
  const router = useRouter();
  const { quizId, title } = useLocalSearchParams<{ quizId: string; title?: string }>();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[index];

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (!quizId) throw new Error("quizId missing");
        // 1️⃣ Start attempt
        const { data: attempt } = await api.post(`/quizzes/${quizId}/start`);
        if (!mounted) return;
        setAttemptId(attempt.attempt_id);

        // 2️⃣ Load questions (tanpa dedah jawapan)
        const { data: qs } = await api.get(`/quizzes/${quizId}`);
        if (!mounted) return;

        // Normalise field: qs.questions atau qs.quiz_questions atau array terus
        const raw = qs?.questions ?? qs?.quiz_questions ?? qs ?? [];
        const normalized: Question[] = (Array.isArray(raw) ? raw : []).map((it: any, i: number) => ({
          id: Number(it.id),
          question_text: String(it.question_text ?? it.text ?? `Question ${i + 1}`),
          options: (it.options ?? []).map((op: any, j: number) => ({
            id: Number(op.id),
            label: op.label ?? ["A", "B", "C", "D", "E"][j] ?? "",
            option_text: String(op.option_text ?? op.text ?? ""),
          })),
        }));

        setQuestions(normalized);
      } catch (err) {
        console.log(err);
        Alert.alert("Error", "Gagal memuat kuiz. Pastikan server Laravel berjalan & endpoint betul.");
        router.back();
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [quizId, router]);

  const progressPct = useMemo(() => {
    if (!questions.length) return 0;
    return ((index + 1) / questions.length) * 100;
  }, [index, questions.length]);

  /* ---------------- ACTIONS ---------------- */
  const onSubmit = async () => {
    if (attemptId == null || picked == null || !q) return;

    try {
      // Hantar jawapan ke backend
      const { data } = await api.post(`/attempts/${attemptId}/submit`, {
        question_id: q.id,
        selected_option_id: picked,
      });

      // Jika backend pulangkan is_correct, gunakan itu
      const isCorrect = typeof data?.is_correct === "boolean"
        ? data.is_correct
        : undefined;

      setScore((s) => s + (isCorrect ? 1 : 0));

      const isLast = index >= questions.length - 1;
      if (!isLast) {
        setIndex((i) => i + 1);
        setPicked(null);
      } else {
        setFinished(true);
        // Opsyenal: fetch keputusan penuh
        // await api.get(`/attempts/${attemptId}`);
      }
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Gagal submit jawapan");
    }
  };

  const onRestart = () => {
    setIndex(0);
    setPicked(null);
    setScore(0);
    setFinished(false);
  };

  /* ---------------- RENDER ---------------- */
  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color="#079793" size="large" />
        <Text style={{ marginTop: 10, color: "#666" }}>Loading questions...</Text>
      </SafeAreaView>
    );
  }

  if (!questions.length) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Tiada soalan untuk kuiz ini.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <ImageBackground
        source={require("../assets/images/image_1.png")}
        style={styles.headerBg}
        imageStyle={{ resizeMode: "cover" }}
      >
        <View style={styles.headerRow}>
          <Link href="/(tabs)/quiz" asChild>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
          </Link>

          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.scoreChip}>
            <Ionicons name="trophy" size={14} color="#7a5b00" />
            <Text style={styles.scoreText}>{score}</Text>
          </View>
        </View>

        <Text style={styles.headerTitle}>{title || "Quiz Session"}</Text>
      </ImageBackground>

      {/* SHEET */}
      <View style={styles.sheet}>
        {/* Progress Bar */}
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${progressPct}%` }]} />
          </View>
          <Text style={styles.progressLabel}>
            Soalan {index + 1} / {questions.length}
          </Text>
        </View>

        {/* CONTENT */}
        {finished ? (
          <FinishCard
            score={score}
            total={questions.length}
            onRestart={onRestart}
            onBack={() => router.replace("/(tabs)/quiz")}
          />
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
            <View style={styles.questionCard}>
              <Text style={styles.qText}>{q.question_text}</Text>
            </View>

            <View style={{ marginTop: 10 }}>
              {q.options?.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.optBtn, picked === opt.id && styles.optPicked]}
                  onPress={() => setPicked(opt.id)}
                  activeOpacity={0.9}
                >
                  <Text
                    style={[styles.optText, picked === opt.id && styles.optTextActive]}
                  >
                    {(opt.label ?? "").trim() ? `${opt.label}. ` : ""}
                    {opt.option_text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.primaryBtn, { opacity: picked == null ? 0.5 : 1 }]}
                disabled={picked == null}
                onPress={onSubmit}
              >
                <Text style={styles.primaryText}>
                  {index === questions.length - 1 ? "Selesai" : "Hantar"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

/* ---------------- FINISH CARD ---------------- */
function FinishCard({
  score,
  total,
  onRestart,
  onBack,
}: {
  score: number;
  total: number;
  onRestart: () => void;
  onBack: () => void;
}) {
  const pct = Math.round((total ? score / total : 0) * 100);
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 18 }}>
      <View style={styles.finishCard}>
        <Text style={styles.finishTitle}>Selesai!</Text>
        <Text style={styles.finishSubtitle}>Skor anda</Text>

        <View style={styles.ringWrap}>
          <View style={styles.ringBg} />
          <View
            style={[
              styles.ringFg,
              { transform: [{ rotate: `${(pct / 100) * 360}deg` }] },
            ]}
          />
          <View style={styles.ringHole}>
            <Text style={styles.ringLabel}>{pct}%</Text>
          </View>
        </View>

        <Text style={styles.finishNote}>
          Betul {score} / {total} soalan
        </Text>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
          <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }]} onPress={onRestart}>
            <Text style={styles.primaryText}>Ulang</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryBtn, { flex: 1, backgroundColor: GREEN_DARK }]}
            onPress={onBack}
          >
            <Text style={styles.primaryText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  headerBg: { paddingTop: 36, paddingBottom: 22, paddingHorizontal: 20 },
  headerRow: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: { width: 60, height: 60 },
  iconBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  scoreChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 10,
    height: 26,
    borderRadius: 16,
  },
  scoreText: { fontWeight: "800", color: "#7a5b00", fontSize: 12 },
  headerTitle: { color: "#fff", fontWeight: "700", fontSize: 14, textAlign: "center", marginTop: 4 },

  sheet: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    marginTop: 10,
  },
  progressWrap: { paddingHorizontal: 16, paddingTop: 16 },
  progressTrack: { height: 8, borderRadius: 6, backgroundColor: "#eef2ef", overflow: "hidden" },
  progressBar: { height: "100%", backgroundColor: ACCENT, borderRadius: 6 },
  progressLabel: { marginTop: 6, color: "#6c8c7f", fontWeight: "600" },

  questionCard: {
    marginTop: 14,
    marginHorizontal: 16,
    backgroundColor: "#f6fbf7",
    borderRadius: 14,
    padding: 14,
  },
  qText: { fontSize: 16, color: "#1f2f2b", fontWeight: "700", lineHeight: 22 },

  optBtn: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e7ece8",
  },
  optPicked: { borderColor: ACCENT, backgroundColor: "#fff9e8" },
  optText: { color: "#244c3b", fontSize: 14, fontWeight: "700" },
  optTextActive: { color: "#6b5200" },

  actionsRow: { paddingHorizontal: 16, marginTop: 16 },
  primaryBtn: {
    backgroundColor: ACCENT,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryText: { fontWeight: "800", color: "#2b2b2b" },

  /* Finish Card */
  finishCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  finishTitle: { fontSize: 18, fontWeight: "800", color: "#1e3a2f" },
  finishSubtitle: { color: "#6c8c7f", marginTop: 2 },
  finishNote: { color: "#6c8c7f", marginTop: 8, textAlign: "center" },

  ringWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignSelf: "center",
    marginTop: 14,
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  ringBg: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 45,
    borderWidth: 8,
    borderColor: "#e8efe9",
  },
  ringFg: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 45,
    borderRightColor: ACCENT,
    borderTopColor: ACCENT,
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
    borderWidth: 8,
  },
  ringHole: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  ringLabel: { fontSize: 16, fontWeight: "800", color: GREEN_DARK },
});
