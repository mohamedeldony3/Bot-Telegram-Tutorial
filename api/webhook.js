import axios from "axios";
import { summarizeText, explainQuestion, generateExam } from "../utils/openai.js";
import { saveSetting, getUserSettings } from "../utils/settings.js";

const TELEGRAM_TOKEN = process.env.BOT_TOKEN;
const URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

// القائمة الرئيسية
const mainMenu = {
  reply_markup: {
    keyboard: [
      [{ text: "🎓 تلخيص درس" }, { text: "📘 شرح سؤال" }],
      [{ text: "🧪 امتحان سريع" }],
      [{ text: "📄 رفع ملف PDF" }, { text: "🎤 شرح فويس" }],
      [{ text: "⚙️ الإعدادات" }]
    ],
    resize_keyboard: true
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("Bot running");

  const update = req.body;

  // رسائل عادية
  if (update.message) {
    const chatId = update.message.chat.id;
    const text = update.message.text || "";

    const settings = getUserSettings(chatId);

    if (text === "/start") {
      return sendMessage(
        chatId,
        "أهلاً 👋\nاختر الخدمة التي تريدها:",
        mainMenu
      );
    }

    if (text === "🎓 تلخيص درس") {
      return sendMessage(chatId, "📄 ابعت النص أو الدرس المراد تلخيصه:");
    }

    if (text === "📘 شرح سؤال") {
      return sendMessage(chatId, "❓ ابعت السؤال أو صورة من الكتاب:");
    }

    if (text === "🧪 امتحان سريع") {
      const exam = await generateExam();
      return sendMessage(chatId, exam);
    }

    if (text === "⚙️ الإعدادات") {
      return sendSettingsMenu(chatId);
    }

    // شرح تلقائي
    if (text) {
      const response = await explainQuestion(text, settings);
      return sendMessage(chatId, response);
    }
  }

  // callback buttons
  if (update.callback_query) {
    const chatId = update.callback_query.from.id;
    const msgId = update.callback_query.message.message_id;
    const data = update.callback_query.data;

    // لوحة الإعدادات
    if (data === "level") {
      return editMessage(chatId, msgId, "اختر مستوى الشرح:", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "سهل", callback_data: "level_easy" }],
            [{ text: "متوسط", callback_data: "level_medium" }],
            [{ text: "متقدم", callback_data: "level_hard" }]
          ]
        }
      });
    }

    if (data.startsWith("
