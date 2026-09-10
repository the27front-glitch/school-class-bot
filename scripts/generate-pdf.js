import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Read logo as base64
const logoPath = path.join(rootDir, "logo.jpg");
let logoBase64 = "";
if (fs.existsSync(logoPath)) {
  logoBase64 = fs.readFileSync(logoPath).toString("base64");
}

const htmlContent = `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <title>6-maktab 6-"A" sinfi Telegram Boti Qo'llanmasi</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm 10mm 12mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      background-color: #ffffff;
      color: #1e293b;
      line-height: 1.45;
      font-size: 13px;
    }

    .page {
      width: 100%;
      min-height: 275mm;
      page-break-after: always;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .page:last-child {
      page-break-after: avoid;
    }

    /* HEADER */
    .header {
      background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #0284c7 100%);
      color: #ffffff;
      border-radius: 16px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 10px 25px -5px rgba(29, 78, 216, 0.25);
      margin-bottom: 14px;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .logo-img {
      width: 74px;
      height: 74px;
      border-radius: 50%;
      border: 3px solid rgba(255, 255, 255, 0.9);
      object-fit: cover;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      background: #ffffff;
    }
    .header-title h1 {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.5px;
      line-height: 1.2;
      text-transform: uppercase;
      color: #ffffff;
    }
    .header-title .sub {
      font-size: 13px;
      color: #bfdbfe;
      font-weight: 500;
      margin-top: 3px;
    }
    .bot-badge {
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.4);
      padding: 8px 14px;
      border-radius: 12px;
      text-align: right;
      white-space: nowrap;
    }
    .bot-badge .label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #e0f2fe;
    }
    .bot-badge .bot-username {
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
    }

    /* INTRO BANNER */
    .intro-banner {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-left: 5px solid #16a34a;
      border-radius: 10px;
      padding: 10px 14px;
      margin-bottom: 14px;
      font-size: 12px;
      color: #166534;
      line-height: 1.45;
    }
    .intro-banner strong {
      color: #14532d;
      font-size: 13px;
    }

    /* SECTION TITLE */
    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }
    .section-number {
      background: #2563eb;
      color: #ffffff;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
    }
    .section-title {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.3px;
    }

    /* STEPS GRID */
    .steps-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 14px;
    }
    .step-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px;
      position: relative;
    }
    .step-card.active {
      border-color: #93c5fd;
      background: #f0f7ff;
    }
    .step-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }
    .step-tag {
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      background: #e2e8f0;
      color: #475569;
      text-transform: uppercase;
    }
    .step-card.active .step-tag {
      background: #2563eb;
      color: #ffffff;
    }
    .step-icon {
      font-size: 16px;
    }
    .step-card h4 {
      font-size: 13px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 4px;
    }
    .step-card p {
      font-size: 11.5px;
      color: #475569;
      line-height: 1.4;
    }
    .step-highlight {
      background: #ffffff;
      border: 1px dashed #cbd5e1;
      border-radius: 6px;
      padding: 5px 8px;
      margin-top: 6px;
      font-size: 11px;
      font-weight: 600;
      color: #1e40af;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* SECURITY PIN NOTICE */
    .pin-box {
      background: #fffbeb;
      border: 1.5px solid #fde68a;
      border-radius: 12px;
      padding: 12px 14px;
      margin-bottom: 14px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .pin-box .pin-icon {
      font-size: 26px;
      line-height: 1;
    }
    .pin-box h4 {
      font-size: 13px;
      font-weight: 700;
      color: #92400e;
      margin-bottom: 3px;
    }
    .pin-box p {
      font-size: 11.5px;
      color: #78350f;
      line-height: 1.4;
    }

    /* WHY BOT SECTION */
    .benefits-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 10px;
    }
    .benefit-item {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-top: 3px solid #0284c7;
      border-radius: 10px;
      padding: 10px;
      text-align: center;
    }
    .benefit-item .b-icon {
      font-size: 22px;
      margin-bottom: 4px;
    }
    .benefit-item h5 {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 3px;
    }
    .benefit-item p {
      font-size: 10.5px;
      color: #64748b;
      line-height: 1.35;
    }

    /* FOOTER */
    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10.5px;
      color: #94a3b8;
    }
    .footer strong {
      color: #475569;
    }

    /* PAGE 2 STYLES */
    .menu-showcase {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 12px;
    }
    .menu-card {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 14px;
      padding: 14px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03);
      position: relative;
    }
    .menu-card.schedule { border-left: 5px solid #3b82f6; }
    .menu-card.test { border-left: 5px solid #8b5cf6; }
    .menu-card.rating { border-left: 5px solid #f59e0b; }
    .menu-card.profile { border-left: 5px solid #10b981; }

    .menu-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .menu-button-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 700;
      padding: 5px 10px;
      border-radius: 8px;
      background: #f1f5f9;
      color: #0f172a;
      border: 1px solid #cbd5e1;
    }
    .schedule .menu-button-badge { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
    .test .menu-button-badge { background: #f5f3ff; color: #6d28d9; border-color: #ddd6fe; }
    .rating .menu-button-badge { background: #fffbeb; color: #b45309; border-color: #fde68a; }
    .profile .menu-button-badge { background: #ecfdf5; color: #047857; border-color: #a7f3d0; }

    .menu-card-body {
      font-size: 11.5px;
      color: #475569;
      line-height: 1.45;
    }
    .feature-list {
      list-style: none;
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .feature-list li {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      font-size: 11px;
    }
    .feature-list li::before {
      content: "✔";
      color: #10b981;
      font-weight: bold;
      font-size: 11px;
    }

    /* SCHEDULE MINI TABLE */
    .timetable-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px 14px;
      margin-bottom: 12px;
    }
    .timetable-box h4 {
      font-size: 12.5px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .timetable-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 6px;
    }
    .day-pill {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 6px 4px;
      text-align: center;
    }
    .day-pill .day-name {
      font-size: 10px;
      font-weight: 700;
      color: #1e40af;
      text-transform: uppercase;
    }
    .day-pill .lesson-count {
      font-size: 11px;
      font-weight: 600;
      color: #334155;
      margin-top: 2px;
    }

    /* PARENT TIPS BOX */
    .parent-rules {
      background: linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%);
      border: 1.5px solid #bae6fd;
      border-radius: 14px;
      padding: 12px 16px;
      margin-bottom: 12px;
    }
    .parent-rules h4 {
      font-size: 13px;
      font-weight: 800;
      color: #0369a1;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .rules-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .rule-item {
      font-size: 11px;
      color: #0f172a;
      line-height: 1.4;
      display: flex;
      align-items: flex-start;
      gap: 6px;
    }
    .rule-item .r-icon {
      font-size: 14px;
      line-height: 1;
    }

    /* ATTENDANCE HIGHLIGHT */
    .attendance-banner {
      background: #fdf4ff;
      border: 1px solid #f0abfc;
      border-radius: 10px;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .attendance-banner .text {
      font-size: 11.5px;
      color: #86198f;
    }
    .attendance-banner .time-badge {
      background: #c026d3;
      color: #ffffff;
      font-weight: 700;
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 6px;
    }
  </style>
</head>
<body>

  <!-- ==================== 1-BET: BOT VA ULANISH TARTIBI ==================== -->
  <div class="page">
    <div>
      <!-- HEADER -->
      <div class="header">
        <div class="header-left">
          ${logoBase64 ? `<img src="data:image/jpeg;base64,${logoBase64}" class="logo-img" alt="Logo">` : ""}
          <div class="header-title">
            <h1>6-MAKTAB | 6-"A" SINFI</h1>
            <div class="sub">Ota-onalar va O‘quvchilar uchun Rasmiy Telegram Bot Qo‘llanmasi</div>
          </div>
        </div>
        <div class="bot-badge">
          <div class="label">Telegram Bot:</div>
          <div class="bot-username">@maktabning_sinfflari_bot</div>
        </div>
      </div>

      <!-- INTRO -->
      <div class="intro-banner">
        <strong>Hurmatli 6-"A" sinf ota-onalari!</strong><br>
        Ushbu maxsus Telegram bot farzandingizning dars jarayonlarini kuzatib borish, maktabdagi davomatidan xabardor bo‘lish, dars jadvalini rejalashtirish hamda sun’iy intellekt (Gemini AI) yordamida har haftalik bilimlarni tekshirib, rag‘batlantirib borish uchun ishlab chiqildi.
      </div>

      <!-- SECTION 1: ULANISH BOSQICHLARI -->
      <div class="section-header">
        <div class="section-number">1</div>
        <div class="section-title">Botga Ulanish Tartibi (4 Oddiy Qadam)</div>
      </div>

      <div class="steps-grid">
        <!-- 1-QADAM -->
        <div class="step-card active">
          <div class="step-top">
            <span class="step-tag">1-qadam</span>
            <span class="step-icon">🔍</span>
          </div>
          <h4>Botni Telegramda Qidirish</h4>
          <p>Telegram qidiruv oynasiga <b>@maktabning_sinfflari_bot</b> deb yozing yoki berilgan havolani bosing.</p>
          <div class="step-highlight">
            <span>🔘 Pastdagi <b>START</b> (Boshlash) tugmasini bosing</span>
          </div>
        </div>

        <!-- 2-QADAM -->
        <div class="step-card active">
          <div class="step-top">
            <span class="step-tag">2-qadam</span>
            <span class="step-icon">👤</span>
          </div>
          <h4>O‘quvchini Ro‘yxatdan Tanlash</h4>
          <p>Bot ekranida 6-"A" sinfining barcha o‘quvchilari ro‘yxati chiqadi.</p>
          <div class="step-highlight">
            <span>🔘 O‘z farzandingizning <b>Ism-Familiyasi</b>ni bosing</span>
          </div>
        </div>

        <!-- 3-QADAM -->
        <div class="step-card active">
          <div class="step-top">
            <span class="step-tag">3-qadam</span>
            <span class="step-icon">🔐</span>
          </div>
          <h4>Shaxsiy PIN-kodni Kiritish</h4>
          <p>Begona shaxslar ulanib olmasligi uchun bot 4 xonali maxfiy kod so‘raydi.</p>
          <div class="step-highlight">
            <span>🔑 Sinf rahbari taqdim etgan <b>4 xonali PIN-kod</b>ni yozing</span>
          </div>
        </div>

        <!-- 4-QADAM -->
        <div class="step-card active">
          <div class="step-top">
            <span class="step-tag">4-qadam</span>
            <span class="step-icon">🎉</span>
          </div>
          <h4>Muvaffaqiyatli Faollashuv</h4>
          <p>PIN-kod to‘g‘ri kiritilgach, bot tasdiqlanadi va asosiy foydalanuvchi paneli ochiladi.</p>
          <div class="step-highlight">
            <span>🚀 Endi barcha imkoniyatlar farzandingiz va siz uchun ochiq!</span>
          </div>
        </div>
      </div>

      <!-- XAVFSIZLIK PIN-KOD TUSHUNTIRISH -->
      <div class="pin-box">
        <div class="pin-icon">🛡️</div>
        <div>
          <h4>Xavfsizlik va Shaxsiy PIN-kod nima uchun kerak?</h4>
          <p>
            Har bir o‘quvchiga sinf rahbari tomonidan shaxsiy 4 xonali PIN-kod berilgan (masalan: <i>1234</i>). Bu orqali begona foydalanuvchilar o‘quvchi nomidan tizimga kira olmaydi, testlarni yecholmaydi va ballarini o‘zgartira olmaydi. PIN-kodni sinf rahbaridan shaxsan oling va saqlab qo‘ying.
          </p>
        </div>
      </div>

      <!-- AFZALLIKLAR -->
      <div class="section-header">
        <div class="section-number">2</div>
        <div class="section-title">Ota-onalar va O‘quvchilar uchun Asosiy Foydalari</div>
      </div>

      <div class="benefits-grid">
        <div class="benefit-item">
          <div class="b-icon">📊</div>
          <h5>Doimiy Nazorat</h5>
          <p>Farzandingiz darslarga qatnashyaptimi yoki yo‘q — barchasi telefoningizda aniq ko‘rinadi.</p>
        </div>
        <div class="benefit-item">
          <div class="b-icon">🧠</div>
          <h5>Intellektual Rivojlanish</h5>
          <p>Sun’iy intellekt haftalik testlari orqali dars mavzulari takrorlanadi va bilim mustahkamlanadi.</p>
        </div>
        <div class="benefit-item">
          <div class="b-icon">🥇</div>
          <h5>Sog‘lom Raqobat</h5>
          <p>"Oy o‘quvchisi" reytingi bolalarda o‘qishga, intilishga va g‘alaba qozonishga havas uyg‘otadi.</p>
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
      <div>6-umumiy o‘rta ta’lim maktabi | <b>6-"A" sinfi</b></div>
      <div>Bot: <b>@maktabning_sinfflari_bot</b></div>
      <div>1-bet / 2</div>
    </div>
  </div>

  <!-- ==================== 2-BET: USER PANEL FUNKSIYALARI ==================== -->
  <div class="page">
    <div>
      <!-- HEADER -->
      <div class="header" style="margin-bottom: 12px; padding: 12px 18px;">
        <div class="header-left">
          <div class="header-title">
            <h1 style="font-size: 17px;">USER PANEL (FOYDALANUVCHI MENYUSI) IMKONIYATLARI</h1>
            <div class="sub">Telegram botdagi 4 ta asosiy bo‘lim va ulardan foydalanish</div>
          </div>
        </div>
        <div class="bot-badge">
          <div class="label">Sinf:</div>
          <div class="bot-username">6-"A" (2-smena)</div>
        </div>
      </div>

      <!-- DAVOMAT BANNERI -->
      <div class="attendance-banner">
        <div class="text">
          ⏰ <b>2-smena Davomat monitoringi:</b> Har kuni dars boshlanishidan oldin davomat belgilanadi va monitoring qilinadi.
        </div>
        <div class="time-badge">Davomat vaqti: 12:20</div>
      </div>

      <!-- 4 ASOSIY TUGMA SHOWCASE -->
      <div class="menu-showcase">
        <!-- 1. DARS JADVALI -->
        <div class="menu-card schedule">
          <div class="menu-card-header">
            <div class="menu-button-badge">📅 Dars Jadvali</div>
            <span style="font-size: 11px; font-weight: 700; color: #1d4ed8;">6 kunlik reja</span>
          </div>
          <div class="menu-card-body">
            Haftaning dushanbadan shanbagacha bo‘lgan barcha 31 ta dars soatlari va fanlar tartibi.
            <ul class="feature-list">
              <li>Qaysi kuni qanday fanlar borligini 1 bosishda ko‘rish;</li>
              <li>Darslar vaqti va qo‘ng‘iroqlar jadvali (13:15 – 17:50);</li>
              <li>Ertangi kungi kitob-daftarlarni adashmasdan tayyorlash.</li>
            </ul>
          </div>
        </div>

        <!-- 2. MAVJUD TESTLAR -->
        <div class="menu-card test">
          <div class="menu-card-header">
            <div class="menu-button-badge">📝 Mavjud Testlar</div>
            <span style="font-size: 11px; font-weight: 700; color: #6d28d9;">Gemini AI</span>
          </div>
          <div class="menu-card-body">
            Google Gemini sun’iy intellekti tomonidan 6-sinf darsliklari asosida tuziladigan haftalik testlar.
            <ul class="feature-list">
              <li>Har dam olish kunlari (shanba-yakshanba) faollashadi;</li>
              <li>15 ta fan savollari (Ona tili, Matematika, Ingliz tili va b.);</li>
              <li>Har bir to‘g‘ri javob uchun qimmatli ballar yoziladi.</li>
            </ul>
          </div>
        </div>

        <!-- 3. REYTING & BALLARIM -->
        <div class="menu-card rating">
          <div class="menu-card-header">
            <div class="menu-button-badge">🏆 Reyting & Ballarim</div>
            <span style="font-size: 11px; font-weight: 700; color: #b45309;">"Oy o‘quvchisi"</span>
          </div>
          <div class="menu-card-body">
            Sinfdagi umumiy bilim va intizom bellashuvi hamda oylik hisobot jadvali.
            <ul class="feature-list">
              <li>Sinfdagi eng bilimdon Top-10 o‘quvchilar ro‘yxati;</li>
              <li>Farzandingizning sinf ichidagi o‘rni va to‘plagan ballari;</li>
              <li>Darsdagi namunali xulq va faollik uchun bonus ballar.</li>
            </ul>
          </div>
        </div>

        <!-- 4. PROFILIM -->
        <div class="menu-card profile">
          <div class="menu-card-header">
            <div class="menu-button-badge">👤 Profilim</div>
            <span style="font-size: 11px; font-weight: 700; color: #047857;">Shaxsiy Kabinet</span>
          </div>
          <div class="menu-card-body">
            O‘quvchining shaxsiy hisobi va botdagi to‘liq ma’lumotlar yig‘indisi.
            <ul class="feature-list">
              <li>O‘quvchining F.I.Sh va biriktirilgan Telegram profili;</li>
              <li>Jami to‘plangan test va dars ballari;</li>
              <li>Oylik natijalar va o‘quvchining shaxsiy dinamikasi.</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 2-SMENA HAFTALIK DARS TAQSIMOTI -->
      <div class="timetable-box">
        <h4>⏰ 6-"A" Sinfining Haftalik Dars Soatlari Taqsimoti (2-smena)</h4>
        <div class="timetable-grid">
          <div class="day-pill">
            <div class="day-name">Dushanba</div>
            <div class="lesson-count">5 ta dars</div>
          </div>
          <div class="day-pill">
            <div class="day-name">Seshanba</div>
            <div class="lesson-count">5 ta dars</div>
          </div>
          <div class="day-pill">
            <div class="day-name">Chorshanba</div>
            <div class="lesson-count">5 ta dars</div>
          </div>
          <div class="day-pill">
            <div class="day-name">Payshanba</div>
            <div class="lesson-count">6 ta dars</div>
          </div>
          <div class="day-pill">
            <div class="day-name">Juma</div>
            <div class="lesson-count">5 ta dars</div>
          </div>
          <div class="day-pill">
            <div class="day-name">Shanba</div>
            <div class="lesson-count">5 ta dars</div>
          </div>
        </div>
      </div>

      <!-- OTA-ONALARGA MUHIM ESLATMALAR -->
      <div class="parent-rules">
        <h4>📌 Ota-onalar uchun Tavsiyalar va Eslatmalar</h4>
        <div class="rules-grid">
          <div class="rule-item">
            <span class="r-icon">📱</span>
            <div><b>Doimiy monitoring:</b> Farzandingiz telefonida bot ulanganini tekshiring. Siz ham o‘z telefoningizdan farzandingiz nomidan ulanib kuzatishingiz mumkin.</div>
          </div>
          <div class="rule-item">
            <span class="r-icon">✍️</span>
            <div><b>Mustaqil ishlash:</b> Haftalik testlarni farzandingiz o‘zi mustaqil yechishiga imkon bering — bu uning chinakam bilimini ko‘rsatadi.</div>
          </div>
          <div class="rule-item">
            <span class="r-icon">🔐</span>
            <div><b>PIN-kodni asrang:</b> Berilgan 4 xonali PIN-kodni o‘quvchining kundaligiga yoki telefoniga yozib qo‘ying, begonalarga bermang.</div>
          </div>
          <div class="rule-item">
            <span class="r-icon">🤝</span>
            <div><b>Hamkorlik:</b> Har qanday savol, taklif yoki tushunmovchiliklar yuzasidan sinf rahbariga bemalol murojaat qilishingiz mumkin.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
      <div>Ta’limda sifat, intizom va raqamli hamkorlik sari birgalikda!</div>
      <div>Sinf rahbari: <b>6-"A" sinf</b></div>
      <div>2-bet / 2</div>
    </div>
  </div>

</body>
</html>`;

