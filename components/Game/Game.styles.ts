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
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  leaveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 6,
  },
  leaveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  roundText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  timerText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  timerTextUrgent: {
    color: "#FCA5A5",
  },
  scoreContainer: {
    alignItems: "center",
  },
  scoreText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  questionContainer: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    lineHeight: 24,
  },
  answersContainer: {
    padding: 20,
  },
  answerButton: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedAnswer: {
    backgroundColor: "#7C3AED",
  },
  correctAnswer: {
    backgroundColor: "#10B981",
  },
  wrongAnswer: {
    backgroundColor: "#EF4444",
  },
  disabledAnswer: {
    opacity: 0.8,
  },
  answerText: {
    fontSize: 16,
    color: "#1F2937",
    textAlign: "center",
  },
  selectedAnswerText: {
    color: "#FFFFFF",
  },
  correctAnswerText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  wrongAnswerText: {
    color: "#FFFFFF",
  },
  waitingContainer: {
    alignItems: "center",
    padding: 20,
  },
  waitingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  waitingSubtext: {
    color: "#6B7280",
    fontSize: 14,
    marginBottom: 12,
  },
  playersStatus: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playersStatusTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  playerStatusItem: {
    alignItems: "center",
    marginRight: 16,
  },
  playerStatusName: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  playerStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  answeredDot: {
    backgroundColor: "#10B981",
  },
  pendingDot: {
    backgroundColor: "#FCA5A5",
  },
  resultsContainer: {
    flex: 1,
    padding: 20,
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 32,
  },
  rankingContainer: {
    flex: 1,
    marginBottom: 32,
  },
  rankingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rankingPosition: {
    width: 40,
    alignItems: "center",
  },
  positionText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  rankingInfo: {
    flex: 1,
    marginLeft: 16,
  },
  rankingName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  rankingScore: {
    fontSize: 14,
    color: "#6B7280",
  },
  youBadge: {
    backgroundColor: "#7C3AED",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  youText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  resultsButtons: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#7C3AED",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  secondaryButtonText: {
    color: "#7C3AED",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingText: {
    color: "#6B7280",
    fontSize: 16,
    marginTop: 16,
  },
});
