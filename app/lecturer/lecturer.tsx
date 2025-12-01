import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LecturerScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lecturer Dashboard</Text>
      <Text style={styles.subtitle}>Manage attendance and logs</Text>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/attendance') }>
          <Text style={styles.btnText}>Attendance</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/logging') }>
          <Text style={styles.btnText}>Exit / Return Log</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: '700', marginTop: 24 },
  subtitle: { color: '#666', marginTop: 8, marginBottom: 20 },
  buttons: { marginTop: 16, gap: 12 },
  btn: { backgroundColor: '#007AFF', padding: 14, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
});