const outputHtmlPath = path.join(rootDir, "qollanma_ota_onalar.html");
const outputPdfPath = path.join(rootDir, "Ota_onalar_uchun_Bot_Qollanmasi_6A.pdf");
const desktopPdfPath = "C:\\Users\\uzkua\\Desktop\\Ota_onalar_uchun_Bot_Qollanmasi_6A.pdf";

fs.writeFileSync(outputHtmlPath, htmlContent, "utf8");
console.log("HTML fayl yozildi:", outputHtmlPath);

// Run Microsoft Edge Headless to print PDF
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const tempUserDataDir = path.join(rootDir, ".edge_pdf_profile");

const cmd = `"${edgePath}" --headless --user-data-dir="${tempUserDataDir}" --disable-gpu --no-pdf-header-footer --print-to-pdf="${outputPdfPath}" "file:///${outputHtmlPath.replace(/\\\\/g, "/")}"`;

console.log("PDF generatsiya qilinmoqda...");
try {
  execSync(cmd, { stdio: "inherit" });
  console.log("PDF muvaffaqiyatli yaratildi:", outputPdfPath);

  // Copy to Desktop as well
  fs.copyFileSync(outputPdfPath, desktopPdfPath);
  console.log("PDF Nusxasi Ish stoliga (Desktop) ham nusxalandi:", desktopPdfPath);

  // Clean up temp profile dir
  try {
    fs.rmSync(tempUserDataDir, { recursive: true, force: true });
  } catch (e) {}
} catch (err) {
  console.error("Xatolik yuz berdi:", err);
  process.exit(1);
}