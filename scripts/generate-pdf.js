import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const fontRegular = "C:\\Windows\\Fonts\\arial.ttf";
const fontBold = "C:\\Windows\\Fonts\\arialbd.ttf";

const doc = new PDFDocument({
  size: "A4",
  margins: { top: 40, bottom: 40, left: 45, right: 45 },
  info: {
    Title: "Maktab Sinf Boshqaruv Boti - Admin Qo'llanmasi",
    Author: "Senior Dev",
    Subject: "Telegram Bot Qo'llanma",
  },
});

const outputPath = path.resolve("Admin_Qollanma_Maktab_Bot.pdf");
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// Register fonts
doc.registerFont("Arial", fontRegular);
doc.registerFont("Arial-Bold", fontBold);

// Color Palette
const PRIMARY = "#1E3A8A"; // Deep Blue
const SECONDARY = "#0D9488"; // Teal
const DARK = "#1F2937"; // Gray-800
const LIGHT_BG = "#F3F4F6";
const ACCENT = "#D97706"; // Amber

// --- TITLE HEADER ---
doc.rect(45, 40, 505, 75).fill(PRIMARY);
doc.font("Arial-Bold").fontSize(20).fillColor("#FFFFFF").text("MAKTAB SINF BOSHQARUV BOTI", 55, 55, { align: "center" });
doc.font("Arial").fontSize(12).fillColor("#E0E7FF").text("Sinf Rahbari va Adminlar Uchun To'liq Foydalanish Qo'llanmasi", 55, 82, { align: "center" });

doc.moveDown(3);

// Helper for section header
function drawSectionHeader(title, yOffset = null) {
  if (yOffset) doc.y = yOffset;
  doc.moveDown(0.8);
  const y = doc.y;
  doc.rect(45, y, 505, 24).fill(LIGHT_BG);
  doc.rect(45, y, 4, 24).fill(SECONDARY);
  doc.font("Arial-Bold").fontSize(13).fillColor(PRIMARY).text(title, 55, y + 5);
  doc.moveDown(0.6);
}

// 1. O'QUVCHILAR BOSHQARUVI
drawSectionHeader("1. O'QUVCHILAR RO'YXATI VA PIN-KOD XAVFSIZLIGI");
doc.font("Arial").fontSize(10).fillColor(DARK);
doc.text("Botda o'quvchilar ro'yxatini to'g'ri shakllantirish va ularning shaxsiy hisoblarini xavfsiz biriktirish:", { lineGap: 3 });
doc.moveDown(0.4);

doc.font("Arial-Bold").text("• Yangi o'quvchi(lar)ni qo'shish:", { continued: false });
doc.font("Arial").text("   Admin menyusidan \"👥 O'quvchilar\" ➡️ \"➕ Yangi o'quvchi qo'shish\" tugmasini bosing. O'quvchilarni quyidagi formatlarda kiritishingiz mumkin:\n" +
  "   - Ali Valiyev (1234)  — qavs ichida 4 xonali PIN-kod beriladi.\n" +
  "   - Rustam Karimov (5544)\n" +
  "   - Sobir Baxtiyorov  — agar PIN yozilmasa, bot o'zi avtomatik 4 xonali tasodifiy PIN beradi.\n" +
  "   Bir nechta o'quvchini bitta xabarda har birini yangi qatordan yozib yuborishingiz mumkin.", { lineGap: 2 });
doc.moveDown(0.4);

doc.font("Arial-Bold").text("• O'quvchilarning botga ulanishi (/start):");
doc.font("Arial").text("   O'quvchi o'z telefonida botga kirib /start bosadi va ro'yxatdan o'z ismini tanlaydi. Bot undan o'qituvchisi bergan 4 xonali PIN-kodni so'raydi. PIN to'g'ri kiritilgach, uning akkaunti ro'yxatga biriktiriladi (boshqa o'quvchining nomidan kirishning oldi olinadi).", { lineGap: 2 });
doc.moveDown(0.4);

