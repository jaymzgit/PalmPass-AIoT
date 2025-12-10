import { Ionicons } from "@expo/vector-icons";
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
import { getStudentExams, getStudentProfile } from "../../services/api";
import { firebaseAuth } from "../../src/firebase";

export default function StudentDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (firebaseAuth.currentUser) {
        const studentData = await getStudentProfile(firebaseAuth.currentUser.uid);
        setProfile(studentData);
        const examData = await getStudentExams(firebaseAuth.currentUser.uid);
        setExams(examData);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const handleLogout = async () => {
      Alert.alert("Logout", "Are you sure you want to logout?", [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: async () => { await signOut(firebaseAuth); router.replace("./(auth)/"); } },
      ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Exams</Text>
          <Text style={styles.subtitle}>
             {profile ? `${profile.name} (${profile.matric_no})` : "Loading..."}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={24} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* BODY */}
      {loading ? (
        <ActivityIndicator size="large" color="#38bdf8" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={exams}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.examTitle}>
                {item.code} - {item.name}
              </Text>
              <Text style={styles.examDetail}>
                📅 {item.date} | 📍 {item.venue}
              </Text>
              <Text style={styles.examDetail}>🕒 {item.time}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No registered exams found.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingTop: 10 },
  title: { fontSize: 24, fontWeight: "bold", color: "#6190d7ff" },
  subtitle: { fontSize: 14, color: "#94a3b8", marginTop: 4 },
  logoutBtn: { padding: 8 },
  card: { backgroundColor: "#1e293b", padding: 20, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: "#334155" },
  examTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 6 },
  examDetail: { color: "#cbd5e1", fontSize: 14, marginBottom: 4 },
  emptyText: { textAlign: "center", color: "#64748b", marginTop: 40, fontSize: 16 },
});