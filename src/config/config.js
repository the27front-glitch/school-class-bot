import dotenv from "dotenv";
dotenv.config();

export const config = {
  botToken: process.env.BOT_TOKEN || "",
  adminIds: (process.env.ADMIN_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .map(Number),
  attendancePoints: Number(process.env.ATTENDANCE_POINTS) || 5,
  quizPointMultiplier: Number(process.env.QUIZ_POINT_MULTIPLIER) || 10,
  geminiApiKey: process.env.GEMINI_API_KEY || "",
};

export function isAdmin(userId) {
  if (!userId) return false;
  return config.adminIds.includes(Number(userId));
}