# PreMeet 2.0 - Architecture Guide

## System Overview
PreMeet is a stateless, two-step AI intelligence agent built on Next.js. It requires no persistent database, executing web scraping and AI synthesis on the fly.

## The Data Flow (Two-Step Process)

### Step 1: Candidate Disambiguation
1. **Input:** User enters a generic target name (e.g., "Rahul Sharma") via `app/page.tsx`.
2. **Search:** The backend (`app/api/candidates/route.ts`) queries the Tavily API for broad matches.
3. **AI Parsing:** Gemini 2.5 Flash analyzes the raw web data and extracts up to 3 distinct human profiles, returning a structured JSON array to the frontend.
4. **Selection:** The UI renders interactive candidate cards, allowing the user to select the exact person they are looking for.

### Step 2: Deep Profile Synthesis
1. **Deep Search:** Once a candidate is clicked, the UI sends the specific name and headline to `app/api/research/route.ts`.
2. **Targeted Scraping:** Tavily performs an advanced, targeted search for interviews, social media footprints, and career history.
3. **HTML Generation:** Gemini 2.5 Flash acts as an executive briefer, synthesizing the data into a strictly formatted HTML document containing a psychological profile, icebreakers, and a goal-specific strategy.
4. **Delivery:** The styled HTML is injected safely into the frontend UI.

## Technology Stack
*   **Framework:** Next.js (React)
*   **Styling:** Standard CSS (No external libraries)
*   **Search Engine:** Tavily API
*   **LLM (Brain):** Google Gemini 2.5 Flash