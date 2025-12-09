//app/lecturer-dashboard/index.tsx

import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
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

  if (!user) return <Redirect href="./index.tsx" />;


  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const snapshot = await getDocs(collection(db, "EXAM"));

        const convertTo12HourFormat = (time: string) => {
          const [hours, minutes] = time.split(":").map(Number);  // Split time into hours and minutes
          const period = hours >= 12 ? "PM" : "AM";  // Determine AM or PM
          const hours12 = hours % 12 || 12;  // Convert 24-hour to 12-hour format
          const minutesFormatted = minutes < 10 ? `0${minutes}` : minutes;  // Ensure minutes have 2 digits
          return `${hours12}:${minutesFormatted} ${period}`;
        };
        const data = snapshot.docs.map((doc) => {
          const d = doc.data();
          const startTime = d.start_time ? convertTo12HourFormat(d.start_time) : "TBA"; // Convert start time
          const endTime = d.end_time ? convertTo12HourFormat(d.end_time) : "TBA"; // Convert end time
          return {
            exam_id: d.exam_id,
            subject: d.subject,
            location: d.location,
            date: d.date,
            startTime,
            endTime,
            time: `${startTime} - ${endTime}`,  // Concatenate with AM/PM
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

  const handleLogout = async () => {
    try {
      await firebaseAuth.signOut();
      router.replace("./index.tsx");
    } catch (err: any) {
      Alert.alert("Logout Failed", err.message);
    }
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Exam</Text>
        <TouchableOpacity 
          style={[styles.navRight, { paddingHorizontal: 12, paddingVertical: 8 }]} 
          onPress={async () => { 
            await firebaseAuth.signOut(); 
            router.replace("./index.tsx"); 
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="log-out-outline" size={24} color="#94a3b8" />
            <Text style={{ color: "gray" }}>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.loading}>Loading exams...</Text>
      ) : (
        <FlatList
          data={exams.filter(item => item.subject)} // Only include items with a valid subject
          keyExtractor={(item) => item.exam_id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card}
              onPress={() => handleExamPress(item)}
            >
              <Text style={styles.examTitle}>
                {item.exam_id}: {item.subject}
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
    </View>
  );
}
