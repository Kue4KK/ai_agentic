import joblib
import requests
import json
import re

model = joblib.load("model.pkl")

OLLAMA_URL = "http://localhost:11434/api/generate"

def analyze(sensor):

    # -----------------------------
    # 1. ML Prediction
    # -----------------------------
    data = [[
        sensor["air_temperature"],
        sensor["process_temperature"],
        sensor["rotational_speed"],
        sensor["torque"],
        sensor["tool_wear"]
    ]]

    pred = model.predict(data)[0]
    ml_decision = True if pred == 1 else False


    # -----------------------------
    # 2. RULE DETECTION (Ground Truth)
    # -----------------------------
    temp_diff = abs(sensor["process_temperature"] - sensor["air_temperature"])
    triggered_rules = []

    if sensor["torque"] > 60:
        triggered_rules.append("Torque > 60")

    if sensor["tool_wear"] > 200:
        triggered_rules.append("Tool Wear > 200")

    if sensor["rotational_speed"] < 1000:
        triggered_rules.append("Speed < 1000")

    if temp_diff > 25:
        triggered_rules.append("Temp Diff > 25")


    # -----------------------------
    # 3. Prompt Control (กัน LLM มโน)
    # -----------------------------
    if not triggered_rules:
        status_instruction = """
        SYSTEM STATUS: SAFE
        - ALL values are within normal limits.
        - You MUST say: "All parameters are within normal operating limits."
        - risk_level MUST be "low"
        - DO NOT mention any risk or failure
        """
    else:
        status_instruction = f"""
        SYSTEM STATUS: RISK DETECTED
        - Triggered rules: {triggered_rules}
        - Explain ONLY these triggered rules
        - DO NOT mention any other parameters
        """


    prompt = f"""
You are an industrial maintenance engineer.

Sensor data:
{sensor}

{status_instruction}

STRICT RULES:
- Use ONLY given sensor values
- DO NOT assume anything
- DO NOT add new values
- Keep answer VERY short (max 15 words)
- Output MUST be JSON ONLY

Return format:
{{
  "reason": "...",
  "risk_level": "low/medium/high"
}}
"""

    # -----------------------------
    # 4. Call LLM
    # -----------------------------
    try:
        res = requests.post(OLLAMA_URL, json={
            "model": "llama3:latest",
            "prompt": prompt,
            "format": "json",
            "stream": False,
            "options": {
                "temperature": 0.1
            }
        })

        raw_output = res.json()["response"]

    except:
        raw_output = '{"reason":"LLM error","risk_level":"unknown"}'


    # -----------------------------
    # 5. Parse JSON
    # -----------------------------
    match = re.search(r"\{.*\}", raw_output, re.DOTALL)
    json_str = match.group(0) if match else raw_output

    try:
        parsed = json.loads(json_str)
    except:
        parsed = {
            "reason": "Parse error",
            "risk_level": "unknown"
        }


    # -----------------------------
    # 6. HARD VALIDATION (🔥 สำคัญมาก)
    # -----------------------------
    reason = parsed.get("reason", "").lower()

    # ❌ ถ้า SAFE แต่ LLM มโน → FIX
    if not triggered_rules:
        if any(word in reason for word in ["torque", "wear", "speed", "temperature"]):
            parsed["reason"] = "All parameters are within normal operating limits."
            parsed["risk_level"] = "low"

    # ❌ ถ้ามี RULE แต่ LLM ไม่พูดถึง → FIX
    else:
        valid = any(rule.lower().split()[0] in reason for rule in triggered_rules)

        if not valid:
            parsed["reason"] = f"Triggered: {', '.join(triggered_rules)}"
            parsed["risk_level"] = "high"


    # -----------------------------
    # 7. FINAL DECISION (🔥 ไม่ใช้ LLM ตัดสิน)
    # -----------------------------
    # ใช้ RULE + ML combine
    if triggered_rules:
        final_decision = True
    else:
        final_decision = ml_decision


    return {
        "should_repair": final_decision,
        "reason": parsed["reason"],
        "risk_level": parsed["risk_level"],
        "triggered_rules": triggered_rules   # 🔥 สำคัญมาก (ให้ AI2 ใช้)
    }