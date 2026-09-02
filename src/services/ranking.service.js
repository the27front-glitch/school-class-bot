import { prisma } from "../database/prisma.js";
import { config } from "../config/config.js";

/**
 * Calculate total points and monthly ranking for all students
 * @param {string} yearMonth - Optional format 'YYYY-MM' (e.g. '2026-08')
 */
export async function getStudentLeaderboard(yearMonth = null) {
  const students = await prisma.student.findMany({
    include: {
      attendances: true,
      quizSubmissions: true,
    },
  });

  const now = new Date();
  const currentYM =
    yearMonth ||
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const studentScores = students.map((student) => {
    // Filter by yearMonth if specified
    const monthlyAttendances = student.attendances.filter((a) =>
      a.date.startsWith(currentYM)
    );
    const presentCount = monthlyAttendances.filter(
      (a) => a.status === "PRESENT"
    ).length;
    const lateCount = monthlyAttendances.filter(
      (a) => a.status === "LATE"
    ).length;

    // Attendance points: PRESENT = +5 pts, LATE = +2 pts
    const attendancePoints =
      presentCount * config.attendancePoints +
      lateCount * Math.floor(config.attendancePoints / 2);

    const monthlySubmissions = student.quizSubmissions.filter((s) => {
      const subDate = new Date(s.submittedAt);
      const subYM = `${subDate.getFullYear()}-${String(
        subDate.getMonth() + 1
      ).padStart(2, "0")}`;
      return subYM === currentYM;
    });

    const quizPoints = monthlySubmissions.reduce(
      (acc, s) => acc + s.score * config.quizPointMultiplier,
      0
    );

    const totalPoints =
      attendancePoints + quizPoints + (student.bonusPoints || 0);

    return {
      id: student.id,
      fullName: student.fullName,
      telegramId: student.telegramId,
      username: student.username,
      presentDays: presentCount,
      lateDays: lateCount,
      absentDays: monthlyAttendances.filter((a) => a.status === "ABSENT").length,
      quizzesTaken: monthlySubmissions.length,
      quizPoints,
      attendancePoints,
      bonusPoints: student.bonusPoints || 0,
      totalPoints,
    };
  });

  // Sort descending by totalPoints
  studentScores.sort((a, b) => b.totalPoints - a.totalPoints);

  return {
    yearMonth: currentYM,
    rankings: studentScores,
    studentOfTheMonth: studentScores[0] || null,
  };
}

/**
 * Add bonus points to student
 */
export async function addStudentBonus(studentId, points) {
  return await prisma.student.update({
    where: { id: studentId },
    data: { bonusPoints: { increment: points } },
  });
}