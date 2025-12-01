import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Student {
  id: string;
  name: string;
  tableNumber: number;
  seatNumber: string;
  status: 'present' | 'absent' | 'left';
  checkInTime: string;
  details?: { registrationNumber?: string; department?: string; email?: string; image?: string };
}

interface Props {
  visible: boolean;
  student: Student | null;
  onClose: () => void;
  onStatusUpdate: (studentId: string, newStatus: 'present' | 'absent') => void;
}

export default function StudentDetailsModal({ visible, student, onClose, onStatusUpdate }: Props) {
  const [temp, setTemp] = useState<'present' | 'absent' | null>(null);
  if (!student) return null;

  const handleStatusChange = (s: 'present' | 'absent') => onStatusUpdate(student.id, s);

  const initials = student.name.split(' ').map(n => n[0]).slice(0,2).join('');

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}><MaterialIcons name="close" size={24} color="#000" /></TouchableOpacity>
            <Text style={styles.title}>Student Details</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.body}>
            <View style={styles.avatarWrap}>
              {student.details?.image ? (
                <Image source={{ uri: student.details.image }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}><Text style={styles.avatarInitials}>{initials}</Text></View>
              )}
            </View>

            <View style={styles.infoRow}><Text style={styles.infoLabel}>Name</Text><Text style={styles.infoValue}>{student.name}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Seat</Text><Text style={styles.infoValue}>Table {student.tableNumber} • Seat {student.seatNumber}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Check-in</Text><Text style={styles.infoValue}>{student.checkInTime}</Text></View>

            {student.details && (
              <View style={styles.detailsCard}>
                <Text style={styles.detailsTitle}>Additional Info</Text>
                {student.details.registrationNumber && <View style={styles.detailRow}><Text style={styles.detailLabel}>Reg No</Text><Text style={styles.detailValue}>{student.details.registrationNumber}</Text></View>}
                {student.details.department && <View style={styles.detailRow}><Text style={styles.detailLabel}>Dept</Text><Text style={styles.detailValue}>{student.details.department}</Text></View>}
                {student.details.email && <View style={styles.detailRow}><Text style={styles.detailLabel}>Email</Text><Text style={styles.detailValue}>{student.details.email}</Text></View>}
              </View>
            )}

            <View style={styles.overrideRow}>
              <TouchableOpacity style={[styles.overrideBtn, student.status === 'present' && styles.btnActive]} onPress={() => handleStatusChange('present')}>
                <MaterialIcons name="check-circle" size={18} color={student.status === 'present' ? '#fff' : '#34C759'} />
                <Text style={[styles.overrideText, student.status === 'present' && styles.overrideTextActive]}>Mark Present</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.overrideBtn, student.status === 'absent' && styles.btnActive]} onPress={() => handleStatusChange('absent')}>
                <MaterialIcons name="cancel" size={18} color={student.status === 'absent' ? '#fff' : '#FF3B30'} />
                <Text style={[styles.overrideText, student.status === 'absent' && styles.overrideTextActive]}>Mark Absent</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.doneBtn} onPress={onClose}><Text style={styles.doneText}>Done</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 16, fontWeight: '600' },
  body: { padding: 16 },
  avatarWrap: { alignItems: 'center', marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontSize: 20, fontWeight: '700' },
  infoRow: { marginBottom: 10 },
  infoLabel: { color: '#999', fontSize: 12 },
  infoValue: { fontSize: 14, fontWeight: '600' },
  detailsCard: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, marginTop: 8 },
  detailsTitle: { fontWeight: '700', marginBottom: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  detailLabel: { color: '#666' },
  detailValue: { fontWeight: '600' },
  overrideRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  overrideBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
  btnActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  overrideText: { color: '#666', fontWeight: '600' },
  overrideTextActive: { color: '#fff' },
  doneBtn: { backgroundColor: '#007AFF', margin: 12, padding: 12, borderRadius: 10, alignItems: 'center' },
  doneText: { color: '#fff', fontWeight: '700' },
});
