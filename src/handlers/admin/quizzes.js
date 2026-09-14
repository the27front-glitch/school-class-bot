import { prisma } from "../../database/prisma.js";
import { isAdmin } from "../../config/config.js";
import { InlineKeyboard } from "grammy";
import { GRADE_6_SUBJECTS, createAndPublishAiQuiz } from "../../services/ai.service.js";

/**
 * Show list of active/past quizzes to admin
 */
export async function showAdminQuizzes(ctx) {
  if (!isAdmin(ctx.from.id)) return;

  const quizzes = await prisma.quiz.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      questions: true,
      submissions: {
        include: { student: true },
      },
    },
    take: 10,
  });

  let text = "🤖 <b>6-SINF AI TESTLARI BOSHQARUVI:</b>\n\n" +
    "⏰ <b>Haftalik avtomatik jadval:</b>\n" +
    "🔹 <b>Dushanba 12:00:</b> Yangi 15 talik test yuklanadi ➡️ <b>Chorshanba 12:00 da</b> yopiladi.\n" +
    "🔹 <b>Payshanba 12:00:</b> Keyingi fan testi yuklanadi ➡️ <b>Shanba 12:00 da</b> yopiladi.\n\n";

  if (quizzes.length === 0) {
    text += "<i>Hozircha testlar yaratilmagan.</i>\n";
  } else {
    text += "📋 <b>Oxirgi testlar ro'yxati:</b>\n\n";
    quizzes.forEach((q, idx) => {
      const status = q.isActive ? "🟢 Faol" : "🔴 Yopilgan";
      const deadlineText = q.deadline
        ? `⏳ Muddat: ${new Date(q.deadline).toLocaleString("uz-UZ")}`
        : "⏳ Muddat: Cheklanmagan";

      text += `<b>${idx + 1}. [${q.subject}] ${q.title}</b>\n` +
        `   └ Holati: ${status}\n` +
        `   └ Savollar: <b>${q.questions.length} ta</b> | Qatnashganlar: <b>${q.submissions.length} ta</b>\n` +
        `   └ ${deadlineText}\n\n`;
    });
  }

  const keyboard = new InlineKeyboard()
    .text("⚡️ AI Test yaratish (Hozir)", "admin_ai_generate_menu")
    .row()
    .text("🔀 Variantlarni aralashtirish (A,B,C,D)", "admin_shuffle_quizzes")
    .row()
    .text("🔒 Testni muddatidan oldin yopish", "admin_close_quiz_list");

  return ctx.reply(text, {
    parse_mode: "HTML",
    reply_markup: keyboard,
  });
}

/**
 * Re-shuffle options for all questions so answers are distributed evenly across A, B, C, D
 */
export async function shuffleActiveQuizzesHandler(ctx) {
  if (!isAdmin(ctx.from.id)) return;
  if (ctx.callbackQuery) await ctx.answerCallbackQuery({ text: "Variantlar aralashtirilmoqda..." });

  const questions = await prisma.question.findMany({
    where: {
      quiz: { isActive: true },
    },
  });

  if (questions.length === 0) {
    return ctx.reply("ℹ️ Hozirda faol testlar va savollar topilmadi.");
  }

  const { shuffleQuestion } = await import("../../services/ai.service.js");
  const letters = ["A", "B", "C", "D"];
  const stats = { A: 0, B: 0, C: 0, D: 0 };

  for (const q of questions) {
    const shuffled = shuffleQuestion({
      text: q.text,
      options: q.options,
      correctIndex: q.correctIndex,
    });

    const letter = letters[shuffled.correctIndex] || "A";
    stats[letter] = (stats[letter] || 0) + 1;

    await prisma.question.update({
      where: { id: q.id },
      data: {
        options: JSON.stringify(shuffled.options),
        correctIndex: shuffled.correctIndex,
      },
    });
  }

  return ctx.reply(
    `🔀 <b>Variantlar muvaffaqiyatli aralashtirildi!</b>\n\n` +
    `Jami <b>${questions.length} ta</b> savolning javob variantlari tasodifiy joylashtirildi.\n\n` +
    `📊 <b>Yangi to'g'ri javoblar taqsimoti:</b>\n` +
    `• <b>A:</b> ${stats.A || 0} ta\n` +
    `• <b>B:</b> ${stats.B || 0} ta\n` +
    `• <b>C:</b> ${stats.C || 0} ta\n` +
    `• <b>D:</b> ${stats.D || 0} ta\n\n` +
    `Endi o'quvchilar test yechganda to'g'ri javoblar barcha variantlarga (A, B, C, D) teng taqsimlanadi! 🎯`,
    { parse_mode: "HTML" }
  );
}

