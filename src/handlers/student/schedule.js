import { prisma } from "../../database/prisma.js";
import { InlineKeyboard } from "grammy";

const dayNames = {
  1: "Dushanba",
  2: "Seshanba",
  3: "Chorshanba",
  4: "Payshanba",
  5: "Juma",
  6: "Shanba",
};

/**
 * Show schedule to student
 * @param {import("grammy").Context} ctx
 */
export async function showStudentSchedule(ctx) {
  const now = new Date();
  let dayOfWeek = now.getDay(); // 0: Sun, 1: Mon ...
  if (dayOfWeek === 0) dayOfWeek = 1; // Yakshanba bo'lsa dushanbani ko'rsatish

  const todayLessons = await prisma.schedule.findMany({
    where: { dayOfWeek },
    orderBy: { lessonOrder: "asc" },
  });

  let text = `📅 <b>Bugungi (${dayNames[dayOfWeek]}) dars jadvali:</b>\n\n`;

  if (todayLessons.length === 0) {
    text += "<i>Bugun uchun darslar kiritilmagan yoki bugun dam olish kuni.</i>\n";
  } else {
    todayLessons.forEach((l) => {
      text += `<b>${l.lessonOrder}-dars:</b> ${l.subject}`;
      if (l.room) text += ` (Xona: ${l.room})`;
      if (l.teacher) text += ` - <i>${l.teacher}</i>`;
      text += "\n";
    });
  }

  const keyboard = new InlineKeyboard()
    .text("⏭ Ertangi darslar", "student_sched_tomorrow")
    .text("📋 To'liq hafta", "student_sched_full");

  return ctx.reply(text, {
    parse_mode: "HTML",
    reply_markup: keyboard,
  });
}

/**
 * Handle student schedule inline queries (tomorrow / full week)
 * @param {import("grammy").Context} ctx
 */
export async function studentScheduleCallback(ctx) {
  const data = ctx.callbackQuery.data;

  if (data === "student_sched_tomorrow") {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    let dayOfWeek = tomorrow.getDay();
    if (dayOfWeek === 0) dayOfWeek = 1;

    const lessons = await prisma.schedule.findMany({
      where: { dayOfWeek },
      orderBy: { lessonOrder: "asc" },
    });

    let text = `📅 <b>Ertangi (${dayNames[dayOfWeek]}) dars jadvali:</b>\n\n`;
    if (lessons.length === 0) {
      text += "<i>Darslar kiritilmagan.</i>\n";
    } else {
      lessons.forEach((l) => {
        text += `<b>${l.lessonOrder}-dars:</b> ${l.subject}`;
        if (l.room) text += ` (${l.room})`;
        if (l.teacher) text += ` - <i>${l.teacher}</i>`;
        text += "\n";
      });
    }

    const keyboard = new InlineKeyboard()
      .text("⏮ Bugungi darslar", "student_sched_today")
      .text("📋 To'liq hafta", "student_sched_full");

    await ctx.answerCallbackQuery();
    try {
      await ctx.editMessageText(text, {
        parse_mode: "HTML",
        reply_markup: keyboard,
      });
    } catch (e) {
      if (!e.message?.includes("message is not modified")) console.error(e);
    }
    return;
  }

  if (data === "student_sched_today") {
    const now = new Date();
    let dayOfWeek = now.getDay();
    if (dayOfWeek === 0) dayOfWeek = 1;

    const lessons = await prisma.schedule.findMany({
      where: { dayOfWeek },
      orderBy: { lessonOrder: "asc" },
    });

    let text = `📅 <b>Bugungi (${dayNames[dayOfWeek]}) dars jadvali:</b>\n\n`;
    if (lessons.length === 0) {
      text += "<i>Darslar kiritilmagan.</i>\n";
    } else {
      lessons.forEach((l) => {
        text += `<b>${l.lessonOrder}-dars:</b> ${l.subject}`;
        if (l.room) text += ` (${l.room})`;
        if (l.teacher) text += ` - <i>${l.teacher}</i>`;
        text += "\n";
      });
    }

    const keyboard = new InlineKeyboard()
      .text("⏭ Ertangi darslar", "student_sched_tomorrow")
      .text("📋 To'liq hafta", "student_sched_full");

    await ctx.answerCallbackQuery();
    try {
      await ctx.editMessageText(text, {
        parse_mode: "HTML",
        reply_markup: keyboard,
      });
    } catch (e) {
      if (!e.message?.includes("message is not modified")) console.error(e);
    }
    return;
  }

  if (data === "student_sched_full") {
    const schedules = await prisma.schedule.findMany({
      orderBy: [{ dayOfWeek: "asc" }, { lessonOrder: "asc" }],
    });

    let text = "📅 <b>TO'LIQ HAFTALIK DARS JADVALI:</b>\n\n";

    for (let day = 1; day <= 6; day++) {
      text += `🔹 <b>${dayNames[day]}:</b>\n`;
      const dayLessons = schedules.filter((s) => s.dayOfWeek === day);
      if (dayLessons.length === 0) {
        text += "   <i>Darslar yo'q</i>\n";
      } else {
        dayLessons.forEach((l) => {
          text += `   <b>${l.lessonOrder}-dars:</b> ${l.subject}`;
          if (l.teacher) text += ` (${l.teacher})`;
          text += "\n";
        });
      }
      text += "\n";
    }

    const keyboard = new InlineKeyboard().text("⏮ Orqaga", "student_sched_today");

    await ctx.answerCallbackQuery();
    try {
      await ctx.editMessageText(text, {
        parse_mode: "HTML",
        reply_markup: keyboard,
      });
    } catch (e) {
      if (!e.message?.includes("message is not modified")) console.error(e);
    }
    return;
  }
}