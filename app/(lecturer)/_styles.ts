import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#0f172a", 
    padding: 20, 
    paddingTop: 60 
  },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center",
    marginBottom: 20 
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#6190d7ff" 
  },

navRight: { 
  flexDirection: "row", 
  alignItems: "center", 
  paddingHorizontal: 8 
},
  logout: { 
    color: "#007AFF", 
    fontSize: 16, 
    fontWeight: "600" 
  },
  card: { 
    backgroundColor: "#1e293b", 
    padding: 20, 
    borderRadius: 12, 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#1e293b"
  },
  examTitle: { 
    color: "#fff", 
    fontSize: 18, 
    fontWeight: "bold",  
  },
  examDetail: { 
    color: "#aaa", 
    fontSize: 14, 
    marginBottom: 3, 
    marginTop: 2
  },
  loading: {
    color: "#fff",
    textAlign: "center",
    marginTop: 20
  },
  emptyText: {
    color: "#666",
    textAlign: "center",
    marginTop: 20
  }
});