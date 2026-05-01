const API_KEY = "AIzaSyBXlUWFN-Xp71Kv1wZJlEDdShvUBO1dAHk";

async function listModels() {
  try {
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`);
    const data = await resp.json();
    console.log("Available Models:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.log("Error:", e.message);
  }
}

listModels();
