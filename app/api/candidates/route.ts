import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { target } = await req.json();

    if (!target) {
      return NextResponse.json({ error: "Target name is required." }, { status: 400 });
    }

    const searchResponse = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: `Professional background, alumni records, publications, and news for: ${target}`,
        search_depth: "advanced",
        max_results: 5,
      }),
    });

    const searchData = await searchResponse.json();
    const searchContext = searchData.results?.map((r: any) => `Source: ${r.url}\nContent: ${r.content}`).join("\n\n") || "";

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an intelligence analyst. I searched the web for "${target}".
      Read the raw data below and identify up to 3 distinct people or entities this could refer to.
      
      Return ONLY a valid JSON array of objects. Do not include markdown formatting.
      Use this exact structure:
      [
        { "id": "1", "name": "Full Name", "headline": "Current Title / Company", "matchScore": "95%", "reason": "Why this is a likely match" }
      ]
      
      Raw Data:
      ${searchContext}
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    
    if (text.startsWith("```")) {
        text = text.replace(/```json/i, "").replace(/```/g, "").trim();
    }

    const candidates = JSON.parse(text);
    return NextResponse.json({ candidates });

  } catch (error: any) {
    console.error("Candidate Error:", error);
    return NextResponse.json({ error: "Failed to find candidates. Please try again." }, { status: 500 });
  }
}