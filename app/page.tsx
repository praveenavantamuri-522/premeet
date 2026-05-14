"use client";

import { useState } from "react";

export default function Home() {
  const [target, setTarget] = useState("");
  const [goal, setGoal] = useState("");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [briefHtml, setBriefHtml] = useState("");
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState("");
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  const findCandidates = async () => {
    if (!target || !goal) return setError("Please fill out both fields.");
    
    setLoadingMsg("Scouring the web for candidates...");
    setError("");
    setCandidates([]);
    setBriefHtml("");
    setFeedbackGiven(false);

    try {
      const response = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setCandidates(data.candidates);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingMsg("");
    }
  };

  const generateBrief = async (selectedCandidate: any) => {
    setLoadingMsg(`Analyzing deep profile for ${selectedCandidate.name}...`);
    setError("");
    setCandidates([]); 

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate: selectedCandidate, goal }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setBriefHtml(data.brief);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingMsg("");
    }
  };

  return (
    <main style={{ maxWidth: "800px", margin: "0 auto", padding: "40px" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "5px" }}>PreMeet 2.0</h1>
      <p style={{ color: "#64748b", fontSize: "1.1rem", marginBottom: "30px" }}>Deep intelligence profiles for your next meeting.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "30px" }}>
        <div>
          <label style={{ fontWeight: "600", display: "block", marginBottom: "8px" }}>Who are you looking for?</label>
          <input 
            type="text" 
            value={target} 
            onChange={(e) => setTarget(e.target.value)} 
            style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #ccc", color: "#000", fontSize: "1rem" }}
            placeholder="e.g. Praveen Vantamuri, Bosch"
          />
        </div>
        <div>
          <label style={{ fontWeight: "600", display: "block", marginBottom: "8px" }}>Meeting Goal</label>
          <input 
            type="text" 
            value={goal} 
            onChange={(e) => setGoal(e.target.value)} 
            style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #ccc", color: "#000", fontSize: "1rem" }}
            placeholder="e.g. Job Interview, Sales Pitch"
          />
        </div>
        
        <button 
          type="button" 
          onClick={findCandidates}
          disabled={!!loadingMsg}
          style={{ padding: "14px", backgroundColor: loadingMsg ? "#94a3b8" : "#0f172a", color: "#fff", border: "none", borderRadius: "6px", cursor: loadingMsg ? "not-allowed" : "pointer", fontSize: "1rem", fontWeight: "bold" }}
        >
          {loadingMsg ? loadingMsg : "Find Target"}
        </button>
      </div>

      {error && <div style={{ padding: "15px", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "6px", marginBottom: "20px" }}>{error}</div>}

      {candidates.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3 style={{ borderBottom: "2px solid #e2e8f0", paddingBottom: "10px", marginBottom: "15px" }}>Top Matches Found. Please select one:</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {candidates.map((c, index) => (
              <div key={index} onClick={() => generateBrief(c)} style={{ padding: "20px", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", backgroundColor: "#f8fafc", transition: "0.2s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <strong style={{ fontSize: "1.2rem", color: "#0f172a" }}>{c.name}</strong>
                  <span style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "4px 10px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "bold" }}>Match: {c.matchScore}</span>
                </div>
                <div style={{ color: "#475569", marginBottom: "10px", fontWeight: "500" }}>{c.headline}</div>
                <div style={{ color: "#64748b", fontSize: "0.9rem", fontStyle: "italic" }}>{c.reason}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {briefHtml && (
        <div style={{ marginTop: "30px", padding: "30px", backgroundColor: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0", color: "#1e293b", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
          <div dangerouslySetInnerHTML={{ __html: briefHtml }} style={{ lineHeight: "1.7" }} />
          
          <div style={{ marginTop: "30px", paddingTop: "20px", borderTop: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "15px" }}>
            <span style={{ fontWeight: "600", color: "#64748b" }}>Was this brief helpful?</span>
            <button onClick={() => setFeedbackGiven(true)} style={{ padding: "8px 15px", border: "1px solid #cbd5e1", borderRadius: "6px", backgroundColor: "#fff", cursor: "pointer", fontSize: "1.1rem" }}>👍</button>
            <button onClick={() => setFeedbackGiven(true)} style={{ padding: "8px 15px", border: "1px solid #cbd5e1", borderRadius: "6px", backgroundColor: "#fff", cursor: "pointer", fontSize: "1.1rem" }}>👎</button>
            {feedbackGiven && <span style={{ color: "#16a34a", fontSize: "0.9rem", fontWeight: "500" }}>Feedback recorded. Thank you!</span>}
          </div>
        </div>
      )}
    </main>
  );
}