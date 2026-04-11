import { useState, useEffect } from "react";
import "./Analyze_machine.css";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function AnalyzeMachine() {
  const navigate = useNavigate();
  const [sensor, setSensor] = useState({});
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/machines/${id}`)
      .then(res => res.json())
      .then(data => {
        setSensor(data.sensors?.[0] || {});
      });
  }, [id]);

  const runSteps = async () => {
    setStep("📡 Fetching Real-time Data...");
    await new Promise(r => setTimeout(r, 800));
    setStep("🤖 Agent 1: Performing Deep Analysis...");
    await new Promise(r => setTimeout(r, 800));
    setStep("🛡️ Agent 2: Cross-verifying Findings...");
    await new Promise(r => setTimeout(r, 800));
    setStep("⚖️ Finalizing Rule-Based Logic...");
    await new Promise(r => setTimeout(r, 800));
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);
    await runSteps();

    try {
      const res = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          machine_id: Number(id),
          air_temperature: sensor.air_temperature,
          process_temperature: sensor.process_temperature,
          rotational_speed: sensor.rotational_speed,
          torque: sensor.torque,
          tool_wear: sensor.tool_wear
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Error connecting to backend");
    }
    setLoading(false);
    setStep("");
  };

  return (
    <div className="analyze-wrapper">
      <div className="analyze-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Back to Dashboard</span>
        </button>
        
        <header className="analyze-header">
          <h1>Industrial AI Intelligence</h1>
          <p>Machine Name: <span className="highlight">{name}</span> Analysis Portal</p>
        </header>

        {/* 📊 SENSOR DATA CARD */}
        <div className="sensor-card">
          <div className="card-header">
            <h3>📊 Live Sensor Readings</h3>
            <span className="live-tag">LIVE</span>
          </div>
          <div className="sensor-grid">
            <div className="sensor-item"><span>Air Temp</span><strong>{sensor.air_temperature} K</strong></div>
            <div className="sensor-item"><span>Process Temp</span><strong>{sensor.process_temperature} K</strong></div>
            <div className="sensor-item"><span>Rotational Speed</span><strong>{sensor.rotational_speed} RPM</strong></div>
            <div className="sensor-item"><span>Torque</span><strong>{sensor.torque} Nm</strong></div>
            <div className="sensor-item"><span>Tool Wear</span><strong>{sensor.tool_wear} min</strong></div>
          </div>
        </div>

        {/* 🔍 ACTION BUTTON */}
        {!loading && !result && (
          <button className="analyze-btn" onClick={handleAnalyze}>
             Run System Diagnosis
          </button>
        )}

        {/* ⏳ LOADING STATE */}
        {loading && (
          <div className="loading-box">
            <div className="spinner"></div>
            <p className="loading-text">AI Diagnostic in Progress...</p>
            <p className="step-text">{step}</p>
          </div>
        )}

        {/* 🚨 RESULT SECTION */}
        {result && (
          <div className="result-section animation-fadeIn">
            <div className={`decision-banner ${result.decision ? 'need-repair' : 'normal'}`}>
              <div className="decision-content">
                <label>Final System Decision</label>
                <h2>{result.decision ? "MAINTENANCE REQUIRED" : "SYSTEM OPERATING NORMALLY"}</h2>
                <span className="source-tag">Source: {result.decision_source}</span>
              </div>
            </div>

            <div className="agent-grid">
              <div className="agent-card">
                <h4>🤖 Agent 1 Analysis</h4>
                <p className="risk-badge" data-risk={result.ai1?.risk_level}>{result.ai1?.risk_level} Risk</p>
                <p className="reason-text">{result.ai1?.reason}</p>
              </div>

              <div className="agent-card">
                <h4>🛡️ Agent 2 Verification</h4>
                <p className="conf-text">Confidence: <strong>{result.ai2?.confidence}%</strong></p>
                <p className="reason-text">{result.ai2?.reason}</p>
              </div>
            </div>

            <div className="logic-row">
                <div className="logic-box">
                    <h4>🧠 Rule-Based Logic</h4>
                    <p>{result.rule_triggered ? result.rule_reasons.join(" • ") : "All Safety Rules Passed"}</p>
                </div>
                {result.pdf_url && (
                    <button className="download-btn" onClick={() => window.open(result.pdf_url)}>
                        📄 Export Technical Report
                    </button>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}