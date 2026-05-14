import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { candidate, goal } = await req.json();

    const searchResponse = await fetch("[https://api.tavily.com/search](https://api.tavily.com/search)", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: `Latest news, interviews, personality, and career history for ${candidate.name}, ${candidate.headline}`,
        search_depth: "advanced",
        max_results: 7,
      }),
    });

    const searchData = await searchResponse.json();
    const searchContext = searchData.results?.map((r: any) => `Source: ${r.url}\nContent: ${r.content}`).join("\n\n") || "";

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert executive briefer.
      Target: ${candidate.name} (${candidate.headline})
      Goal: ${goal}
      
      Raw Search Data:
      ${searchContext}
      
      Write a highly structured meeting brief. 
      CRITICAL RULE: Return your response ONLY as valid, clean HTML. Do not include markdown or \`\`\`html tags. 
      Use clear <h2> headings, <ul> bulleted lists, and <strong> tags for emphasis. Be concise and neat.

      Include exactly these sections:
      <h2>🧠 Psychological & Personality Profile</h2>
      <ul><li>(Predict 3 traits, communication style, and values based on data)</li></ul>

      <h2>🚀 3 Tailored Conversation Openers</h2>
      <ul><li>(Specific to their background)</li></ul>

      <h2>🏆 What to Acknowledge / Compliment</h2>
      <ul><li>(Genuine achievements)</li></ul>

      <h2>⚠️ Topics to Avoid</h2>
      <ul><li>(Potential sensitivities or irrelevant news)</li></ul>

      <h2>🎯 Goal-Specific Strategy</h2>
      <p><strong>Your Goal:</strong> ${goal}</p>
      <ul><li>(Step-by-step approach to win this specific meeting)</li></ul>

      <hr style="margin: 30px 0; border: 0; border-top: 1px solid #ddd;" />
      <p style="font-size: 0.85em; color: #666; font-style: italic;">Note: The results are based on an AI agent's web research and are prone to errors. Use these insights with caution. Your own research and intuition should be used along with this information.</p>
    `;

    const result = await model.generateContent(prompt);
    let htmlResponse = result.response.text().trim();
    
    if (htmlResponse.startsWith("```")) {
        htmlResponse = htmlResponse.replace(/
```html/i, "").replace(/```/g, "").trim();
    }

    return NextResponse.json({ brief: htmlResponse });

  } catch (error: any) {
    console.error("Research Error:", error);
    return NextResponse.json({ error: "Failed to generate brief. Please try again." }, { status: 500 });
  }
}