doc.font("Arial-Bold").text("• O'quvchini o'chirish:");
doc.font("Arial").text("   \"👥 O'quvchilar\" ➡️ \"🗑 O'quvchini o'chirish\" tugmasini bosib, kerakli o'quvchining ustiga bir marta bossangiz, u bazadan butunlay o'chiriladi.");

// 2. TEZKOR DAVOMAT
drawSectionHeader("2. 2-SMENA TEZKOR DAVOMAT TIZIMI");
doc.font("Arial").fontSize(10).fillColor(DARK);
doc.text("2-smena darslari 12:15 da boshlanishi munosabati bilan bot har kuni soat 12:20 da adminga avtomatik eslatma yuboradi.", { lineGap: 3 });
doc.moveDown(0.4);

doc.font("Arial-Bold").text("• 5 soniyada davomat olish usuli:");
doc.font("Arial").text("   1. \"📋 Davomat olish\" tugmasini bosing.\n" +
  "   2. Eng yuqoridagi \"⚡️ Barchasini «Keldi» qilish\" tugmasini bosing (hamma o'quvchi yashil ✅ bo'ladi).\n" +
  "   3. Faqat darsga kelmagan 1-2 ta o'quvchining ismini ustiga bosing (✅ ➡️ ❌ Kelmadi ➡️ ⏱ Kechikdi).\n" +
  "   4. Pastdagi \"💾 Saqlash va Yakunlash\" tugmasini bosing. Barcha ma'lumotlar bazada 100% saqlanadi.", { lineGap: 2 });

// 3. AI TESTLAR
drawSectionHeader("3. GOOGLE GEMINI AI TESTLARI VA HAFTALIK JADVAL");
doc.font("Arial").fontSize(10).fillColor(DARK);
doc.text("Admin qo'lda test tuzish majburiyatidan to'liq ozod qilingan. 6-sinf O'zbekiston darsliklari asosida Google Gemini AI testlarni o'zi avtomatik 15 talik formatda tuzadi.", { lineGap: 3 });
doc.moveDown(0.4);

doc.font("Arial-Bold").text("• Avtomatlashgan haftalik tartib:");
doc.font("Arial").text("   🔹 Dushanba 12:00: Yangi fandan 15 talik test yuklanadi ➡️ Chorshanba 12:00 da avtomatik yopiladi.\n" +
  "   🔹 Payshanba 12:00: Keyingi fandan 15 talik test yuklanadi ➡️ Shanba 12:00 da avtomatik yopiladi.\n" +
  "   🔹 6-sinf fanlari navbatma-navbat aylanadi: Ona tili, Adabiyot, Matematika, Tarix, Ingliz tili, Rus tili, Informatika, Geografiya, Botanika, Fizika, Texnologiya.", { lineGap: 2 });
doc.moveDown(0.4);

doc.font("Arial-Bold").text("• Qo'shimcha imkoniyat (Hozir test yaratish):");
doc.font("Arial").text("   Admin \"📝 Testlar & AI\" ➡️ \"⚡️ AI Test yaratish (Hozir)\" tugmasi orqali xohlagan vaqtda istalgan fandan 15 talik testni 5 soniyada generatsiya qilishi mumkin.");

// PAGE 2
doc.addPage();

// 4. DARS JADVALI
drawSectionHeader("4. HAFTALIK DARS JADVALI VA KUNLIK ESLATMALAR");
doc.font("Arial").fontSize(10).fillColor(DARK);
doc.text("Haftalik dars jadvali to'liq kiritilgan (Dushanbadan Shanbagacha, soatlari bilan):", { lineGap: 3 });
doc.moveDown(0.4);

doc.font("Arial").text("• Har kuni soat 20:00 da bot o'quvchilarga ertangi darslar jadvalini avtomatik xabar qilib yuboradi.\n" +
  "• Admin \"📅 Dars Jadvali\" ➡️ \"➕ Dars qo'shish / tahrirlash\" orqali istalgan kun va darsni o'zgartirishi mumkin.\n" +
  "• \"🗑 Jadvalni tozalash\" orqali butun haftani yoki ma'lum bir kunni tozalash mumkin.", { lineGap: 2 });

