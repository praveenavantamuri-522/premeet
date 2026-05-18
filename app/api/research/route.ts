import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { candidate, goal } = await req.json();
    const isPerson = candidate.type === "person";

    // 1. Specific Web Search
    const searchQuery = isPerson 
        ? `LinkedIn profile, email format, latest news, and career history for ${candidate.name}, ${candidate.headline}`
        : `Official website, LinkedIn page, company profile, and products for ${candidate.name}, ${candidate.headline}`;

    const searchResponse = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: searchQuery,
        search_depth: "advanced",
        max_results: 7,
      }),
    });

    const searchData = await searchResponse.json();
    const searchContext = searchData.results?.map((r: any) => `Source: ${r.url}\nContent: ${r.content}`).join("\n\n") || "";

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

    // 2. Base Instruction
    const basePrompt = `
      You are an expert executive briefer and UI designer. 
      Target: ${candidate.name} (${candidate.headline})
      Goal: ${goal}
      Data: ${searchContext}
      
      Create a visually stunning, infographic-style brief using inline CSS designed for a dark theme (#1e1e1e background).
      CRITICAL INSTRUCTION: Return your response ONLY as valid, clean HTML with inline CSS. DO NOT include markdown symbols like \`**\` or \`###\`. Use \`<h2>\`, \`<strong>\`, and \`<ul>\` tags strictly for formatting.
    `;

    // 3. Conditional Prompts (Person vs. Org)
    let finalPrompt = "";
    if (isPerson) {
        finalPrompt = `
          ${basePrompt}
          Use this visual structure:

          <div style="margin-bottom: 25px; padding: 15px 20px; background: rgba(59, 130, 246, 0.1); border-radius: 8px; border: 1px solid #3b82f6; display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
            <strong style="color: #60a5fa;">Direct Access:</strong>
            <a href="[Extract exact LinkedIn URL from data, or # if none]" target="_blank" style="color: #f8fafc; text-decoration: none; display: flex; align-items: center; gap: 5px;">🔗 LinkedIn Profile</a>
            <a href="mailto:[Guess the most likely corporate email based on name/company, e.g. first.last@company.com]" style="color: #f8fafc; text-decoration: none; display: flex; align-items: center; gap: 5px;">📧 [Guessed Email]</a>
          </div>

          <h2>🧠 Psychological & Personality Matrix</h2>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
            <div style="background: #2d2d2d; padding: 15px; border-radius: 8px; border: 1px solid #404040; text-align: center;">
              <div style="font-size: 1.2rem;">🔍</div>
              <strong style="color: #60a5fa; font-size: 1.1em;">Mindset Insight</strong>
              <p style="margin: 5px 0 0; font-size: 0.9em; color: #cbd5e1;">[Predictive trait derived from data]</p>
            </div>
            <div style="background: #2d2d2d; padding: 15px; border-radius: 8px; border: 1px solid #404040; text-align: center;">
              <div style="font-size: 1.2rem;">🗣️</div>
              <strong style="color: #8b5cf6; font-size: 1.1em;">Communication</strong>
              <p style="margin: 5px 0 0; font-size: 0.9em; color: #cbd5e1;">[Predicted style: Formal/Direct vs. Casual/Creative]</p>
            </div>
            <div style="background: #2d2d2d; padding: 15px; border-radius: 8px; border: 1px solid #404040; text-align: center;">
              <div style="font-size: 1.2rem;">💡</div>
              <strong style="color: #10b981; font-size: 1.1em;">Core Values</strong>
              <p style="margin: 5px 0 0; font-size: 0.9em; color: #cbd5e1;">[Predicted drivers based on data]</p>
            </div>
          </div>

          <h2>🚀 3 Tailored Conversation Openers</h2>
          <ul><li>[Specific opener based on work]</li><li>[Opener based on background/interests]</li><li>[Genuine achievement compliment]</li></ul>

          <h2>⚠️ Topics to Avoid</h2>
          <div style="background: rgba(153, 27, 27, 0.1); padding: 15px; border-radius: 8px; border: 1px solid #7f1d1d; color: #f87171; margin-bottom: 20px;">
            <ul><li>[Red flag 1]</li><li>[Irrelevant gossip/sensitivities]</li></ul>
          </div>

          <h2>🎯 Goal Execution: ${goal}</h2>
          <ul>
            <li><strong>Opening:</strong> [Step 1 to win rapport]</li>
            <li><strong>Pitch:</strong> [Step 2 connecting pitch to their values]</li>
            <li><strong>Closing:</strong> [Step 3 for conversion]</li>
          </ul>

          <hr style="margin: 30px 0; border: 0; border-top: 1px solid #404040;" />
        `;
    } else {
        finalPrompt = `
          ${basePrompt}
          Use this structure:

          <div style="margin-bottom: 25px; padding: 15px 20px; background: rgba(59, 130, 246, 0.1); border-radius: 8px; border: 1px solid #3b82f6; display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
            <strong style="color: #60a5fa;">Official Links:</strong>
            <a href="[Extract official Website URL, or #]" target="_blank" style="color: #f8fafc; text-decoration: none; display: flex; align-items: center; gap: 5px;">🌐 Website</a>
            <a href="[Extract official LinkedIn Company URL, or #]" target="_blank" style="color: #f8fafc; text-decoration: none; display: flex; align-items: center; gap: 5px;">🔗 LinkedIn Page</a>
          </div>

          <h2>🏢 Organization Profile: ${candidate.name}</h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
            <div style="background: #2d2d2d; padding: 15px; border-radius: 8px; border: 1px solid #404040;">
              <div style="font-size: 1.2rem; color: #60a5fa;">🎯</div>
              <strong style="color: #f8fafc; font-size: 1.1em; display: block; margin-bottom: 5px;">Company Vision & Culture</strong>
              <p style="margin: 0; font-size: 0.9em; color: #cbd5e1;">[Predictive traits derived from data tags]</p>
            </div>
             <div style="background: #2d2d2d; padding: 15px; border-radius: 8px; border: 1px solid #404040;">
              <div style="font-size: 1.2rem; color: #8b5cf6;">🚀</div>
              <strong style="color: #f8fafc; font-size: 1.1em; display: block; margin-bottom: 5px;">Key Products & Markets</strong>
              <p style="margin: 0; font-size: 0.9em; color: #cbd5e1;">[Predictive summary from tags]</p>
            </div>
          </div>

          <h2>🏆 Recent Milestones & News</h2>
          <ul><li>[Significant achievement/news 1]</li><li>[Significant achievement/news 2]</li><li>[Significant achievement/news 3]</li></ul>

          <h2>⚠️ Risk Analysis & Competitors</h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
            <div style="background: rgba(153, 27, 27, 0.1); padding: 15px; border-radius: 8px; border: 1px solid #7f1d1d;">
              <strong style="color: #fca5a5;">Major Internal Risks</strong>
              <ul style="color: #f87171; font-size: 0.9em; padding-left: 15px;"><li>[Risk 1]</li><li>[Risk 2]</li></ul>
            </div>
             <div style="background: rgba(234, 179, 8, 0.1); padding: 15px; border-radius: 8px; border: 1px solid #ca8a04;">
              <strong style="color: #fef08a;">Key Competitors</strong>
              <ul style="color: #fde047; font-size: 0.9em; padding-left: 15px;"><li>[Competitor 1]</li><li>[Competitor 2]</li></ul>
            </div>
          </div>

          <h2>🎯 Deal Execution: ${goal}</h2>
          <ul>
            <li><strong>Value Prop:</strong> [How your goal aligns with their current trajectory]</li>
            <li><strong>Angle:</strong> [Step connecting goal to product/market insight]</li>
            <li><strong>Closing:</strong> [Next best step derived from the analysis]</li>
          </ul>

          <hr style="margin: 30px 0; border: 0; border-top: 1px solid #404040;" />
        `;
    }

    const result = await model.generateContent(finalPrompt);
    let htmlResponse = result.response.text().trim();
    
    if (htmlResponse.startsWith("```")) {
        htmlResponse = htmlResponse.replace(/```html/i, "").replace(/```/g, "").trim();
    }

    return NextResponse.json({ brief: htmlResponse });

  } catch (error: any) {
    console.error("Research Error:", error);
    return NextResponse.json({ error: "Failed to build detailed analysis." }, { status: 500 });
  }
}