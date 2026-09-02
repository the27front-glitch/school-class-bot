import { prisma } from "../../database/prisma.js";
import { isAdmin } from "../../config/config.js";
import { InlineKeyboard } from "grammy";

/**
 * Show list of students to admin
 * @param {import("grammy").Context} ctx
 */
export async function showStudentsList(ctx) {
  if (!isAdmin(ctx.from.id)) return;

  const students = await prisma.student.findMany({
    orderBy: { fullName: "asc" },
  });

  if (students.length === 0) {
    const keyboard = new InlineKeyboard().text(
      "➕ O'quvchi qo'shish",
      "admin_add_student"
    );
    return ctx.reply(
      "👥 <b>Sinf o'quvchilari ro'yxati bo'sh.</b>\n\nQuyidagi tugma orqali yangi o'quvchilarni qo'shishingiz mumkin:",
      { parse_mode: "HTML", reply_markup: keyboard }
    );
  }

  let text = `👥 <b>Sinf o'quvchilari ro'yxati (Jami: ${students.length} ta):</b>\n\n`;
  students.forEach((st, idx) => {
    const statusIcon = st.telegramId ? "📱 (Botga ulangan)" : "👤 (Telefonsiz/Oflayn)";
    text += `<b>${idx + 1}. ${st.fullName}</b> ${statusIcon}\n   └ Ballar: <b>${st.points + st.bonusPoints} ball</b> (ID: ${st.id})\n`;
  });

  const keyboard = new InlineKeyboard()
    .text("➕ Yangi o'quvchi qo'shish", "admin_add_student")
    .row()
    .text("🗑 O'quvchini o'chirish", "admin_delete_student_list");

  return ctx.reply(text, {
    parse_mode: "HTML",
    reply_markup: keyboard,
  });
}

/**
 * Conversation: Add new student
 */
export async function addStudentConversation(conversation, ctx) {
  await ctx.reply(
    "✏️ <b>Yangi o'quvchi(lar)ni qo'shish:</b>\n\n" +
    "O'quvchining Ism Familiyasini yozib yuboring.\n" +
    "<i>Bir nechta o'quvchini qo'shish uchun har birini yangi qatordan yozishingiz mumkin.</i>\n\n" +
    "Bekor qilish uchun /cancel deb yozing.",
    { parse_mode: "HTML" }
  );

  const response = await conversation.wait();
  if (response.message?.text === "/cancel") {
    return ctx.reply("❌ Amal bekor qilindi.");
  }

  const text = response.message?.text;
  if (!text) {
    return ctx.reply("❌ Matn kiritilmadi. Amal bekor qilindi.");
  }

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let addedCount = 0;
  for (const name of lines) {
    if (name.length >= 2) {
      await prisma.student.create({
        data: {
          fullName: name,
        },
      });
      addedCount++;
    }
  }

  return ctx.reply(
    `✅ <b>Muvaffaqiyatli saqlandi!</b>\n\nJami qo'shilgan o'quvchilar soni: <b>${addedCount} ta</b>.`,
    { parse_mode: "HTML" }
  );
}

/**
 * Delete student list selection
 */
export async function showDeleteStudentMenu(ctx) {
  if (!isAdmin(ctx.from.id)) return;

  const students = await prisma.student.findMany({
    orderBy: { fullName: "asc" },
  });

  const keyboard = new InlineKeyboard();
  students.forEach((st, idx) => {
    keyboard.text(`❌ ${st.fullName}`, `del_student:${st.id}`);
    if ((idx + 1) % 2 === 0) keyboard.row();
  });

  return ctx.reply("🗑 <b>O'chirmoqchi bo'lgan o'quvchini tanlang:</b>", {
    parse_mode: "HTML",
    reply_markup: keyboard,
  });
}

/**
 * Callback to delete student
 */
export async function deleteStudentCallback(ctx) {
  const studentId = parseInt(ctx.callbackQuery.data.split(":")[1], 10);
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    return ctx.answerCallbackQuery({ text: "O'quvchi topilmadi!" });
  }

  await prisma.student.delete({
    where: { id: studentId },
  });

  await ctx.answerCallbackQuery({ text: "O'quvchi o'chirildi!" });
  return ctx.editMessageText(
    `🗑 <b>${student.fullName}</b> ro'yxatdan o'chirildi.`,
    { parse_mode: "HTML" }
  );
}

/**
 * Conversation: Give bonus/offline points to a student
 */
export async function giveBonusConversation(conversation, ctx) {
  if (!isAdmin(ctx.from.id)) return;

  const students = await prisma.student.findMany({
    orderBy: { fullName: "asc" },
  });

  if (students.length === 0) {
    return ctx.reply("Sinfda o'quvchilar mavjud emas.");
  }

  let listText = "➕ <b>Ball berish uchun o'quvchi ID raqamini kiriting:</b>\n\n";
  students.forEach((st) => {
    listText += `ID: <b>${st.id}</b> - ${st.fullName} (Joriy ball: ${st.points + st.bonusPoints})\n`;
  });
  listText += "\nBekor qilish uchun /cancel deb yozing.";

  await ctx.reply(listText, { parse_mode: "HTML" });

  const idMsg = await conversation.wait();
  if (idMsg.message?.text === "/cancel") return ctx.reply("❌ Bekor qilindi.");

  const studentId = parseInt(idMsg.message?.text, 10);
  const student = await prisma.student.findUnique({ where: { id: studentId } });

  if (!student) {
    return ctx.reply("❌ Bunday ID ga ega o'quvchi topilmadi.");
  }

  await ctx.reply(
    `👤 <b>${student.fullName}</b> uchun qancha ball qo'shmoqchisiz?\n<i>(Masalan: 10, 20 yoki manfiy -5)</i>:`,
    { parse_mode: "HTML" }
  );

  const pointsMsg = await conversation.wait();
  if (pointsMsg.message?.text === "/cancel") return ctx.reply("❌ Bekor qilindi.");

  const points = parseInt(pointsMsg.message?.text, 10);
  if (isNaN(points)) {
    return ctx.reply("❌ Noto'g'ri son kiritildi. Amal bekor qilindi.");
  }

  const updated = await prisma.student.update({
    where: { id: studentId },
    data: { bonusPoints: { increment: points } },
  });

  return ctx.reply(
    `✅ <b>${student.fullName}</b> ga <b>${points > 0 ? "+" : ""}${points} ball</b> qo'shildi!\n` +
    `Yangi umumiy ball: <b>${updated.points + updated.bonusPoints} ball</b>.`,
    { parse_mode: "HTML" }
  );
}