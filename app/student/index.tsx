import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ExamItem {
  id: string;
  course: string;
  code: string;
  date: string;
  time: string;
  location: string;
}

export default function StudentDashboard() {
  const exams: ExamItem[] = [
    { id: '1', course: 'Data Structures', code: 'CS201', date: 'Dec 05, 2025', time: '09:00 AM', location: 'Hall A' },
    { id: '2', course: 'Web Development', code: 'CS301', date: 'Dec 10, 2025', time: '01:00 PM', location: 'Hall B' },
  ];

  const renderExam = ({ item }: { item: ExamItem }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.course}>{item.course}</Text>
          <Text style={styles.code}>{item.code}</Text>
        </View>
        <MaterialIcons name="arrow-forward" size={20} color="#007AFF" />
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.meta}>{item.date} • {item.time}</Text>
        <Text style={styles.meta}>Location: {item.location}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Exam Schedule</Text>
        <Text style={styles.subtitle}>Upcoming exams and locations</Text>
      </View>

      <FlatList
        data={exams}
        renderItem={renderExam}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No upcoming exams</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 20, fontWeight: '600', color: '#000' },
  subtitle: { fontSize: 12, color: '#666', marginTop: 6 },
  list: { padding: 12 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  course: { fontSize: 16, fontWeight: '600', color: '#000' },
  code: { fontSize: 13, color: '#007AFF', marginTop: 4 },
  cardBody: { marginTop: 8 },
  meta: { fontSize: 13, color: '#666' },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' },
});
