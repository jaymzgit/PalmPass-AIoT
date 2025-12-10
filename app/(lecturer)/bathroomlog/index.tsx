// app/bathroomlog/index.tsx

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { db } from "../../../src/firebase";
import { styles } from "./_styles";


type BathroomLogParams = {
  exam_id: string;
  subject: string;
  location: string;
  time: string;
};

const safeDate = (timestamp: any): Date | null => {
  if (!timestamp) return null;
  try {
    if (typeof timestamp.toDate === 'function') return timestamp.toDate();
    if (typeof timestamp === 'string') return new Date(timestamp);
    if (timestamp instanceof Date) return timestamp;
    if (typeof timestamp === 'number') return new Date(timestamp);
  } catch (error) { return null; }
  return null;
};

export default function BathroomLogScreen() {
  const router = useRouter();
  
  // 1. CAPTURE PARAMS (Same as sender)
  const params = useLocalSearchParams<BathroomLogParams>();
  const { exam_id, subject, location, time } = params;
  
  
  const insets = useSafeAreaInsets();
  
  const [bathroomLog, setBathroomLog] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [studentMap, setStudentMap] = useState<Record<string, any>>({});

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "STUDENT"), snap => {
      const map: any = {};
      snap.forEach(doc => { map[doc.data().matric_no] = doc.data(); });
      setStudentMap(map);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!exam_id) return;
    const q = query(collection(db, "BATHROOM_LOG"), where("exam_id", "==", exam_id), where("status", "==", "OUT"));
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(doc => {
        const d = doc.data();
        const timeOutDate = safeDate(d.time_out);
        let minutesAgo = 0;
        if (timeOutDate) minutesAgo = Math.floor((new Date().getTime() - timeOutDate.getTime()) / 60000);

        return {
          id: doc.id,
          ...d,
          name: studentMap[d.student_id]?.name || d.student_id, 
          minutesAgo
        };
      });
      data.sort((a, b) => b.minutesAgo - a.minutesAgo);
      setBathroomLog(data);
    });
    return unsub;
  }, [exam_id, studentMap]);

  const filteredLog = bathroomLog.filter(l => 
    (l.name && l.name.toLowerCase().includes(search.toLowerCase())) ||
    (l.student_id && l.student_id.toLowerCase().includes(search.toLowerCase()))
  );

  // Helper to go back with data
  const goBackToHall = () => {
    router.replace({
        pathname: "/seat-monitoring",
        params: { 
            exam_id: exam_id, 
            subject: subject, 
            location: location, 
            time: time 
        }
    });
  };

  return (
    // Use View with padding instead of SafeAreaView to fix black bars
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" />

      {/* NAV BAR */}
    <View style={styles.headerWrapper}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.replace("/")} style={styles.navLeft}>
           <Ionicons name="chevron-back" size={24} color="#38bdf8" />
        </TouchableOpacity>

        <View style={styles.navCenter}>
          <Text style={styles.navTitle}>{exam_id}</Text>
          <Text style={styles.navSub}>{location} | {time}</Text>
        </View>
      </View>

          {/* SEPARATOR LINE */}
          <View style={styles.headerSeparator} />

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#94a3b8" />
            <TextInput
            style={styles.searchInput}
            placeholder="Search by Table, Name, or Matric No..." 
            placeholderTextColor="#bfc3caff"
            value={search}
            onChangeText={setSearch}
            />
        </View>
      </View>
    </View>

      {/* LIST CONTENT */}
      <ScrollView style={styles.contentArea}>
         <View style={styles.sectionHeader}>
            <Ionicons name="time-outline" size={24} color="#38bdf8" />
            <Text style={styles.sectionTitle}>Bathroom Log (Live)</Text>
         </View>

         {filteredLog.length === 0 ? (
             <Text style={{color: "#64748b", textAlign: "center", marginTop: 50, fontSize: 16}}>
                No students currently outside.
             </Text>
         ) : (
             filteredLog.map((log, index) => {
                const isLate = log.minutesAgo > 10;
                return (
                    <View key={index} style={[styles.logCard, isLate ? styles.logCardLate : styles.logCardNormal]}>
                        <View style={styles.cardTopRow}>
                            <Text style={styles.cardName}>{log.name}</Text>
                            {isLate && <Ionicons name="warning-outline" size={22} color="#facc15" />}
                        </View>
                        <Text style={isLate ? styles.cardIdLate : styles.cardId}>{log.student_id}</Text>
                        <Text style={isLate ? styles.timeTextYellow : styles.timeTextBlue}>{log.minutesAgo} min ago</Text>
                    </View>
                );
             })
         )}
         <View style={{height: 100}} /> 
      </ScrollView>

      {/* BOTTOM TAB BAR */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
            style={styles.tabItem} 
            onPress={goBackToHall} 
        >
            <Ionicons name="grid-outline" size={24} color="#64748b" />
            <Text style={styles.tabText}>Hall Status</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}onPress={() => {
            router.push({
              pathname: '/bathroomlog',
              params: { 
                exam_id: exam_id, 
                subject: subject, 
                location: location, 
                time: time 
              }
            });
          }}
          >
            <Ionicons name="timer-outline" size={24} color="#38bdf8" />
            <Text style={[styles.tabText, styles.tabTextActive]}>Bathroom Log</Text>
        </TouchableOpacity>
      </View>
    </View>);
}