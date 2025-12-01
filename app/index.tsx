import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<"lecturer" | "student">("lecturer");

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const handleLogin = () => {
    const newErrors = {
      email: email ? "" : "Email is required",
      password: password ? "" : "Password is required",
    };

    setErrors(newErrors);

    // if any error exists, don't continue
    if (newErrors.email || newErrors.password) return;

    // simulate login without redirect or alert
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 700);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",   // centers everything vertically
          paddingVertical: 0,
        }}

        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>PalmPass</Text>
            <Text style={styles.subtitle}>Attendance & Exam Management</Text>
          </View>

          {/* LOGIN CARD */}
          <View style={styles.formContainer}>

            {/* ROLE SWITCH */}
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.inputLabel}>Login as</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  onPress={() => setRole("lecturer")}
                  style={[styles.rolePill, role === "lecturer" && styles.rolePillActive]}
                >
                  <Text
                    style={[
                      styles.rolePillText,
                      role === "lecturer" && styles.rolePillTextActive,
                    ]}
                  >
                    Lecturer
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setRole("student")}
                  style={[styles.rolePill, role === "student" && styles.rolePillActive]}
                >
                  <Text
                    style={[
                      styles.rolePillText,
                      role === "student" && styles.rolePillTextActive,
                    ]}
                  >
                    Student
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* EMAIL */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>

              <View
                style={[
                  styles.inputContainer,
                  errors.email ? styles.inputErrorBorder : null,
                ]}
              >
                <MaterialIcons name="email" size={20} color="#999" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    setErrors({ ...errors, email: "" });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>

              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
            </View>

            {/* PASSWORD */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>

              <View
                style={[
                  styles.inputContainer,
                  errors.password ? styles.inputErrorBorder : null,
                ]}
              >
                <MaterialIcons name="lock" size={20} color="#999" />

                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    setErrors({ ...errors, password: "" });
                  }}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                  autoCorrect={false}
                  autoCapitalize="none"
                  importantForAutofill="no"
                  autoComplete="off"
                  textContentType="none"
                />

                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialIcons
                    name={showPassword ? "visibility" : "visibility-off"}
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>

              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}
            </View>

            {/* LOGIN BUTTON */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <Text style={styles.loginButtonText}>Logging in...</Text>
              ) : (
                <>
                  <MaterialIcons name="login" size={20} color="#fff" />
                  <Text style={styles.loginButtonText}>Login</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>PalmPass © 2025</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingVertical: 0,

    // reduced spacing so header sits directly above the login card
    gap: 12,
    justifyContent: "center",
    alignItems: "center",
},

  header: {
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },

  formContainer: {
    backgroundColor: "#fff",
    width: "92%",
    maxWidth: 520,
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginBottom: 20,
  },

  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 14,
    color: "#000",
  },
  inputErrorBorder: {
    borderColor: "red",
  },
  errorText: {
    fontSize: 12,
    color: "red",
    marginTop: 4,
  },

  loginButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
    gap: 8,
  },
  loginButtonDisabled: { opacity: 0.6 },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },

  rolePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  rolePillActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  rolePillText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  rolePillTextActive: { color: "#fff" },

  footer: { alignItems: "center"},
  footerText: { fontSize: 12, color: "#999" },
});