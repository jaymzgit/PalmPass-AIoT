import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function LoggingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exit & Return Log</Text>
      <Text style={styles.subtitle}>Logging is demo-only in this build.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  title: { fontSize: 20, fontWeight: '700' },
  subtitle: { color: '#666', marginTop: 8 },
});
