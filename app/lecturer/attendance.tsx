import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import StudentDetailsModal from './components/StudentDetailsModal';

interface Student {
  id: string;
  name: string;
  tableNumber: number;
  seatNumber: string;
  status: 'present' | 'absent' | 'left';
  checkInTime: string;
}

export default function AttendanceScreen() {
  const [students, setStudents] = useState<Student[]>([
    { id: '1', name: 'Alice Johnson', tableNumber: 1, seatNumber: 'A1', status: 'present', checkInTime: '09:02 AM' },
    { id: '2', name: 'Bob Smith', tableNumber: 1, seatNumber: 'A2', status: 'absent', checkInTime: '-' },
  ]);
  const [selected, setSelected] = useState<Student | null>(null);
  const [showModal, setShowModal] = useState(false);

  const open = (s: Student) => { setSelected(s); setShowModal(true); };

  const handleStatusUpdate = (id: string, newStatus: 'present' | 'absent') => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance</Text>
      <FlatList
        data={students}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingTop: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => open(item)}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>Table {item.tableNumber} • Seat {item.seatNumber}</Text>
          </TouchableOpacity>
        )}
      />

      {selected && (
        <StudentDetailsModal visible={showModal} student={selected as any} onClose={() => setShowModal(false)} onStatusUpdate={handleStatusUpdate} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  title: { fontSize: 20, fontWeight: '700' },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 10 },
  name: { fontWeight: '600' },
  meta: { color: '#666', marginTop: 4 },
});
