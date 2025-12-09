import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../firebaseConfig";
import { getStudentExams, getStudentProfile } from "../services/api";

export default function StudentDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (auth.currentUser) {
        // 1. Fetch Profile using Auth UID
        const studentData = await getStudentProfile(auth.currentUser.uid);
        setProfile(studentData);

        // 2. Fetch Exams
        const examData = await getStudentExams();
        setExams(examData);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const handleLogout = async () => {
      Alert.alert("Logout", "Are you sure you want to logout?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await signOut(auth);
            router.replace("/");
          },
        },
      ]);
    };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER SECTION (Dark Blue) */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome,</Text>
            <Text style={styles.name}>{profile?.name || "Student"}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <MaterialIcons name="logout" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {/* Info Card Overlay */}
        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Program</Text>
            <Text style={styles.infoValue}>{profile?.program || "N/A"}</Text>
          </View>
          <View style={styles.verticalLine} />
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Matric Number</Text>
            <Text style={styles.infoValue}>{profile?.matric_no || "N/A"}</Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.sectionTitle}>My Registered Exams</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={exams}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <View style={styles.examCard}>
                <View style={styles.examDateBox}>
                  <Text style={styles.examDateText}>TODAY</Text>
                </View>
                <View style={styles.examDetails}>
                  <Text style={styles.examCode}>{item.code}</Text>
                  <Text style={styles.examName}>{item.name}</Text>
                  <Text style={styles.examTime}>{item.time} • {item.venue}</Text>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  header: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 50, // Extra space for the overlay card
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting: { color: "#E0E7FF", fontSize: 16 },
  name: { color: "#fff", fontSize: 24, fontWeight: "bold", marginTop: 4 },
  matric: { color: "#A5B4FC", fontSize: 14, marginTop: 2 },
  logoutBtn: { backgroundColor: "rgba(255,255,255,0.2)", padding: 8, borderRadius: 8 },
  
  infoCard: {
    position: "absolute",
    bottom: -30,
    left: 24,
    right: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  infoItem: { alignItems: "center", flex: 1 },
  infoLabel: { color: "#9CA3AF", fontSize: 12, marginBottom: 4 },
  infoValue: { color: "#111827", fontSize: 16, fontWeight: "bold" },
  statusValue: { color: "#10B981", fontSize: 16, fontWeight: "bold" },
  verticalLine: { width: 1, height: "80%", backgroundColor: "#E5E7EB" },

  body: { flex: 1, marginTop: 40, paddingHorizontal: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1F2937", marginBottom: 16 },
  
  examCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  examDateBox: {
    backgroundColor: "#EEF2FF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 16,
    alignItems: "center",
  },
  examDateText: { color: "#4F46E5", fontWeight: "bold", fontSize: 12 },
  examDetails: { flex: 1 },
  examCode: { color: "#6B7280", fontSize: 12, fontWeight: "600", marginBottom: 2 },
  examName: { color: "#1F2937", fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  examTime: { color: "#9CA3AF", fontSize: 12 },
});