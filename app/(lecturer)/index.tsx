import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { db, firebaseAuth } from "../../src/firebase";
import { styles } from "./_styles";

export interface Exam {
  exam_id: string;
  subject: string;
  location: string;
  time: string;
  date: string;
  startTime?: string;
  endTime?: string;
}

export default function LecturerDashboard() {
  const router = useRouter();
  const user = firebaseAuth.currentUser;

  // Redirect if not logged in
  if (!user) return <Redirect href="/" />;

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const snapshot = await getDocs(collection(db, "EXAM"));

        const convertTo12HourFormat = (time: string) => {
          if (!time) return "TBA";
          const [hours, minutes] = time.split(":").map(Number);
          const period = hours >= 12 ? "PM" : "AM";
          const hours12 = hours % 12 || 12;
          const minutesFormatted = minutes < 10 ? `0${minutes}` : minutes;
          return `${hours12}:${minutesFormatted} ${period}`;
        };

        const data = snapshot.docs.map((doc) => {
          const d = doc.data();
          const startTime = d.start_time ? convertTo12HourFormat(d.start_time) : "TBA";
          const endTime = d.end_time ? convertTo12HourFormat(d.end_time) : "TBA";
          
          return {
            exam_id: d.exam_id,
            subject: d.subject,
            location: d.location,
            date: d.date,
            startTime,
            endTime,
            time: `${startTime} - ${endTime}`,
          } as Exam;
        });
        setExams(data);
      } catch (e: any) { 
        console.error(e); 
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(firebaseAuth);
              router.replace("./(auth)/"); 
            } catch (err: any) {
              Alert.alert("Logout Failed", err.message);
            }
          },
        },
      ]
    );
  };

  const handleExamPress = (item: Exam) => {
    router.push({
      pathname: "/seat-monitoring",
      params: { 
        exam_id: item.exam_id, 
        subject: item.subject,
        location: item.location,
        time: item.time,
        date: item.date
      }
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Select Exam</Text>
        
        <TouchableOpacity 
          style={[styles.navRight, { paddingHorizontal: 12, paddingVertical: 8 }]} 
          onPress={handleLogout}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="log-out-outline" size={24} color="#94a3b8" />
            <Text style={{ color: "gray", marginLeft: 4 }}>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.loading}>Loading exams...</Text>
      ) : (
        <FlatList
          data={exams.filter(item => item.subject)}
          keyExtractor={(item) => item.exam_id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card}
              onPress={() => handleExamPress(item)}
            >
              <Text style={styles.examTitle}>
                {item.exam_id} - {item.subject}
              </Text>
              <Text style={styles.examDetail}>
                📅 {item.date} | 📍 {item.location}
              </Text>
              <Text style={styles.examDetail}>🕒 {item.time}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No exams found.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}
