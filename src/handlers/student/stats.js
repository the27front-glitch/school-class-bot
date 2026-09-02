import { prisma } from "../../database/prisma.js";
import { getStudentLeaderboard } from "../../services/ranking.service.js";

/**
 * Show leaderboard and student's ranking
 * @param {import("grammy").Context} ctx
 */
export async function showStudentLeaderboard(ctx) {
  const userId = String(ctx.from.id);
  const student = await prisma.student.findUnique({
    where: { telegramId: userId },
  });

  const { yearMonth, rankings } = await getStudentLeaderboard();

  if (rankings.length === 0) {
    return ctx.reply("Reyting ma'lumotlari hozircha mavjud emas.");
  }

  let text = `🏆 <b>${yearMonth} OYI UCHUN SINF REYTINGI:</b>\n\n`;

  // Top 5 students
  const topList = rankings.slice(0, 5);
  topList.forEach((r, idx) => {
    const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "🔹";
    text += `${medal} <b>${idx + 1}-o'rin:</b> ${r.fullName}\n   └ Jami ball: <b>${r.totalPoints}</b> (Davomat: ${r.attendancePoints}, Test: ${r.quizPoints})\n`;
  });

  if (student) {
    const myRankIdx = rankings.findIndex((r) => r.id === student.id);
    if (myRankIdx !== -1) {
      const myInfo = rankings[myRankIdx];
      text += `\n───────────────\n` +
        `👤 <b>Sizning o'rningiz: ${myRankIdx + 1}-o'rin</b>\n` +
        `⭐️ Jami ballingiz: <b>${myInfo.totalPoints} ball</b>\n` +
        `   └ Davomatdan: +${myInfo.attendancePoints} ball\n` +
        `   └ Testlardan: +${myInfo.quizPoints} ball\n` +
        `   └ Qo'shimcha/Bonus: +${myInfo.bonusPoints} ball\n`;
    }
  }

  return ctx.reply(text, { parse_mode: "HTML" });
}

/**
 * Show student's personal profile
 * @param {import("grammy").Context} ctx
 */
export async function showStudentProfile(ctx) {
  const userId = String(ctx.from.id);
  const student = await prisma.student.findUnique({
    where: { telegramId: userId },
    include: {
      attendances: true,
      quizSubmissions: true,
    },
  });

  if (!student) {
    return ctx.reply("❌ O'quvchi ma'lumotlari topilmadi.");
  }

  const presentCount = student.attendances.filter((a) => a.status === "PRESENT").length;
  const absentCount = student.attendances.filter((a) => a.status === "ABSENT").length;
  const lateCount = student.attendances.filter((a) => a.status === "LATE").length;

  const text =
    `👤 <b>O'QUVCHI PROFILI:</b>\n\n` +
    `📛 F.I.Sh: <b>${student.fullName}</b>\n` +
    `⭐️ Umumiy ball: <b>${student.points + student.bonusPoints} ball</b>\n\n` +
    `📊 <b>Davomat statistikasi:</b>\n` +
    `✅ Kelgan darslar: <b>${presentCount} kun</b>\n` +
    `❌ Qoldirilgan darslar: <b>${absentCount} kun</b>\n` +
    `⏱ Kechikkan darslar: <b>${lateCount} kun</b>\n\n` +
    `📝 <b>Testlar statistikasi:</b>\n` +
    `Topshirilgan testlar: <b>${student.quizSubmissions.length} ta</b>\n`;

  return ctx.reply(text, { parse_mode: "HTML" });
}