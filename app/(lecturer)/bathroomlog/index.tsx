import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { AlertTriangle, ArrowLeft, Clock, Search, User } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Import DB from your specific path
import { db } from "../../../src/firebase";

// --- THEME COLORS (Navy Blue Mode) ---
const THEME = {
  bg: '#0f172a',        // Dark Navy Background
  card: '#1e293b',      // Lighter Navy Card
  text: '#f1f5f9',      // White text
  subtext: '#94a3b8',   // Gray text
  blue: '#3b82f6',      // Blue accents
  red: '#dc2626',       // Red alert
  redBg: '#7f1d1d',     // Dark Red background
  border: '#334155'     // Border lines
};

type BathroomLogParams = {
  exam_id: string;
  subject: string;
  location: string;
  time: string;
};

export default function BathroomLogScreen() {
  const router = useRouter();

  // 1. GET PARAMS (Exam ID, etc)
  const params = useLocalSearchParams<BathroomLogParams>();
  const { exam_id, subject, location, time } = params;

  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [tick, setTick] = useState(0);

  // 2. LIVE LISTENER (Looking at STUDENT collection, same as Scanner)
  useEffect(() => {
    if (!exam_id) return;

    // We query the STUDENT collection for this specific Exam
    // We filter locally for 'bathroom' or 'suspicious' to show in the log
    const q = query(collection(db, "STUDENT"), where("examCode", "==", exam_id));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allStudents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Filter: Only show students who are NOT seated
      const outStudents = allStudents.filter((s: any) => s.status === 'bathroom' || s.status === 'suspicious');

      setStudents(outStudents);
    });

    return () => unsubscribe();
  }, [exam_id]);

  // 3. TIMER (Updates "Minutes Ago" every 60s)
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  // 4. HELPER: Calculate Minutes
  const getMinutesAgo = (timestamp: any) => {
    if (!timestamp) return 0;
    return Math.floor((Date.now() - timestamp) / 60000);
  };

  // 5. HELPER: Search Filter
  const filteredStudents = students.filter((s: any) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.seat?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={THEME.blue} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.navTitle}>{exam_id || "Exam"}</Text>
          <Text style={styles.navSub}>{subject || location}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Search size={20} color={THEME.subtext} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Name or Seat..."
            placeholderTextColor={THEME.subtext}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* LIST CONTENT */}
      <ScrollView style={styles.content}>
        <View style={styles.sectionHeader}>
          <Clock size={18} color={THEME.subtext} />
          <Text style={styles.sectionTitle}> BATHROOM LOG (LIVE)</Text>
        </View>

        {filteredStudents.length === 0 ? (
          <Text style={styles.emptyText}>No students currently out.</Text>
        ) : (
          filteredStudents.map((student: any) => {
            const mins = getMinutesAgo(student.timeOut);
            const isUrgent = mins > 10;

            return (
              <View key={student.id} style={[styles.logItem, {
                backgroundColor: isUrgent ? THEME.redBg : THEME.card,
                borderLeftColor: isUrgent ? THEME.red : THEME.blue,
                borderColor: isUrgent ? THEME.red : THEME.border
              }]}>
                <View>
                  <Text style={styles.logName}>{student.name}</Text>
                  <Text style={styles.logSub}>{student.seat} • {student.matric_no}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.logTime, { color: isUrgent ? THEME.red : THEME.blue }]}>
                    {mins} min ago
                  </Text>
                  {isUrgent && <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <AlertTriangle size={12} color={THEME.red} />
                    <Text style={{ color: THEME.red, fontSize: 10, marginLeft: 4, fontWeight: 'bold' }}>ALERT</Text>
                  </View>}
                </View>
              </View>
            );
          })
        )}
        <View style={{ height: 50 }} />
      </ScrollView>

      {/* BOTTOM TABS */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabBtn} onPress={() => router.replace({
          pathname: "/(lecturer)/seat-monitoring",
          params: { exam_id, subject, location, time }
        })}>
          <User size={24} color={THEME.subtext} />
          <Text style={styles.tabText}>Hall Status</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabBtn}>
          <Clock size={24} color={THEME.blue} />
          <Text style={[styles.tabText, { color: THEME.blue }]}>Bathroom Log</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg, paddingTop: Platform.OS === 'android' ? 30 : 0 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: THEME.border },
  backBtn: { padding: 5 },
  navTitle: { color: THEME.text, fontSize: 18, fontWeight: 'bold' },
  navSub: { color: THEME.subtext, fontSize: 12 },

  // Search
  searchContainer: { padding: 15, paddingBottom: 5 },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.card, borderRadius: 8, paddingHorizontal: 10, borderWidth: 1, borderColor: THEME.border },
  searchInput: { flex: 1, color: THEME.text, padding: 10, height: 45 },

  // Content
  content: { flex: 1, padding: 15 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { color: THEME.subtext, fontWeight: 'bold', fontSize: 12, marginLeft: 8 },
  emptyText: { color: THEME.subtext, textAlign: 'center', marginTop: 30 },

  // Log Card
  logItem: { padding: 15, borderRadius: 8, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 4, borderWidth: 1 },
  logName: { color: THEME.text, fontWeight: 'bold', fontSize: 16 },
  logSub: { color: THEME.subtext, fontSize: 12, marginTop: 4 },
  logTime: { fontWeight: 'bold', fontSize: 16 },

  // Tabs
  tabBar: { flexDirection: 'row', height: 70, borderTopWidth: 1, borderTopColor: THEME.border, backgroundColor: THEME.card },
  tabBtn: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabText: { color: THEME.subtext, fontSize: 10, marginTop: 4 },
});