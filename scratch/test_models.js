const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = "AIzaSyBXlUWFN-Xp71Kv1wZJlEDdShvUBO1dAHk";

async function listModels() {
  const genAI = new GoogleGenerativeAI(API_KEY);
  // Test common model names
  const models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.0-pro", "gemini-pro"];
  
  for (const m of models) {
    console.log(`Testing model: ${m}...`);
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Hi");
      const response = await result.response;
      console.log(`✅ Model ${m} is WORKING. Response: ${response.text().substring(0, 10)}...`);
    } catch (e) {
      console.log(`❌ Model ${m} FAILED: ${e.message}`);
    }
  }
}

listModels();
