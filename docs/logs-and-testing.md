# PreMeet 2.0 Troubleshooting & Testing Guide

## Common Errors & Resolutions

**1. Error: `[503 Service Unavailable] High Demand`**
*   **Cause:** Google Gemini's free tier servers are currently handling too many global requests.
*   **Resolution:** This is temporary. Wait 60 seconds and click the button again.

**2. Error: `Failed to parse URL from [https://...]`**
*   **Cause:** A copy-paste error accidentally included Markdown brackets `[]()` around the Tavily API URL inside `route.ts`.
*   **Resolution:** Open the API files and ensure the fetch URL is strictly `"https://api.tavily.com/search"`.

**3. Error: `ENOTFOUND api.tavily.com` or `ENOTFOUND vercel.com`**
*   **Cause:** Your local network, VPN, or corporate firewall is blocking Node.js from making outbound requests.
*   **Resolution:** Disconnect from VPN, or connect your computer to a mobile hotspot to bypass the local router block.

**4. Error: `Unexpected token '<', "```html"... is not valid JSON`**
*   **Cause:** The AI accidentally wrapped its response in markdown code blocks.
*   **Resolution:** The current V2 code handles this automatically by running `.replace(/
```html/i, "")` before sending data to the frontend.