// 5. REYTING VA EXCEL HISOBOT
drawSectionHeader("5. OY O'QUVCHISI VA EXCEL (.XLSX) HISOBOT");
doc.font("Arial").fontSize(10).fillColor(DARK);
doc.text("O'quvchilar o'rtasida sog'lom raqobatni shakllantirish uchun avtomatlashgan reyting tizimi:", { lineGap: 3 });
doc.moveDown(0.4);

doc.font("Arial-Bold").text("• Ballar hisoblash formulasi:");
doc.font("Arial").text("   Jami Ball = (Davomatga kelgan kunlar × 5 ball) + (Testdagi to'g'ri javoblar × 10 ball) + Bonus ballar.", { lineGap: 2 });
doc.moveDown(0.4);

doc.font("Arial-Bold").text("• Qo'shimcha ball berish (Telefoni yo'q o'quvchilar va faollik uchun):");
doc.font("Arial").text("   Admin menyusidagi \"➕ Qo'shimcha ball berish\" tugmasi orqali istalgan o'quvchiga qo'lda ball qo'shishingiz mumkin (masalan, telefoni yo'q o'quvchi darsda qog'ozda test yechganda).", { lineGap: 2 });
doc.moveDown(0.4);

doc.font("Arial-Bold").text("• 1 tugma bilan Excel hisobot:");
doc.font("Arial").text("   \"📊 Statistika & Excel\" tugmasini bossangiz, bot joriy oy uchun kunma-kun to'liq davomat jurnali (+) va barcha o'quvchilarning ballari jamlangan tayyor .xlsx (Excel) jadvalini adminga yuboradi.", { lineGap: 2 });

// 6. E'LONLAR YUBORISH
drawSectionHeader("6. BARChA O'QUVChILARGA E'LON YUBORISH (BROADCAST)");
doc.font("Arial").fontSize(10).fillColor(DARK);
doc.text("Admin menyusidan \"📢 E'lon yuborish\" tugmasini bosib, xabar, rasm yoki hujjat yuborsangiz, bot uni barcha ro'yxatdan o'tgan o'quvchilarga bir zumda tarqatadi.", { lineGap: 3 });

// 7. CHEAT SHEET SUMMARY BOX
doc.moveDown(1);
const boxY = doc.y;
doc.rect(45, boxY, 505, 110).fillAndStroke("#EFF6FF", PRIMARY);
doc.font("Arial-Bold").fontSize(11).fillColor(PRIMARY).text("📌 TEZKOR ESLATMA VA VAQTLAR JADVALI:", 55, boxY + 10);
doc.font("Arial").fontSize(9).fillColor(DARK);
doc.text("• Soat 12:20 (Dush-Shan): Adminga kunlik davomat eslatmasi boradi.", 55, boxY + 30);
doc.text("• Dushanba 12:00: 6-sinf darsligidan yangi AI test yuklanadi ➡️ Chorshanba 12:00 da yopiladi.", 55, boxY + 45);
doc.text("• Payshanba 12:00: Keyingi fandan yangi AI test yuklanadi ➡️ Shanba 12:00 da yopiladi.", 55, boxY + 60);
doc.text("• Soat 20:00 (Har kuni): Barcha o'quvchilarga ertangi dars jadvali eslatmasi boradi.", 55, boxY + 75);
doc.text("• Har oy oxirida: \"📊 Statistika & Excel\" tugmasi orqali \"Oy O'quvchisi\" aniqlanadi va hisobot olinadi.", 55, boxY + 90);

// FOOTER
doc.font("Arial").fontSize(8).fillColor("#9CA3AF").text("Maktab Sinf Boshqaruv Boti Qo'llanmasi © 2026", 45, 780, { align: "center", width: 505 });

doc.end();

stream.on("finish", () => {
  console.log(`✅ PDF muvaffaqiyatli yaratildi: ${outputPath}`);
  process.exit(0);
});