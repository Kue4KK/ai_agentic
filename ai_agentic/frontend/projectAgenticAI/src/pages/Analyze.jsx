import { useState } from "react";
import "./Analyze_manual.css"; // แยกไฟล์ CSS เพื่อความเป็นระเบียบ

export default function Analyze() {
  const [form, setForm] = useState({
    air_temperature: "",
    process_temperature: "",
    rotational_speed: "",
    torque: "",
    tool_wear: ""
  });

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const runSteps = async () => {
    setStep("📡 Initializing AI Agents...");
    await new Promise(r => setTimeout(r, 700));
    setStep("🤖 Agent 1: Predictive Modeling...");
    await new Promise(r => setTimeout(r, 700));
    setStep("🛡️ Agent 2: Safety Verification...");
    await new Promise(r => setTimeout(r, 700));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    await runSteps();

    try {
      const res = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          air_temperature: Number(form.air_temperature),
          process_temperature: Number(form.process_temperature),
          rotational_speed: Number(form.rotational_speed),
          torque: Number(form.torque),
          tool_wear: Number(form.tool_wear)
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
    <div className="manual-analyze-wrapper">
      <div className="manual-analyze-container">
        
        <header className="manual-header">
          <h1>🤖 AI Maintenance Analyzer</h1>
          <p>Manual Diagnostic Input System</p>
        </header>

        {/* FORM SECTION */}
        <div className="form-card">
          <form onSubmit={handleSubmit} className="manual-form">
            <div className="form-grid">
              {[
                { label: "Air Temperature (K)", name: "air_temperature" },
                { label: "Process Temperature (K)", name: "process_temperature" },
                { label: "Rotational Speed (RPM)", name: "rotational_speed" },
                { label: "Torque (Nm)", name: "torque" },
                { label: "Tool Wear (min)", name: "tool_wear" }
              ].map((field) => (
                <div key={field.name} className="input-group">
                  <label>{field.label}</label>
                  <input
                    type="number"
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder="Enter value..."
                    required
                  />
                </div>
              ))}
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Processing..." : "🔍 Start AI Diagnostic"}
            </button>
          </form>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p className="loading-text">{step}</p>
          </div>
        )}

        {/* RESULT SECTION */}
        {result && (
          <div className="result-container animation-fadeIn">
            <div className={`decision-card ${result.decision ? 'danger' : 'success'}`}>
              <h2>Final Decision: {result.decision ? "NEED MAINTENANCE" : "SYSTEM STABLE"}</h2>
              <p className="source-text">Logic Source: {result.decision_source}</p>
            </div>

            <div className="agent-results">
              <div className="agent-box">
                <h4>🤖 Agent 1 (LLM)</h4>
                <p><strong>Risk:</strong> {result.ai1?.risk_level}</p>
                <p className="reasoning">{result.ai1?.reason}</p>
              </div>

              <div className="agent-box">
                <h4>🛡️ Agent 2 (Validator)</h4>
                <p><strong>Confidence:</strong> {result.ai2?.confidence}%</p>
                <p className="reasoning">{result.ai2?.reason}</p>
              </div>
            </div>

            <div className="rule-box">
                <p><strong>🧠 Rule-Based System:</strong> {result.rule_triggered ? result.rule_reasons.join(", ") : "Normal"}</p>
                {result.pdf_url && (
                    <button className="pdf-btn" onClick={() => window.open(result.pdf_url)}>
                        📄 Download Technical Report
                    </button>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}