import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Slot, useRouter, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  const router = useRouter();
  const segments = useSegments();
  const currentRoute = segments[segments.length - 1] || "Homepage"; // fallback

  const navItems = [
  { name: "Homepage", icon: "home", label: "Home" },
  { name: "read", icon: "book", label: "Read" },
  { name: "memorize", icon: "logo-electron", label: "Memorize" }, // <-- cantik & sesuai
  { name: "quiz", icon: "help-circle", label: "Quiz" },
  { name: "profile", icon: "person", label: "Profile" },
];


  const handleNavigate = (page: string) => {
    router.push(`./${page}`);
  };

  return (
    <>
      {/* Page content */}
      <Slot />

      {/* Bottom Navbar */}
      <View style={styles.navbar}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.name}
            style={styles.navItem}
            onPress={() => handleNavigate(item.name)}
          >
            <Ionicons
              name={item.icon as any}
              size={22}
              color={currentRoute === item.name ? "#FFD700" : "#fff"}
            />
            <Text
              style={[
                styles.navLabel,
                { color: currentRoute === item.name ? "#FFD700" : "#fff" },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  navbar: {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",   // pastikan icon & label tengah
  backgroundColor: "#004d25",
  height: 80,             // <-- tetapkan tinggi
  elevation: 8,
},

  navItem: { flex: 1, alignItems: "center", justifyContent: "center" },
  navLabel: { fontSize: 12, marginTop: 2, fontWeight: "500" },
});
