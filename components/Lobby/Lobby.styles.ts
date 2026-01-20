import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    backgroundColor: "#7C3AED",
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
  },
  roomInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roomId: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  playerCount: {
    fontSize: 14,
    color: "#E9D5FF",
  },
  playersContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  playerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  playerStatus: {
    fontSize: 14,
    color: "#6B7280",
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  emptyText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 16,
    marginTop: 40,
  },
  footer: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  startButton: {
    backgroundColor: "#10B981",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.6,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  waitingMessage: {
    alignItems: "center",
    paddingVertical: 16,
  },
  waitingText: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
});
