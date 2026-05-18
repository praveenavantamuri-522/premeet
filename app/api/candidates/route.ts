import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { target } = await req.json();

    if (!target) {
      return NextResponse.json({ error: "Target name is required." }, { status: 400 });
    }

    // 1. Broad Web Search (Searching for any trace on net)
    const searchResponse = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: `Detailed professional profile, alumni records, publications, and news for: ${target}`,
        search_depth: "advanced",
        max_results: 10, // Increased results for better disambiguation
      }),
    });

    const searchData = await searchResponse.json();
    const searchContext = searchData.results?.map((r: any) => `Source: ${r.url}\nContent: ${r.content}`).join("\n\n") || "";

    // 2. AI Brain: Extract Matches (Prioritizing Org Profile first)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    // Use gemini-3.1-flash-lite as we fixed previously
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

    const prompt = `
      You are an intelligence analyst. I searched the web for "${target}".
      Read the raw data below and identify the distinct people or organizations this could refer to.
      
      CRITICAL INSTRUCTION:
      If the raw data suggests "${target}" is a well-known Organization (e.g., Acme Corp), the VERY FIRST item in the JSON array MUST be the general profile for "Acme Corp" itself (marked with "type": "organization").
      The subsequent items should be the TOP 3 People associated with Acme Corp (e.g., CEO, Founder).
      If "${target}" is primarily a person (marked with "type": "person"), list the distinct individuals.

      Return ONLY a valid JSON array of objects. Do not include markdown formatting.
      Use this exact structure:
      [
        { "id": "1", "name": "Name/Organization Name", "headline": "Title / Industry", "matchScore": "95%", "reason": "Why likely match", "type": "person" | "organization" }
      ]
      
      Raw Data:
      ${searchContext}
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    
    // Clean up markdown tags if present
    if (text.startsWith("```")) {
        text = text.replace(/```json/i, "").replace(/```/g, "").trim();
    }

    const candidates = JSON.parse(text);
    return NextResponse.json({ candidates });

  } catch (error: any) {
    console.error("Candidate Error:", error);
    return NextResponse.json({ error: error.message || "Failed to find candidates." }, { status: 500 });
  }
}