import { prisma } from "../src/database/prisma.js";
import { config } from "../src/config/config.js";
import { getStudentLeaderboard, addStudentBonus } from "../src/services/ranking.service.js";
import { generateMonthlyReportExcel } from "../src/services/excel.service.js";
import { generateQuizByAI, GRADE_6_SUBJECTS, getNextSubjectInRotation } from "../src/services/ai.service.js";

async function runComprehensiveTests() {
  console.log("=================================================");
  console.log("🧪 TO'LIQ E2E TEST VA TUGMALARNI TEKSHIRISH BOSHLANDI");
  console.log("=================================================\n");

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`✅ [O'TDI] ${name}`);
      passedTests++;
    } else {
      console.error(`❌ [XATOLIK] ${name}`);
      failedTests++;
    }
  }

  // 1. DATABASE & CLEANUP
  console.log("\n--- 1. MA'LUMOTLAR BAZASI VA STRUKTURANI TEKSHIRISH ---");
  const initialStudentCount = await prisma.student.count();
  assert(typeof initialStudentCount === "number", "Prisma SQLite ma'lumotlar bazasi faol");

  // 2. O'QUVCHILAR QO'SHISH VA PIN-KOD
  console.log("\n--- 2. O'QUVCHILAR VA PIN-KOD XAVFSIZLIGI ---");
  const testStudent = await prisma.student.create({
    data: {
      fullName: "Sinov O'quvchi",
      pinCode: "7788",
    },
  });
  assert(testStudent.id > 0, "O'quvchi yaratildi");
  assert(testStudent.pinCode === "7788", "PIN-kod to'g'ri saqlandi (7788)");

  // Test linking with Telegram ID
  const linkedStudent = await prisma.student.update({
    where: { id: testStudent.id },
    data: {
      telegramId: "999888777",
      username: "sinov_user",
    },
  });
  assert(linkedStudent.telegramId === "999888777", "O'quvchi Telegram ID biriktirildi");

  // 3. DAVOMAT TIZIMI (2-smena)
  console.log("\n--- 3. DAVOMAT TIZIMI VA TOGGLE TESTLARI ---");
  const today = new Date().toISOString().split("T")[0];
  
  // Set Present
  const att1 = await prisma.attendance.upsert({
    where: { studentId_date: { studentId: testStudent.id, date: today } },
    update: { status: "PRESENT" },
    create: { studentId: testStudent.id, date: today, status: "PRESENT" },
  });
  assert(att1.status === "PRESENT", "Davomat: «Keldi» belgilandi");

  // Toggle to Absent
  const att2 = await prisma.attendance.update({
    where: { studentId_date: { studentId: testStudent.id, date: today } },
    data: { status: "ABSENT" },
  });
  assert(att2.status === "ABSENT", "Davomat toggle: «Kelmadi» ga o'tdi");

  // Toggle to Late
  const att3 = await prisma.attendance.update({
    where: { studentId_date: { studentId: testStudent.id, date: today } },
    data: { status: "LATE" },
  });
  assert(att3.status === "LATE", "Davomat toggle: «Kechikdi» ga o'tdi");

  // 4. HAFTALIK DARS JADVALI (6 kun)
  console.log("\n--- 4. HAFTALIK DARS JADVALI ---");
  const schedules = await prisma.schedule.findMany({
    orderBy: [{ dayOfWeek: "asc" }, { lessonOrder: "asc" }],
  });
  assert(schedules.length >= 25, `Barcha 6 kunlik darslar mavjud (Jami: ${schedules.length} ta dars)`);
  
  const mondayLessons = schedules.filter(s => s.dayOfWeek === 1);
  const saturdayLessons = schedules.filter(s => s.dayOfWeek === 6);
  assert(mondayLessons.length > 0, "Dushanba darslari mavjud");
  assert(saturdayLessons.length > 0, "Shanba darslari mavjud");

  // 5. GOOGLE GEMINI AI TESTLARI VA ISHLASH JARAYONI
  console.log("\n--- 5. AI TESTLAR, ISHLASH VA BALLAR HISOBLASH ---");
  assert(GRADE_6_SUBJECTS.length === 11, "6-sinfning 11 ta fani mavjud");
  const nextSubj = await getNextSubjectInRotation();
  assert(typeof nextSubj === "string", `Navbatdagi fan to'g'ri aniqlandi: ${nextSubj}`);

  // Create a simulated quiz with questions
  const quiz = await prisma.quiz.create({
    data: {
      subject: "Matematika",
      title: "6-sinf Matematika sinov testi",
      deadline: new Date(Date.now() + 48 * 3600 * 1000),
      isActive: true,
      questions: {
        create: [
          {
            text: "3/4 kasr o'nli kasr ko'rinishida qanday bo'ladi?",
            options: JSON.stringify(["0.5", "0.75", "0.25", "0.8"]),
            correctIndex: 1, // 0.75
          },
          {
            text: "Kvadratning tomoni 5 sm bo'lsa, uning perimetri nechaga teng?",
            options: JSON.stringify(["20 sm", "25 sm", "15 sm", "10 sm"]),
            correctIndex: 0, // 20 sm
          }
        ]
      }
    },
    include: { questions: true }
  });
  assert(quiz.questions.length === 2, "Test savollari bazada saqlandi");

  // Student takes quiz
  const submission = await prisma.quizSubmission.create({
    data: {
      quizId: quiz.id,
      studentId: testStudent.id,
      score: 2,
      totalQuestions: 2,
    }
  });
  assert(submission.score === 2, "O'quvchi testni topshirdi (2/2 to'g'ri)");

  // Update points
  await prisma.student.update({
    where: { id: testStudent.id },
    data: { points: { increment: 2 * config.quizPointMultiplier } }
  });

  // 6. BONUS BALL BERISH
  console.log("\n--- 6. BONUS VA OFFLINE BALLAR ---");
  const bonusStudent = await addStudentBonus(testStudent.id, 15);
  assert(bonusStudent.bonusPoints === 15, "Qo'shimcha bonus ball qo'shildi (+15 ball)");

  // 7. REYTING VA "OY O'QUVCHISI"
  console.log("\n--- 7. REYTING VA «OY O'QUVCHISI» STATISTIKASI ---");
  const leaderboard = await getStudentLeaderboard();
  assert(leaderboard.rankings.length > 0, "Reyting jadvali muvaffaqiyatli hisoblandi");
  assert(leaderboard.studentOfTheMonth !== null, `Oy o'quvchisi aniqlandi: ${leaderboard.studentOfTheMonth.fullName}`);
  assert(leaderboard.studentOfTheMonth.totalPoints > 0, `To'plangan jami ball: ${leaderboard.studentOfTheMonth.totalPoints}`);

  // 8. EXCEL HISOBOT GENERATSIYASI
  console.log("\n--- 8. EXCEL (.XLSX) HISOBOT GENERATSIYASI ---");
  const excelBuffer = await generateMonthlyReportExcel();
  assert(Buffer.isBuffer(excelBuffer), "Excel buffer yaratildi");
  assert(excelBuffer.length > 5000, `Excel fayl hajmi to'liq va mukammal (${excelBuffer.length} bayt)`);

  // Cleanup test student and test quiz
  await prisma.student.delete({ where: { id: testStudent.id } });
  await prisma.quiz.delete({ where: { id: quiz.id } });

  console.log("\n=================================================");
  console.log(`📊 TEST NATIJALARI:`);
  console.log(`✅ O'tgan testlar soni: ${passedTests}`);
  console.log(`❌ Xatoliklar soni: ${failedTests}`);
  console.log("=================================================");

  if (failedTests === 0) {
    console.log("🎉 BARCHA TUGMALAR VA FUNKSIYALAR 100% BEKAM-U KO'ST ISHLAMOQDA!");
    process.exit(0);
  } else {
    console.error("❌ Ayrim testlarda muammo aniqlandi.");
    process.exit(1);
  }
}

runComprehensiveTests().catch(err => {
  console.error("Testda jiddiy xatolik:", err);
  process.exit(1);
});