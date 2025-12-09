// app/seat-monitoring/index.tsx

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db, firebaseAuth } from "../../src/firebase";
import SeatDetails from "../seat-details";
import { styles } from "./_styles";

// Helper for dates
const safeDate = (timestamp: any): Date | null => {
  if (!timestamp) return null;
  try {
    if (typeof timestamp.toDate === "function") return timestamp.toDate();
    if (typeof timestamp === "string") return new Date(timestamp);
    if (timestamp instanceof Date) return timestamp;
    if (typeof timestamp === "number") return new Date(timestamp);
  } catch { return null; }
  return null;
};

export default function SeatMonitoring() {
  const router = useRouter();

  const navigateToBathroomLog = () => {
    router.push({
      pathname: "/bathroomlogin",
      params: { exam_id, subject, location, time }
    });
  };

  // 1. CAPTURE PARAMETERS
  const params = useLocalSearchParams();
  const { exam_id, subject, location, time } = params;

  const [seating, setSeating] = useState<any[]>([]);
  const [studentMap, setStudentMap] = useState<Record<string, any>>({});
  const [bathroomIds, setBathroomIds] = useState<string[]>([]); 
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isStudentsLoaded, setStudentsLoaded] = useState(false);

  // 2. LOAD DATA
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "STUDENT"), (snap) => {
      const map: any = {};
      snap.forEach((doc) => {
        const data = doc.data();
        map[data.matric_no] = data;  // Store by matric_no
      });
      setStudentMap(map);
      setStudentsLoaded(true);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!exam_id) return;
    const q = query(collection(db, "ATTENDANCE"), where("exam_id", "==", exam_id));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => {
        const docData = d.data();
        
        // Get matric_no from ATTENDANCE
        const matricNo = docData.matric_no;
        
        // Look up student details using matric_no
        const studentData = studentMap[matricNo] || {};
        
      
        
        return {
          ...docData,
          attendance_id: d.id,
          matric_no: matricNo,
          name: studentData.name || "Unknown",
          program: studentData.program || "Not Available",
          faculty: studentData.faculty || "Faculty of Computing",
          image_url: studentData.image_url || null,
          student_id: matricNo,
          table_no: docData.table_no || "N/A",
          status: docData.status || "Pending",
          scan_time: safeDate(docData.timestamp),
        };
      });
      data.sort((a, b) => (a.table_no || "").localeCompare(b.table_no || ""));
      setSeating(data);
    });
    return unsub;
  }, [exam_id, studentMap]);

  useEffect(() => {
    if (!exam_id) return;
    const q = query(collection(db, "BATHROOM_LOG"), where("exam_id", "==", exam_id), where("status", "==", "OUT"));
    const unsub = onSnapshot(q, (snap) => {
      const ids = snap.docs.map(doc => doc.data().student_id);
      setBathroomIds(ids);
    });
    return unsub;
  }, [exam_id]);

  // 3. LOGIC
  const getSeatColor = useCallback((s: any) => {
    if (s.status === "Absent") return "#ef4444";
    if (bathroomIds.includes(s.student_id)) return "#f59e0b"; 
    if (s.status === "Present") return "#22c55e";
    return "#334155";
  }, [bathroomIds]);

  const updateStatus = async (status: string) => {
    if (!selectedStudent) return;
    try {
      await updateDoc(doc(db, "ATTENDANCE", selectedStudent.attendance_id), { status });
      setSelectedStudent(null);
    } catch { Alert.alert("Error", "Failed to update status"); }
  };

  const filtered = useMemo(() => {
    return seating.filter((s) => {
      const text = search.toLowerCase();
      return (
        (s.name && s.name.toLowerCase().includes(text)) ||
        (s.table_no && s.table_no.toLowerCase().includes(text)) ||
        (s.student_id && s.student_id.toLowerCase().includes(text))
      );
    });
  }, [seating, search]);

  // If students aren't loaded yet, show a spinner
  if (!isStudentsLoaded) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#38bdf8" />
        <Text style={{ color: "white", marginTop: 10 }}>Loading Student Names...</Text>
      </SafeAreaView>
    );
  }

  const handleNavigateToBathroomLog = () => {
    router.push({
      pathname: "/bathroomlogin",
      params: { 
        exam_id: exam_id, 
        subject: subject, 
        location: location, 
        time: time 
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER WITH SEARCH */}
      <View style={styles.headerWrapper}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => router.push("./lecturer-dashboard")} style={styles.navLeft}>
            <Ionicons name="chevron-back" size={24} color="#38bdf8" />
          </TouchableOpacity>
          <View style={styles.navCenter}>
            <Text style={styles.navTitle}>{exam_id}: {subject}</Text>
            <Text style={styles.navSub}>{location} | {time}</Text>
          </View>
          <TouchableOpacity style={styles.navRight} onPress={async () => { await firebaseAuth.signOut(); router.replace("./index.tsx"); }}>
            <Ionicons name="log-out-outline" size={24} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* SEPARATOR LINE */}
        <View style={styles.headerSeparator} />

        {/* SEARCH BAR INSIDE HEADER */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#94a3b8" />
            <TextInput 
              style={styles.searchInput} 
              placeholder="Search by Table, Name, or Matric No..." 
              placeholderTextColor="#94a3b8" 
              value={search} 
              onChangeText={setSearch} 
            />
          </View>
        </View>
      </View>

      {/* GRID */}
      <ScrollView contentContainerStyle={styles.grid}>
        <View style={styles.sectionHeader}>
          <Ionicons name="people-outline" size={20} color="#38bdf8" />
          <Text style={styles.sectionTitle}>Hall Seating Status</Text>
        </View>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: "#334155" }]} /><Text style={styles.legendText}>Empty</Text></View>
          <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: "#22c55e" }]} /><Text style={styles.legendText}>Here</Text></View>
          <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: "#f59e0b" }]} /><Text style={styles.legendText}>Toilet</Text></View>
          <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: "#ef4444" }]} /><Text style={styles.legendText}>Absent</Text></View>
        </View>
        <View style={styles.gridContainer}>
          {filtered.map((s, index) => (
            <TouchableOpacity key={index} style={[styles.seat, { backgroundColor: getSeatColor(s) }]} onPress={() => setSelectedStudent(s)}>
              <Text style={styles.seatNumber}>{s.table_no}</Text>
              <Text style={styles.seatName}>{s.name}</Text>
              <View style={styles.statusIconContainer}>
                {s.status === "Present" && !bathroomIds.includes(s.student_id) && <Ionicons name="checkmark-circle-outline" size={20} color="white" />}
                {s.status === "Absent" && <Ionicons name="close-circle-outline" size={20} color="white" />}
                {bathroomIds.includes(s.student_id) && <Ionicons name="time-outline" size={20} color="white" />}
                {s.status === "Pending" && <Ionicons name="person-outline" size={20} color="#94a3b8" />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* MODAL */}
      {selectedStudent && (
        <SeatDetails 
          visible={!!selectedStudent} 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
          getSeatColor={getSeatColor} 
          updateStatus={updateStatus} 
          formatTime={(d: any) => d ? d.toLocaleTimeString() : "-"} 
        />
      )}

      {/* BOTTOM TABS */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="grid-outline" size={24} color="#38bdf8" />
          <Text style={[styles.tabText, styles.tabTextActive]}>Hall Status</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={navigateToBathroomLog}>
          <Ionicons name="timer-outline" size={24} color="#64748b" />
          <Text style={styles.tabText}>Bathroom Log</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}