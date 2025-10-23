// app/(tabs)/Homepage.tsx  (atau app/home/index.tsx ikut routing anda)
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const GREEN = "#4CAF50";

export default function Home() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header with background image */}
        <ImageBackground
          source={require("../../assets/images/image_1.png")}
          style={styles.header}
          imageStyle={{ resizeMode: "cover" }}
        >
          {/* LOGO */}
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.headerArabic}>
            خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ
          </Text>
          <Text style={styles.headerEnglish}>
            The best of you is the one who learns the Quran and teaches it
          </Text>
        </ImageBackground>

        {/* Poster Card */}
        <View style={styles.card}>
          <Image
            source={require("../../assets/images/fakta.jpg")}
            style={styles.poster}
            resizeMode="cover"
          />
        </View>

        {/* AI Card (white box radius 20) */}
        <View style={[styles.aiCard, { marginTop: 20 }]}>
          <View style={styles.aiRow}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={28}
              color={GREEN}
            />
            <Text style={styles.aiTitle}>AI SAYS...</Text>
          </View>
          <Text style={styles.aiText}>
            “Based on data collected, your memorization in Juz 1 is Weak.”
          </Text>
        </View>

        {/* Button */}
        <TouchableOpacity
          style={[styles.button, { marginTop: 30 }]}
          onPress={() => router.push("/memorize")}
          accessibilityRole="button"
          accessibilityLabel="Start memorization"
        >
          <Text style={styles.buttonText}>Let’s Get Started</Text>
        </TouchableOpacity>

        {/* Scrollable Cards (3 items) */}
        <View style={[styles.sectionHeaderWrap, { marginTop: 10 }]}>
          <Text style={styles.sectionHeader}>Recommended for you</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {[1, 2, 3].map((i) => (
            <View key={i} style={[styles.hCard, { width: width * 0.6 }]}>
              <Image
                source={{ uri: "https://i.ibb.co/9vYw4pH/quran.png" }}
                style={styles.hCardImage}
              />
              <Text style={styles.hCardTitle}>
                {i === 1
                  ? "Start Juz 1"
                  : i === 2
                  ? "Revise Al-Fatihah"
                  : "Quick Quiz"}
              </Text>
              <Text style={styles.hCardSubtitle}>
                {i === 1
                  ? "Intro memorization path"
                  : i === 2
                  ? "Daily revision"
                  : "10 questions"}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  header: {
    paddingTop: 36,
    paddingBottom: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { width: 60, height: 60, marginBottom: 10, resizeMode: "contain" },
  headerArabic: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 6,
    fontWeight: "600",
    textAlign: "center",
  },
  headerEnglish: { fontSize: 14, color: "#eee", textAlign: "center" },

  card: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    overflow: "hidden",
  },
  poster: { width: "100%", height: 220 },

  aiCard: {
    marginTop: 16,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 20, // radius 20
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  aiRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  aiTitle: { fontSize: 16, fontWeight: "700", marginLeft: 8, color: "#333" },
  aiText: { fontSize: 14, color: "#444" },

  button: {
    marginTop: 6,
    marginHorizontal: 60,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: GREEN,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  sectionHeaderWrap: {
    paddingTop: 18,
    paddingHorizontal: 16,
  },
  sectionHeader: { fontSize: 16, fontWeight: "700", color: "#1c1c1e" },

  hCard: {
    marginRight: 12,
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  hCardImage: {
    width: "100%",
    height: 90,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#f2f2f7",
  },
  hCardTitle: { fontSize: 15, fontWeight: "700", color: "#222" },
  hCardSubtitle: { fontSize: 13, color: "#666", marginTop: 2 },
});
