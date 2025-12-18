import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { checkUserRole } from "../../services/api";
import { firebaseAuth } from "../../src/firebase";

export default function LoginPage() {
  const router = useRouter();
  const passwordInputRef = useRef<TextInput>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState<"lecturer" | "student">("lecturer");

  const [errors, setErrors] = useState({ email: "", password: "" });

  const handleRoleChange = (newRole: "lecturer" | "student") => {
    if (role !== newRole) {
      setRole(newRole);
      setErrors({ email: "", password: "" });
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return Alert.alert("Missing Email", "Please enter your email address first.");
    try {
      await sendPasswordResetEmail(firebaseAuth, email);
      Alert.alert("Email Sent", "Check your inbox for password reset instructions.");
    } catch (error: any) {
      Alert.alert("Error", "Could not send reset email.");
    }
  };

  const handleAuthAction = async () => {
    const newErrors = {
      email: email ? "" : "Email is required",
      password: password ? "" : "Password is required",
    };

    setErrors(newErrors);

    if (newErrors.email || newErrors.password) return;

    setIsLoading(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(firebaseAuth, email, password);
        router.push({
          pathname: "/(auth)/complete_profile",
          params: { role: role, email: email }
        });
      } else {
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        const user = userCredential.user;
        const actualRole = await checkUserRole(user.uid);

        if (actualRole && actualRole !== role) {
          await signOut(firebaseAuth);
          Alert.alert("Access Denied", `This account is registered as a ${actualRole.toUpperCase()}. Please switch the role toggle.`);
          setIsLoading(false);
          return;
        }

        if (!actualRole) {
          router.push({
            pathname: "/(auth)/complete_profile",
            params: { role: role, email: email }
          });
          return;
        }

        if (role === "student") {
          router.replace("/(student)");
        } else {
          router.replace("/(lecturer)");
        }
      }
    } catch (error: any) {
      let msg = "Authentication failed.";
      if (error.code === 'auth/wrong-password') msg = "Incorrect password.";
      else if (error.code === 'auth/user-not-found') msg = "User not found. Please sign up.";
      else if (error.code === 'auth/invalid-email') msg = "Invalid email format.";
      else if (error.code === 'auth/email-already-in-use') msg = "Email already registered.";
      Alert.alert("Error", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>P</Text>
            </View>
            <Text style={styles.title}>PalmPass</Text>
            <Text style={styles.subtitle}>Exam Hall Management</Text>
          </View>

          {/* FORM CARD */}
          <View style={styles.card}>

            {/* ROLE SWITCH */}
            <View style={styles.roleContainer}>
              <TouchableOpacity onPress={() => handleRoleChange("lecturer")} style={[styles.rolePill, role === "lecturer" && styles.rolePillActive]}>
                <Ionicons name="school-outline" size={18} color={role === "lecturer" ? "#fff" : "#94a3b8"} />
                <Text style={[styles.roleText, role === "lecturer" && styles.roleTextActive]}>Lecturer</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleRoleChange("student")} style={[styles.rolePill, role === "student" && styles.rolePillActive]}>
                <Ionicons name="person-outline" size={18} color={role === "student" ? "#fff" : "#94a3b8"} />
                <Text style={[styles.roleText, role === "student" && styles.roleTextActive]}>Student</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.formTitle}>{isRegistering ? "Create Account" : "Welcome Back"}</Text>

            {/* EMAIL */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputContainer, errors.email ? styles.inputError : null]}>
                <Ionicons name="mail-outline" size={20} color="#94a3b8" />
                <TextInput
                  style={styles.input}
                  placeholder={role === "student" ? "matric@student.utem.edu.my" : "lecturer@utem.edu.my"}
                  placeholderTextColor="#64748b"
                  value={email}
                  onChangeText={(t) => { setEmail(t); setErrors({ ...errors, email: "" }); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                />
              </View>
              {/* 👇 ERROR TEXT ADDED HERE */}
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            {/* PASSWORD */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputContainer, errors.password ? styles.inputError : null]}>
                <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" />
                <TextInput
                  ref={passwordInputRef}
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#64748b"
                  value={password}
                  secureTextEntry={!showPassword}
                  onChangeText={(t) => { setPassword(t); setErrors({ ...errors, password: "" }); }}
                  returnKeyType="go"
                  onSubmitEditing={handleAuthAction}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>
              {/* 👇 ERROR TEXT ADDED HERE */}
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            {!isRegistering && (
              <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.button} onPress={handleAuthAction} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : (
                <Text style={styles.buttonText}>{isRegistering ? "Sign Up" : "Login"}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>{isRegistering ? "Already have an account?" : "Don't have an account?"}</Text>
              <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
                <Text style={styles.footerLink}>{isRegistering ? "Login" : "Sign Up"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 20 },

  header: { alignItems: "center", marginBottom: 30 },
  logoBox: {
    width: 64, height: 64, backgroundColor: "#38bdf8", borderRadius: 16,
    justifyContent: "center", alignItems: "center", marginBottom: 16,
    shadowColor: "#38bdf8", shadowOpacity: 0.3, shadowRadius: 8, elevation: 4
  },
  logoText: { color: "#fff", fontSize: 32, fontWeight: "bold" },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  subtitle: { fontSize: 14, color: "#94a3b8", marginTop: 4 },

  card: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#334155"
  },

  roleContainer: { flexDirection: "row", backgroundColor: "#0f172a", borderRadius: 12, padding: 4, marginBottom: 24 },
  rolePill: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: 10 },
  rolePillActive: { backgroundColor: "#38bdf8" },
  roleText: { marginLeft: 8, fontWeight: "600", color: "#94a3b8" },
  roleTextActive: { color: "#fff" },

  formTitle: { fontSize: 18, fontWeight: "600", color: "#e2e8f0", marginBottom: 20, textAlign: "center" },

  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", color: "#94a3b8", marginBottom: 8 },
  inputContainer: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#0f172a",
    borderWidth: 1, borderColor: "#334155",
    borderRadius: 12, paddingHorizontal: 12, height: 50
  },
  input: { flex: 1, marginLeft: 10, fontSize: 15, color: "#fff" },
  inputError: { borderColor: "#ef4444" },

  // Style for the error message
  errorText: { color: "#ef4444", fontSize: 12, marginTop: 4, marginLeft: 4 },

  forgotBtn: { alignSelf: "flex-end", marginBottom: 24 },
  forgotText: { color: "#38bdf8", fontSize: 13, fontWeight: "600" },

  button: {
    backgroundColor: "#38bdf8",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  footer: { flexDirection: "row", justifyContent: "center" },
  footerText: { color: "#94a3b8", fontSize: 14 },
  footerLink: { color: "#38bdf8", fontWeight: "bold", marginLeft: 4, fontSize: 14 },
});