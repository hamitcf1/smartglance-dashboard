// Test script to verify API keys and configuration
// Open browser console (F12) and paste this code to diagnose issues

console.log("=== SMARTGLANCE API DIAGNOSTIC ===\n");

// 1. Check environment variables
console.log("1. ENVIRONMENT VARIABLES:");
console.log("   Gemini API Key:", process.env.GEMINI_API_KEY ? "✓ Configured" : "✗ Missing");
console.log("   YouTube API Key:", process.env.YOUTUBE_API_KEY ? "✓ Configured" : "✗ Missing");
console.log("   Google Client ID:", process.env.GOOGLE_CLIENT_ID ? "✓ Configured" : "✗ Missing");

// 2. Test Gemini API directly
console.log("\n2. TESTING GEMINI API:");
async function testGemini() {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Say 'test successful'" }] }]
        })
      }
    );
    
    const data = await response.json();
    if (response.ok) {
      console.log("   ✓ Gemini API Working!");
      console.log("   Response:", data.candidates[0].content.parts[0].text);
    } else {
      console.log("   ✗ Gemini API Error:", data.error.message);
    }
  } catch (err) {
    console.log("   ✗ Error:", err.message);
  }
}

// 3. Test YouTube API
console.log("\n3. TESTING YOUTUBE API:");
async function testYouTube() {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=GoogleDevelopers&key=${process.env.YOUTUBE_API_KEY}`
    );
    
    const data = await response.json();
    if (response.ok) {
      console.log("   ✓ YouTube API Working!");
    } else {
      console.log("   ✗ YouTube API Error:", data.error.message);
    }
  } catch (err) {
    console.log("   ✗ Error:", err.message);
  }
}

// 4. Check Google Sign-In
console.log("\n4. CHECKING GOOGLE SIGN-IN:");
console.log("   Window.google:", window.google ? "✓ Loaded" : "✗ Not loaded");
if (window.google?.accounts?.id) {
  console.log("   Google ID Available:", "✓ Yes");
} else {
  console.log("   Google ID Available:", "✗ No");
}

testGemini();
testYouTube();

console.log("\nWait for responses above to see which APIs are working...");
