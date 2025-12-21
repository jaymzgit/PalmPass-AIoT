import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

  // Track students who have already been alerted (to avoid repeated popups)
  const alertedStudentsRef = useRef<Set<string>>(new Set());

  // Bathroom time limit in minutes
  const BATHROOM_TIME_LIMIT = 6;

  // 2. LIVE LISTENER (Combined)
  useEffect(() => {
    if (!exam_id) return;

    // A. Load Student Map first (for names)
    // Note: We listen to STUDENT just in case names update, similar to Seat Monitoring
    const unsubStudents = onSnapshot(collection(db, "STUDENT"), (snap) => {
      const map: Record<string, any> = {};
      snap.forEach(doc => {
        const d = doc.data();
        map[d.matric_no] = d;
      });

      // B. Listen to ATTENDANCE for this exam
      const q = query(collection(db, "ATTENDANCE"), where("exam_id", "==", exam_id));
      const unsubAttendance = onSnapshot(q, (attSnap) => {
        const outList: any[] = [];

        attSnap.forEach((doc) => {
          const attData = doc.data();
          // Filter for Toilet/Bathroom status
          if (attData.status === "Toilet" || attData.status === "Bathroom") {
            const studentInfo = map[attData.matric_no] || {};

            outList.push({
              id: doc.id,
              name: studentInfo.name || "Unknown",
              matric_no: attData.matric_no,
              seat: attData.table_no || "N/A",
              timeOut: attData.timestamp ?
                (attData.timestamp.toDate ? attData.timestamp.toDate() : new Date(attData.timestamp))
                : new Date(),
            });
          }
        });

        // Sort by timeOut (most recent first)
        outList.sort((a, b) => b.timeOut.getTime() - a.timeOut.getTime());
        setStudents(outList);
      });

      // Cleanup for attendance listener when students listener re-runs (unlikely but safe)
      return () => unsubAttendance();
    });

    return () => unsubStudents();
  }, [exam_id]);

  // 3. TIMER (Updates every second for live countdown)
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // 4. ALERT NOTIFICATION: Check for students exceeding bathroom time limit
  useEffect(() => {
    students.forEach((student) => {
      const mins = Math.floor((Date.now() - student.timeOut) / 60000);

      // Check if student exceeded time limit and hasn't been alerted yet
      if (mins > BATHROOM_TIME_LIMIT && !alertedStudentsRef.current.has(student.id)) {
        // Mark this student as alerted
        alertedStudentsRef.current.add(student.id);

        // Show alert popup
        Alert.alert(
          "⚠️ Bathroom Time Exceeded",
          `${student.name} (Seat: ${student.seat}) has been in the bathroom for ${mins} minutes.\n\nTime limit: ${BATHROOM_TIME_LIMIT} minutes`,
          [
            {
              text: "Dismiss",
              style: "cancel"
            },
            {
              text: "View Details",
              onPress: () => {
                // Scroll to the student or highlight them - for now just dismiss
              }
            }
          ],
          { cancelable: true }
        );
      }
    });

    // Clean up alerted students who are no longer in bathroom
    const currentStudentIds = new Set(students.map(s => s.id));
    alertedStudentsRef.current.forEach((id) => {
      if (!currentStudentIds.has(id)) {
        alertedStudentsRef.current.delete(id);
      }
    });
  }, [students, tick]); // Re-check when students change or timer ticks

  // 4. HELPER: Calculate Minutes
  const getMinutesAgo = (timestamp: any) => {
    if (!timestamp) return 0;
    return Math.floor((Date.now() - timestamp) / 60000);
  };

  // 5. HELPER: Format elapsed time as MM:SS
  const formatElapsedTime = (timestamp: any) => {
    if (!timestamp) return "0:00";
    const elapsed = Math.floor((Date.now() - timestamp) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 5. HELPER: Search Filter
  const filteredStudents = students.filter((s: any) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.seat?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/(lecturer)/dashboard")} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={THEME.blue} />
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
          <Ionicons name="search" size={20} color={THEME.subtext} />
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
          <Ionicons name="time-outline" size={18} color={THEME.subtext} />
          <Text style={styles.sectionTitle}> BATHROOM LOG (LIVE)</Text>
          {/* Live count badge */}
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{students.length}</Text>
          </View>
        </View>

        {filteredStudents.length === 0 ? (
          <Text style={styles.emptyText}>No students currently out.</Text>
        ) : (
          filteredStudents.map((student: any) => {
            const mins = getMinutesAgo(student.timeOut);
            const isUrgent = mins > BATHROOM_TIME_LIMIT;

            return (
              <View key={`${student.id}-${tick}`} style={[styles.logItem, {
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
                    {formatElapsedTime(student.timeOut)}
                  </Text>
                  <Text style={[styles.logTimeSub, { color: isUrgent ? THEME.red : THEME.subtext }]}>
                    Started {student.timeOut.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  {isUrgent && <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Ionicons name="alert-circle" size={12} color={THEME.red} />
                    <Text style={{ color: THEME.red, fontSize: 10, marginLeft: 4, fontWeight: 'bold' }}>ALERT</Text>
                  </View>}
                </View>
              </View>
            );
          })
        )}
        <View style={{ height: 50 }} />
      </ScrollView>

      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabBtn} onPress={() => router.replace({
          pathname: "/(lecturer)/seat-monitoring",
          params: { exam_id, subject, location, time }
        })}>
          {/* Inactive Icon - Gray */}
          <Ionicons name="grid-outline" size={24} color="#64748b" />
          <Text style={styles.tabText}>Hall Status</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabBtn}>
          {/* Active Icon - Blue */}
          <Ionicons name="timer-outline" size={24} color="#38bdf8" />
          <Text style={[styles.tabText, { color: "#38bdf8", fontWeight: "bold" }]}>Bathroom Log</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg, paddingTop: Platform.OS === 'android' ? 30 : 0 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#334155", // Match seat-monitoring
    backgroundColor: "#1e293b",   // Match seat-monitoring
  },
  backBtn: { padding: 5 },
  navTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  navSub: { color: "#94a3b8", fontSize: 12 }, // Match seat-monitoring color

  // Search
  searchContainer: {
    padding: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: "#1e293b" // Match seat-monitoring
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#334155", // Match seat-monitoring
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 0, // Removed border to match seat-monitoring
  },
  searchInput: { flex: 1, color: "white", padding: 10, height: 45 },

  // Content
  content: { flex: 1, padding: 15 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { color: "white", fontWeight: "bold", fontSize: 16, marginLeft: 8 }, // Match seat-monitoring
  countBadge: {
    backgroundColor: THEME.blue,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 10,
  },
  countText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyText: { color: THEME.subtext, textAlign: 'center', marginTop: 30 },

  // Log Card
  logItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    backgroundColor: "#1e293b", // Match seat-monitoring card
    borderWidth: 0 // Removed border
  },
  logName: { color: "white", fontWeight: "bold", fontSize: 15 },
  logSub: { color: "#94a3b8", fontSize: 12, marginTop: 4 },
  logTime: { fontWeight: "bold", fontSize: 18, color: "#38bdf8" },
  logTimeSub: { fontSize: 11, marginTop: 2 },

  // Tabs - EXACT MATCH from seat-monitoring
  tabBar: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0f172a",
    borderTopWidth: 1,
    borderTopColor: "#334155",
    height: 85,
    paddingBottom: 25,
    alignItems: "center",
    justifyContent: "space-around",
  },
  tabBtn: { alignItems: "center", justifyContent: "center", flex: 1 },
  tabText: { color: "#64748b", fontSize: 11, marginTop: 4, fontWeight: "600" },
});