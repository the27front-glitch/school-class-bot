import { generateQuizByAI } from "../src/services/ai.service.js";

async function testAI() {
  console.log("🤖 Test AI generatsiyasi boshlandi...");
  const res = await generateQuizByAI("Tarix");
  console.log(`✅ AI muvaffaqiyatli test yaratdi!`);
  console.log(`📚 Fan: ${res.subject}`);
  console.log(`📌 Nomi: ${res.title}`);
  console.log(`❓ Savollar soni: ${res.questions.length}`);
  console.log(`🔹 1-savol: ${res.questions[0].text}`);
  console.log(`   Variantlar: ${JSON.stringify(res.questions[0].options)}`);
  console.log(`   To'g'ri javob indeksi: ${res.questions[0].correctIndex}`);
  process.exit(0);
}

testAI().catch((err) => {
  console.error("❌ Xatolik:", err);
  process.exit(1);
});