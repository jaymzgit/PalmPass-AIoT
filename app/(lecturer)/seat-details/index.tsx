import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Modal, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./_styles"; // Assuming styles are defined elsewhere

const fixImageUrl = (url: string) => {
  if (url && url.includes("github.com") && url.includes("blob")) {
    return url.replace("github.com", "raw.githubusercontent.com").replace("/blob", "");
  }
  return url;
};

export default function SeatDetails({ visible, student, onClose, getSeatColor, updateStatus, formatTime }: any) {
  if (!student) return null;

  const imageUrl = fixImageUrl(student.image_url);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* HEADER */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seat Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* BODY */}
          <View style={styles.modalBody}>
            <View style={styles.profileRow}>
              <Image
                source={{ uri: imageUrl || 'fallback_image_url_here' }}  // Fallback image URL
                style={styles.profileImage}
              />
              <View style={styles.textInfo}>
                <Text style={styles.modalName}>{student.name || "Unknown"}</Text>
                <Text style={styles.modalSub}>Matric: {student.matric_no || "Not Available"}</Text>
                <Text style={styles.modalSub}>Program: {student.program || "Not Available"}</Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>
                Table No: <Text style={styles.infoValue}>{student.table_no || "Not Available"}</Text>
              </Text>

              <Text style={styles.infoLabel}>
                Status:{" "}
                <Text style={{ color: getSeatColor(student), fontWeight: "bold" }}>
                  {student.status || "Not Available"}
                </Text>
              </Text>

              <Text style={styles.infoLabel}>
                Scanned In:{" "}
                <Text style={styles.infoValue}>{formatTime(student.scan_time) || "Not Available"}</Text>
              </Text>
            </View>

            {/* ACTION BUTTONS */}
            <Text style={styles.updateTitle}>Update Status</Text>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#22c55e" }]}
              onPress={() => updateStatus("Present")}
            >
              <Text style={styles.btnText}>✓ Mark Present</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#f59e0b" }]}
              onPress={() => updateStatus("Toilet")}
            >
              <Text style={styles.btnText}>⏳ Mark Bathroom</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#ef4444" }]}
              onPress={() => updateStatus("Absent")}
            >
              <Text style={styles.btnText}>✕ Mark Absent</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#334155" }]}
              onPress={() => updateStatus("Pending")}
            >
              <Text style={styles.btnText}>↺ Reset to Pending</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}