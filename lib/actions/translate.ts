"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function translateContent(text: string, targetLangs: string[]) {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is missing in environment variables.");
    throw new Error("Yapay zeka anahtarı (.env.local) bulunamadı. Lütfen kurulumu kontrol edin.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    Translate the following restaurant menu content into these languages: ${targetLangs.join(", ")}.
    
    Content: "${text}"
    
    Format the response as a VALID JSON object where keys are the language codes and values are the translations.
    Example: {"en": "Beef Burger", "de": "Rindfleisch Burger"}
    
    Important: Return ONLY the JSON object. Do not include any markdown formatting like \`\`\`json.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();
    
    // Improved JSON extraction
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("AI Response did not contain JSON:", textResponse);
      throw new Error("Geçersiz yapay zeka yanıtı.");
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Gemini Translation Error:", error);
    throw new Error("Çeviri sırasında bir hata oluştu. Lütfen tekrar deneyin.");
  }
}
