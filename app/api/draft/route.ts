import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    // NEW: We are now accepting the 'goal' from the frontend
    const { targetName, briefContext, type, goal } = await req.json();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

    const platform = type === "email" ? "Cold Email" : "LinkedIn Direct Message";
    const constraints = type === "email" 
        ? "Include an intriguing subject line. Keep the body under 120 words. Format with line breaks."
        : "Keep it under 75 words (LinkedIn limit). No subject line. Very conversational.";

    const prompt = `
      You are an elite, top-performing enterprise SDR.
      Write a highly personalized ${platform} to ${targetName}.
      
      YOUR EXPLICIT GOAL: "${goal}"
      
      Use the intelligence dossier below to find a unique "hook" (e.g., a recent milestone, a shared value, or an insightful observation).
      Transition smoothly from that hook directly into your explicit goal (${goal}).
      ${constraints}
      End with a soft, low-friction call to action (e.g., asking a quick question, not asking for a 30 min call).
      Return ONLY the text of the message. No conversational filler before or after.

      Dossier Data:
      ${briefContext}
    `;

    const result = await model.generateContent(prompt);
    return NextResponse.json({ draft: result.response.text().trim() });

  } catch (error: any) {
    console.error("Drafting Error:", error);
    return NextResponse.json({ error: "Failed to generate outreach draft." }, { status: 500 });
  }
}