/**
 * Show subject selection for on-demand AI quiz generation
 */
export async function showAiSubjectMenu(ctx) {
  if (!isAdmin(ctx.from.id)) return;

  const keyboard = new InlineKeyboard();

  keyboard.text("🎲 Navbatdagi fandan (Avtomatik)", "ai_gen_subj:AUTO").row();

  GRADE_6_SUBJECTS.forEach((subj, idx) => {
    keyboard.text(`📚 ${subj}`, `ai_gen_subj:${subj}`);
    if ((idx + 1) % 2 === 0) keyboard.row();
  });

  await ctx.answerCallbackQuery();
  return ctx.reply(
    "🤖 <b>Qaysi fan bo'yicha 15 talik AI testini yaratmoqchisiz?</b>\n\n" +
    "<i>6-sinf darsligi asosida tuziladi:</i>",
    {
      parse_mode: "HTML",
      reply_markup: keyboard,
    }
  );
}

/**
 * Handle AI quiz generation callback
 */
export async function triggerAiQuizCallback(ctx) {
  if (!isAdmin(ctx.from.id)) return;

  const subjParam = ctx.callbackQuery.data.split(":")[1];
  const subject = subjParam === "AUTO" ? null : subjParam;

  await ctx.answerCallbackQuery({ text: "AI test tuzmoqda, 5-10 soniya kuting..." });
  const waitMsg = await ctx.reply("🤖 <b>Google Gemini AI 6-sinf darsligi bo'yicha 15 talik test tuzmoqda...</b>\n\nIltimos kuting...", {
    parse_mode: "HTML",
  });

  try {
    const createdQuiz = await createAndPublishAiQuiz(subject, 48, ctx.api);

    await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id);

    return ctx.reply(
      `🎉 <b>AI Test muvaffaqiyatli yaratildi va o'quvchilarga e'lon qilindi!</b>\n\n` +
      `📚 Fan: <b>${createdQuiz.subject}</b> (6-sinf darsligi)\n` +
      `📌 Nomi: <b>${createdQuiz.title}</b>\n` +
      `❓ Savollar soni: <b>15 ta</b>\n` +
      `⏳ Yopilish vaqti: <b>${new Date(createdQuiz.deadline).toLocaleString("uz-UZ")}</b>`,
      { parse_mode: "HTML" }
    );
  } catch (error) {
    console.error("AI test generatsiyasida xatolik:", error);
    try {
      await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id);
    } catch (e) {}
    return ctx.reply("❌ Test yaratishda xatolik yuz berdi: " + error.message);
  }
}

/**
 * Show list of quizzes to close
 */
export async function showCloseQuizMenu(ctx) {
  if (!isAdmin(ctx.from.id)) return;

  const activeQuizzes = await prisma.quiz.findMany({
    where: { isActive: true },
  });

  if (activeQuizzes.length === 0) {
    return ctx.reply("Hozirda faol testlar mavjud emas.");
  }

  const keyboard = new InlineKeyboard();
  activeQuizzes.forEach((q) => {
    keyboard.text(`🔒 [${q.subject}] ${q.title}`, `admin_close_q:${q.id}`).row();
  });

  await ctx.answerCallbackQuery();
  return ctx.reply("🔒 <b>Muddatidan oldin yopmoqchi bo'lgan testni tanlang:</b>", {
    parse_mode: "HTML",
    reply_markup: keyboard,
  });
}

/**
 * Close quiz callback
 */
export async function closeQuizCallback(ctx) {
  const quizId = parseInt(ctx.callbackQuery.data.split(":")[1], 10);
  await prisma.quiz.update({
    where: { id: quizId },
    data: { isActive: false },
  });

  await ctx.answerCallbackQuery({ text: "Test yopildi!" });
  return ctx.editMessageText("🔒 <b>Test muvaffaqiyatli yopildi.</b>", {
    parse_mode: "HTML",
  });
}