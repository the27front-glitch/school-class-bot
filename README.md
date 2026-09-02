# 🏫 Maktab Sinf Boshqaruvi Telegram Boti (Senior JS + AI)

Maktab sinfi uchun to'liq avtomatlashgan, qulay va keng qamrovli boshqaruv tizimi (Google Gemini AI testlar generatori bilan).

---

## 🌟 Asosiy Imkoniyatlar

1. **👥 Gibrid O'quvchilar Boshqaruvi:**
   - Admin o'quvchilarni ism-familiyasi bilan kiritadi.
   - Telefoni bor o'quvchilar bot orqali o'z ismini tanlab, bir tugma bilan ulanadi.
   - Telefoni yo'q o'quvchilar uchun admin qo'lda test va bonus ballar qo'shishi mumkin.

2. **📋 Interaktiv & Tezkor Davomat:**
   - 1 tugma bilan barchani «Keldi» qilish.
   - 1 marta bosish bilan kelmagan/kechikkanlarni belgilash (✅ ➡️ ❌ ➡️ ⏱).
   - 30 ta o'quvchining davomatini olish 5 soniya vaqt oladi.

3. **🤖 Google Gemini AI 6-Sinf Testlari:**
   - **Dushanba 12:00:** 6-sinf darsligi bo'yicha 15 talik yangi test yuklanadi ➡️ **Chorshanba 12:00 da** yopiladi.
   - **Payshanba 12:00:** Keyingi fandan 15 talik yangi test yuklanadi ➡️ **Shanba 12:00 da** yopiladi.
   - Fanlar: *Ona tili, Adabiyot, Matematika, Tarix, Ingliz tili, Rus tili, Informatika, Geografiya, Botanika, Fizika, Texnologiya*.

4. **🏆 "Oy O'quvchisi" & Reyting:**
   - Ballar formulasi: `(Davomat kunlari × 5) + (To'g'ri test javoblari × 10) + Bonus ballar`.
   - Oylik liderlar reytingi va bir bosishda chiroyli `.xlsx` (Excel) hisobotini yuklab olish.

5. **📅 Dars Jadvali & Eslatmalar:**
   - Haftalik dars jadvalini kiritish, tahrirlash va tozalash.
   - Har kuni soat **20:00** da ertangi darslar jadvalini bot o'quvchilarga avtomatik yuboradi.
   - Dushanba-Shanba kunlari soat **08:30** da adminga davomat eslatmasi.

---

## 🚀 GitHub va Serverga (fhost.uz / VPS) O'rnatish

### 1. GitHub ga yuklash:
```bash
git init
git add .
git commit -m "feat: complete school class telegram bot with AI quizzes"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. Serverda (fhost.uz / Linux Terminal) ishga tushirish:
```bash
# Repozitoriyani yuklab olish
git clone YOUR_GITHUB_REPO_URL
cd school-class-bot

# Kutubxonalarni o'rnatish
npm install

# .env faylini yaratish va sozlash
cp .env.example .env
nano .env

# Ma'lumotlar bazasini ishga tushirish
npx prisma db push

# Botni 24/7 rejimida PM2 bilan ishga tushirish
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### 3. `.env` Fayli Tarkibi:
```env
BOT_TOKEN=8741849192:AAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ADMIN_IDS=7317240558
ATTENDANCE_POINTS=5
QUIZ_POINT_MULTIPLIER=10
```