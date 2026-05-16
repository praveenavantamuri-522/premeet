"use client";

import { useState } from "react";

export default function Home() {
  // App Routing State: 'home' | 'candidates' | 'brief'
  const [view, setView] = useState<'home' | 'candidates' | 'brief'>('home');
  
  // Data States
  const [targetType, setTargetType] = useState<'person' | 'organization'>('person');
  const [targetName, setTargetName] = useState("");
  const [selectedGoal, setSelectedGoal] = useState("");
  const [customGoal, setCustomGoal] = useState("");
  
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [briefHtml, setBriefHtml] = useState("");
  
  // Status States
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState("");
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  const predefinedGoals = [
    "Sales call", 
    "Job interview", 
    "Partnership discussion", 
    "Investor pitch", 
    "Other..."
  ];

  const resetHome = () => {
    setView('home');
    setTargetName("");
    setSelectedGoal("");
    setCustomGoal("");
    setError("");
  };

  const getFinalGoal = () => {
    return selectedGoal === "Other..." ? customGoal : selectedGoal;
  };

  const findCandidates = async () => {
    const finalGoal = getFinalGoal();
    if (!targetName || !finalGoal) return setError("Please enter a name and select a context/goal.");
    
    setLoadingMsg("Scouring the web for matches...");
    setError("");
    
    try {
      // Modify search slightly based on if it's a person or org
      const queryContext = targetType === 'person' ? "Professional background, LinkedIn, and current roles for" : "Company overview, news, and executives for";
      
      const response = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: `${queryContext}: ${targetName}` }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setCandidates(data.candidates);
      setView('candidates');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingMsg("");
    }
  };

  const generateBrief = async (candidate: any) => {
    const finalGoal = getFinalGoal();
    setSelectedCandidate(candidate);
    
    // Dynamically update loading message based on if it's an org or person
    const contextMsg = candidate.type === 'organization' ? 'detailed organization analysis' : 'individual profile';
    setLoadingMsg(`Generating ${contextMsg} for ${candidate.name}...`);
    
    setError("");
    setFeedbackGiven(false);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate, goal: finalGoal }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setBriefHtml(data.brief);
      setView('brief');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingMsg("");
    }
  };

  const Header = () => (
    <div style={{ textAlign: "center", marginBottom: "40px" }}>
      <h1 
        onClick={resetHome} 
        style={{ 
          fontSize: "3rem", 
          margin: 0, 
          cursor: "pointer", 
          fontWeight: "900", 
          letterSpacing: "-1px",
          display: "inline-block",
          background: "-webkit-linear-gradient(left, #ffffff, #60a5fa)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}
      >
        PreMeet
      </h1>
      <p style={{ color: "#9ca3af", margin: "10px 0 0 0", fontSize: "1.1rem" }}>
        Intelligence briefing before every meeting
      </p>
    </div>
  );

  return (
    <main style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px", minHeight: "100vh" }}>
      <Header />

      {/* --- VIEW: HOME (SEARCH) --- */}
      {view === 'home' && (
        <div style={{ animation: "fadeIn 0.5s" }}>
          
          <div style={{ 
            backgroundColor: "#222222", 
            padding: "35px", 
            borderRadius: "16px", 
            border: "1px solid #333333", 
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)" 
          }}>
            
            {/* Target Type Selector */}
            <div style={{ marginBottom: "25px" }}>
              <label style={{ color: "#9ca3af", fontSize: "0.85rem", fontWeight: "600", letterSpacing: "1px", marginBottom: "12px", display: "block" }}>
                SEARCHING FOR?
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                {/* Person Button */}
                <div 
                  onClick={() => setTargetType('person')}
                  style={{ 
                    padding: "15px", 
                    borderRadius: "8px", 
                    border: `1px solid ${targetType === 'person' ? '#3b82f6' : '#404040'}`, 
                    backgroundColor: targetType === 'person' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                  }}
                >
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#c7d2fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>👤</div>
                  <div>
                    <div style={{ color: targetType === 'person' ? '#60a5fa' : '#f8fafc', fontWeight: "bold" }}>A Person</div>
                    <div style={{ color: "#9ca3af", fontSize: "0.85rem" }}>Individual, executive, contact</div>
                  </div>
                </div>

                {/* Organization Button */}
                <div 
                  onClick={() => setTargetType('organization')}
                  style={{ 
                    padding: "15px", 
                    borderRadius: "8px", 
                    border: `1px solid ${targetType === 'organization' ? '#3b82f6' : '#404040'}`, 
                    backgroundColor: targetType === 'organization' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                  }}
                >
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#4b5563", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>🏢</div>
                  <div>
                    <div style={{ color: targetType === 'organization' ? '#60a5fa' : '#f8fafc', fontWeight: "bold" }}>An Organization</div>
                    <div style={{ color: "#9ca3af", fontSize: "0.85rem" }}>Company, startup, brand</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Name Input */}
            <div style={{ marginBottom: "25px" }}>
              <label style={{ color: "#9ca3af", fontSize: "0.85rem", fontWeight: "600", letterSpacing: "1px", marginBottom: "8px", display: "block", textTransform: "uppercase" }}>
                Name
              </label>
              <input 
                type="text" 
                value={targetName} 
                onChange={(e) => setTargetName(e.target.value)} 
                style={{ width: "100%", padding: "14px", borderRadius: "8px", fontSize: "1.1rem" }}
                placeholder={targetType === 'person' ? "e.g. Praveen Vantamuri" : "e.g. Google LLC"}
              />
            </div>

            {/* Context/Goal Input */}
            <div style={{ marginBottom: "30px" }}>
              <label style={{ color: "#9ca3af", fontSize: "0.85rem", fontWeight: "600", letterSpacing: "1px", marginBottom: "12px", display: "block" }}>
                CONTEXT <span style={{ textTransform: "none", fontWeight: "normal" }}>(Select one)</span>
              </label>
              
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "15px" }}>
                {predefinedGoals.map(goal => (
                  <button
                    key={goal}
                    onClick={() => setSelectedGoal(goal)}
                    className={`goal-pill ${selectedGoal === goal ? 'selected' : ''}`}
                  >
                    {goal}
                  </button>
                ))}
              </div>

              {/* Show custom input if "Other..." is selected */}
              {selectedGoal === "Other..." && (
                <input 
                  type="text" 
                  value={customGoal} 
                  onChange={(e) => setCustomGoal(e.target.value)} 
                  style={{ width: "100%", padding: "14px", borderRadius: "8px", fontSize: "1rem" }}
                  placeholder="Type your specific context or goal..."
                />
              )}
            </div>
            
            <button 
              onClick={findCandidates}
              disabled={!!loadingMsg}
              style={{ 
                width: "100%",
                padding: "16px", 
                backgroundColor: loadingMsg ? "#4b5563" : "transparent", 
                color: "#f8fafc", 
                border: "1px solid #64748b", 
                borderRadius: "8px", 
                cursor: loadingMsg ? "not-allowed" : "pointer", 
                fontSize: "1.1rem", 
                fontWeight: "bold",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => { if(!loadingMsg) { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = '#9ca3af'; }}}
              onMouseOut={(e) => { if(!loadingMsg) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = '#64748b'; }}}
            >
              {loadingMsg ? loadingMsg : "Start Intelligence Scan"}
            </button>
            {error && <div style={{ color: "#ef4444", fontWeight: "500", textAlign: "center", marginTop: "15px" }}>{error}</div>}
          </div>
          
          {/* HOW IT WORKS SECTION */}
          <div style={{ marginTop: "60px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
              
              {/* Step 1 */}
              <div style={{ backgroundColor: "#1e1e1e", border: "1px solid #333333", borderRadius: "12px", padding: "30px 20px", textAlign: "center", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "15px" }}>🎯</div>
                <div style={{ color: "#9ca3af", fontSize: "0.8rem", fontWeight: "bold", letterSpacing: "1px", marginBottom: "10px" }}>STEP 1</div>
                <div style={{ color: "#f8fafc", fontWeight: "600", marginBottom: "8px", fontSize: "1.1rem" }}>Choose your target</div>
                <div style={{ color: "#9ca3af", fontSize: "0.95rem", lineHeight: "1.4" }}>A specific person or an organization</div>
              </div>

              {/* Step 2 */}
              <div style={{ backgroundColor: "#1e1e1e", border: "1px solid #333333", borderRadius: "12px", padding: "30px 20px", textAlign: "center", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "15px" }}>⚡</div>
                <div style={{ color: "#9ca3af", fontSize: "0.8rem", fontWeight: "bold", letterSpacing: "1px", marginBottom: "10px" }}>STEP 2</div>
                <div style={{ color: "#f8fafc", fontWeight: "600", marginBottom: "8px", fontSize: "1.1rem" }}>Add context</div>
                <div style={{ color: "#9ca3af", fontSize: "0.95rem", lineHeight: "1.4" }}>Set your goal: sales, interview, or networking</div>
              </div>

              {/* Step 3 */}
              <div style={{ backgroundColor: "#1e1e1e", border: "1px solid #333333", borderRadius: "12px", padding: "30px 20px", textAlign: "center", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "15px" }}>📄</div>
                <div style={{ color: "#9ca3af", fontSize: "0.8rem", fontWeight: "bold", letterSpacing: "1px", marginBottom: "10px" }}>STEP 3</div>
                <div style={{ color: "#f8fafc", fontWeight: "600", marginBottom: "8px", fontSize: "1.1rem" }}>Get your brief</div>
                <div style={{ color: "#9ca3af", fontSize: "0.95rem", lineHeight: "1.4" }}>Deep insights, talking points, and strategy</div>
              </div>

            </div>
          </div>

          {/* FOOTER & ATTRIBUTION */}
          <div style={{ textAlign: "center", marginTop: "60px", color: "#6b7280", borderTop: "1px solid #333333", paddingTop: "30px", paddingBottom: "20px" }}>
            <p style={{ fontSize: "0.9rem", fontStyle: "italic", marginBottom: "15px" }}>Results are based on an AI agent's web research and are prone to errors. Use intuition.</p>
            <p style={{ fontSize: "0.95rem", color: "#9ca3af" }}>
              Built with intent and AI by <a href="https://www.linkedin.com/in/praveen-vantamuri-p5a2v2/" target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa", textDecoration: "none", fontWeight: "600", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "#3b82f6"} onMouseOut={(e) => e.currentTarget.style.color = "#60a5fa"}>Praveen Vantamuri</a>
            </p>
          </div>

        </div>
      )}

      {/* --- VIEW: CANDIDATES --- */}
      {view === 'candidates' && (
        <div style={{ animation: "fadeIn 0.5s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px" }}>
            <button 
              onClick={() => setView('home')} 
              style={{ padding: "8px 12px", backgroundColor: "#333", color: "#f8fafc", border: "1px solid #404040", borderRadius: "6px", cursor: "pointer" }}
            >
              &larr; Back
            </button>
            <h2 style={{ color: "#f8fafc", margin: 0 }}>Select Target</h2>
          </div>
          <p style={{ color: "#9ca3af", marginBottom: "30px" }}>We found multiple profiles. Select the correct target to generate the dossier.</p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {candidates.map((c, index) => (
              <div 
                key={index} 
                onClick={() => generateBrief(c)} 
                style={{ padding: "25px", border: "1px solid #404040", borderRadius: "12px", cursor: "pointer", backgroundColor: "#2d2d2d", transition: "all 0.2s" }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#404040'}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "1.5rem" }}>{c.type === 'organization' ? '🏢' : '👤'}</span>
                    <strong style={{ fontSize: "1.3rem", color: "#f8fafc" }}>{c.name}</strong>
                  </div>
                  <span style={{ backgroundColor: "rgba(22, 101, 52, 0.3)", color: "#86efac", border: "1px solid #15803d", padding: "4px 12px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "bold" }}>Score: {c.matchScore}</span>
                </div>
                <div style={{ color: "#60a5fa", marginBottom: "12px", fontWeight: "600", fontSize: "1.1rem", marginLeft: "38px" }}>{c.headline}</div>
                <div style={{ color: "#9ca3af", fontSize: "0.95rem", lineHeight: "1.5", marginLeft: "38px" }}>{c.reason}</div>
              </div>
            ))}
          </div>
          
          {loadingMsg && <div style={{ marginTop: "30px", textAlign: "center", color: "#60a5fa", fontWeight: "bold", fontSize: "1.1rem" }}>{loadingMsg}</div>}
        </div>
      )}

      {/* --- VIEW: BRIEF --- */}
      {view === 'brief' && briefHtml && (
        <div style={{ animation: "fadeIn 0.5s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid #404040" }}>
             <button 
              onClick={() => setView('candidates')} 
              style={{ padding: "8px 12px", backgroundColor: "#333", color: "#f8fafc", border: "1px solid #404040", borderRadius: "6px", cursor: "pointer" }}
            >
              &larr; Back
            </button>
            <div>
              <h2 style={{ fontSize: "2rem", margin: 0, color: "#f8fafc" }}>Intelligence Dossier</h2>
              <p style={{ color: "#9ca3af", margin: "5px 0 0 0", fontSize: "1.1rem" }}>Target: {selectedCandidate?.name}</p>
            </div>
          </div>

          <div dangerouslySetInnerHTML={{ __html: briefHtml }} style={{ lineHeight: "1.6" }} />
          
           <div style={{ marginTop: "30px", paddingTop: "20px", borderTop: "1px solid #404040", display: "flex", alignItems: "center", gap: "15px" }}>
            <span style={{ fontWeight: "600", color: "#9ca3af" }}>Was this brief helpful?</span>
            <button onClick={() => setFeedbackGiven(true)} style={{ padding: "8px 15px", border: "1px solid #404040", borderRadius: "6px", backgroundColor: "#333", color: "#fff", cursor: "pointer", fontSize: "1.1rem" }}>👍</button>
            <button onClick={() => setFeedbackGiven(true)} style={{ padding: "8px 15px", border: "1px solid #404040", borderRadius: "6px", backgroundColor: "#333", color: "#fff", cursor: "pointer", fontSize: "1.1rem" }}>👎</button>
            {feedbackGiven && <span style={{ color: "#4ade80", fontSize: "0.9rem", fontWeight: "500" }}>Feedback recorded. Thank you!</span>}
          </div>

          <button 
            onClick={resetHome}
            style={{ width: "100%", marginTop: "40px", padding: "16px", backgroundColor: "transparent", color: "#f8fafc", border: "1px solid #64748b", borderRadius: "8px", cursor: "pointer", fontSize: "1.1rem", fontWeight: "bold" }}
          >
            Start New Search
          </button>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </main>
  );
}