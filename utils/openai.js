import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_KEY
});

// تلخيص
export async function summarizeText(text, settings) {
  let summaryType = settings.summary_type || "medium";

  const prompt = `
لخص النص التالي بطريقة ${summaryType}:
${text}
  `;

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });

  return res.choices[0].message.content;
}

// شرح سؤال
export async function explainQuestion(text, settings) {
  let level = settings.level || "medium";
  let style = settings.style || "simple";
  let lang = settings.language || "ar";

  const prompt = `
اشرح السؤال التالي بمستوى ${level} وبستايل ${style} وباللغة ${lang}:
${text}
`;

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });

  return res.choices[0].message.content;
}

// امتحان
export async function generateExam(subject = "عام") {
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `اعمل امتحان مكون من 5 أسئلة في مادة ${subject} مع الإجابات.`
      }
    ]
  });

  return res.choices[0].message.content;
}
