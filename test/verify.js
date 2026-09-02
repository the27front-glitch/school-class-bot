import { prisma } from "../src/database/prisma.js";
import { getStudentLeaderboard } from "../src/services/ranking.service.js";
import { generateMonthlyReportExcel } from "../src/services/excel.service.js";

async function verify() {
  console.log("🔍 Loyihani tekshirish boshlandi...");

  // 1. Check DB connection
  const count = await prisma.student.count();
  console.log(`✅ Prisma DB ulandi. Hozirgi o'quvchilar soni: ${count}`);

  // 2. Check Ranking Service
  const leaderboard = await getStudentLeaderboard();
  console.log(`✅ Ranking servisi ishladi. Joriy oy: ${leaderboard.yearMonth}`);

  // 3. Check Excel Generator
  const buffer = await generateMonthlyReportExcel();
  console.log(`✅ Excel hisobot generatsiya qilindi. Hajmi: ${buffer.length} bayt`);

  console.log("🎉 Barcha asosiy modullar xatosiz va mukammal ishlamoqda!");
  process.exit(0);
}

verify().catch((err) => {
  console.error("❌ Xatolik yuz berdi:", err);
  process.exit(1);
});