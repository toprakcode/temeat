const API_KEY = "AIzaSyBXlUWFN-Xp71Kv1wZJlEDdShvUBO1dAHk";

async function testFetch() {
  const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
  
  for (const m of models) {
    console.log(`Testing with fetch (v1) for model: ${m}...`);
    try {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1/models/${m}:generateContent?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] })
      });
      const data = await resp.json();
      if (resp.ok) {
        console.log(`✅ Model ${m} (v1) is WORKING.`);
      } else {
        console.log(`❌ Model ${m} (v1) FAILED: ${data.error?.message || JSON.stringify(data)}`);
      }
    } catch (e) {
      console.log(`❌ Fetch error for ${m}: ${e.message}`);
    }
  }
}

testFetch();
