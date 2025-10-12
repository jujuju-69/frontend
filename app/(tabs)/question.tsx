// app/question.tsx (atau /app/tabs/question.tsx ikut struktur anda)
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";

/* ---------- Network config (selaraskan dgn quiz.tsx) ---------- */
const API_PORT = 8000;
const PC_IP = "192.168.0.101";           // <-- tukar IP PC anda
const USE_PC_LAN = true;                  // phone sebenar = true, emulator = false
const SIM_HOST = Platform.OS === "android" ? "10.0.2.2" : "127.0.0.1";
const BASE_URL = USE_PC_LAN
  ? `http://${PC_IP}:${API_PORT}/api/v1`
  : `http://${SIM_HOST}:${API_PORT}/api/v1`;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

/* ---------------- Types ---------------- */
type Option = { id: number; label: string; option_text: string };
type Question = {
  id: number;
  question_text: string;
  options: Option[];
  // (optional) correct_option_id?: number;  // server tak perlu dedah
};
type QuizListItem = {
  id: number;
  title: string;
  juz?: number | null;
  question_count: number;
  progress: number;
};

export default function QuestionPage() {
  const router = useRouter();
  const { juz: juzParam, quizId: quizIdParam } = useLocalSearchParams<{
    juz?: string;
    quizId?: string;
  }>();

  const juzNumber = useMemo(
    () => (juzParam ? parseInt(String(juzParam), 10) : undefined),
    [juzParam]
  );

  const [loading, setLoading] = useState(true);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [quizId, setQuizId] = useState<number | null>(
    quizIdParam ? parseInt(String(quizIdParam), 10) : null
  );
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentIndex];

  /* ---------- Load flow ----------
   * 1) Dapatkan quizId (daripada param atau carian ikut Juz)
   * 2) Start attempt → dapat attempt_id
   * 3) Ambil soalan kuiz
   */
  useEffect(() => {
    (async () => {
      try {
        let qid = quizId;

        // 1) Jika tiada quizId tapi ada Juz → cari dari /quizzes
        if (!qid && typeof juzNumber === "number") {
          const { data } = await api.get<QuizListItem[]>("/quizzes");
          // Prefer field 'juz' jika backend sediakan; fallback cari title "Juz X"
          const found =
            data.find((q) => q.juz === juzNumber) ||
            data.find((q) =>
              q.title?.toLowerCase().includes(`juz ${juzNumber}`.toLowerCase())
            );
          if (!found) {
            Alert.alert("Tiada Kuiz", `Tiada kuiz untuk Juz ${juzNumber}.`);
            setLoading(false);
            return;
          }
          qid = found.id;
          setQuizId(qid);
        }

        if (!qid) {
          Alert.alert("Ralat", "quizId atau juz tidak sah.");
          setLoading(false);
          return;
        }

        // 2) Start attempt
        const startRes = await api.post(`/quizzes/${qid}/start`);
        const startedAttemptId: number = startRes.data?.attempt_id;
        setAttemptId(startedAttemptId);

        // 3) Ambil soalan
        let qs: Question[] = [];
        try {
          const { data } = await api.get(`/quizzes/${qid}`);
          // Expect { questions: [...] } atau terus array
          qs = Array.isArray(data) ? data : data.questions ?? [];
        } catch {
          // fallback jika anda ada endpoint khusus
          const { data } = await api.get(`/quizzes/${qid}/questions`);
          qs = data ?? [];
        }

        // Optional: randomize pilihan MCQ
        qs = qs.map((q) => ({
          ...q,
          options: [...(q.options || [])].sort(() => Math.random() - 0.5),
        }));

        setQuestions(qs);
      } catch (e) {
        console.log(e);
        Alert.alert(
          "Ralat",
          "Gagal memuat soalan kuiz. Pastikan server Laravel berjalan."
        );
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswer = async (optionId: number) => {
    if (answered || !attemptId || !currentQuestion) return;

    setPicked(optionId);
    setAnswered(true);

    try {
      const res = await api.post(`/attempts/${attemptId}/submit`, {
        question_id: currentQuestion.id,
        selected_option_id: optionId,
      });

      // Jika backend pulangkan { correct: true/false }
      const isCorrect =
        typeof res?.data?.correct === "boolean"
          ? res.data.correct
          : undefined;

      if (isCorrect === true) {
        setScore((s) => s + 1);
        Alert.alert("Betul!", "Jawapan anda betul 👍");
      } else if (isCorrect === false) {
        Alert.alert("Salah", "Cuba soalan seterusnya.");
      }
      // Jika tiada info correctness, kita proceed tanpa alert
    } catch (e) {
      console.log(e);
      Alert.alert("Ralat", "Tidak dapat menghantar jawapan.");
    }
  };

  const handleNext = async () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setPicked(null);
      setAnswered(false);
    } else {
      // Tamat: optionally boleh GET /attempts/{attempt} untuk skor penuh
      Alert.alert("Quiz Selesai!", `Skor anda: ${score}/${questions.length}`, [
        { text: "OK", onPress: () => router.replace("/(tabs)/quiz") },
      ]);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#079793" />
        <Text style={{ marginTop: 10, color: "#666" }}>Loading questions…</Text>
      </View>
    );
  }

  if (!currentQuestion) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          No questions available {juzNumber ? `for Juz ${juzNumber}` : ""}.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.title}>
        {juzNumber ? `Juz ${juzNumber} Quiz` : `Quiz ${quizId}`}
      </Text>

      <View style={styles.card}>
        <Text style={styles.question}>{currentQuestion.question_text}</Text>

        {(currentQuestion.options || []).map((opt) => {
          const selected = picked === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[styles.option, selected && styles.optionSelected]}
              onPress={() => handleAnswer(opt.id)}
              disabled={answered}
            >
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {opt.label}. {opt.option_text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.nextButton, { opacity: !answered ? 0.5 : 1 }]}
        onPress={handleNext}
        disabled={!answered}
      >
        <Text style={styles.nextButtonText}>
          {currentIndex + 1 < questions.length ? "Next" : "Finish"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  card: { backgroundColor: "#f2f2f2", borderRadius: 15, padding: 20, marginBottom: 20 },
  question: { fontSize: 20, fontWeight: "600", marginBottom: 15 },

  option: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  optionSelected: {
    backgroundColor: "#fff9e8",
    borderColor: "#ffd34d",
  },
  optionText: { fontSize: 16, color: "#1f2f2b", fontWeight: "700" },
  optionTextSelected: { color: "#6b5200" },

  nextButton: {
    padding: 15,
    backgroundColor: "#4CAF50",
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
  },
  nextButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
