// app/loginpage.tsx

import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from "react-native";
import { firebaseAuth } from "../src/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // State for tracking focus to highlight inputs
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Error", "Please fill in all fields");
    
    setLoading(true);
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      // Link to Dashboard
      router.replace("./lecturer-dashboard/");
    } catch (err: any) {
      Alert.alert("Login Failed","Email or Password is incorrect");
    } finally {
      setLoading(false);  
    }
  };
  
  useEffect(() => {
    if (firebaseAuth.currentUser) {
      router.replace("/lecturer-dashboard");
    }
  }, []);

  return (
    // KeyboardAvoidingView wraps the entire content
    // 'padding' behavior works best for iOS, 'height' for Android might be better 
    // or sometimes 'position' for more control. We'll keep your original 'padding' 
    // for iOS and 'height' for Android, which is a common setup.
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.keyboardAvoidingContainer}
    >
      {/* ScrollView is necessary so the content can move up with the keyboard */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>PalmPass</Text>
        <Text style={styles.subtitle}>Lecturer Login</Text>

        {/* Email Input Container - Dynamic Styling */}
        <View style={[
          styles.inputContainer,
          isEmailFocused && styles.inputFocused // Apply focus style if true
        ]}>
          <TextInput 
            style={styles.input} 
            placeholder="Email" 
            placeholderTextColor="#888" 
            value={email} 
            onChangeText={setEmail} 
            autoCapitalize="none" 
            // Focus Handlers
            onFocus={() => setIsEmailFocused(true)}
            onBlur={() => setIsEmailFocused(false)}
            keyboardType="email-address"
            returnKeyType="next"
            onSubmitEditing={() => { /* Focus next field */ }}
          />
        </View>
        
        {/* Password Input Container - Dynamic Styling */}
        <View style={[
          styles.inputContainer,
          isPasswordFocused && styles.inputFocused // Apply focus style if true
        ]}>
          <TextInput 
            style={styles.input} 
            placeholder="Password" 
            placeholderTextColor="#888" 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry 
            // Focus Handlers
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => setIsPasswordFocused(false)}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Logging in..." : "Login"}</Text>
        </TouchableOpacity>
        
        {/* Adding a spacer View for better spacing on small screens when the keyboard is up */}
        <View style={styles.spacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // New style for KeyboardAvoidingView to ensure it takes up full screen
  keyboardAvoidingContainer: { 
    flex: 1, 
    backgroundColor: "#f5f5f5" 
  },
  // Renamed the original 'container' to 'scrollContainer' and kept flexGrow: 1 
  // to ensure content is centered vertically when there's enough space.
  scrollContainer: { 
    flexGrow: 1, 
    justifyContent: "center", 
    padding: 24, 
  },
  title: { 
    fontSize: 32, 
    fontWeight: "bold", 
    textAlign: "center", 
    color: "#000", 
    marginBottom: 5 
  },
  subtitle: { 
    fontSize: 16, 
    textAlign: "center", 
    color: "#666", 
    marginBottom: 30 
  },
  inputContainer: { 
    backgroundColor: "#fff", 
    borderRadius: 10, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: "#ddd" // Default border color
  },
  // NEW: Style to apply when the input is focused
  inputFocused: {
    borderColor: "#007AFF", // Highlight color (e.g., your primary blue)
    borderWidth: 2, // Make the border slightly thicker for emphasis
  },
  input: { 
    padding: 15, 
    fontSize: 16, 
    color: "#000" 
  },
  button: { 
    backgroundColor: "#007AFF", 
    padding: 15, 
    borderRadius: 10, 
    alignItems: "center", 
    marginTop: 10 
  },
  buttonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
  spacer: {
    height: 50, // Added to provide extra padding at the bottom when the keyboard is up
  }
});