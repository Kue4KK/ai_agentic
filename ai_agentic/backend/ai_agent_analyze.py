import joblib
import requests
import json
import re

model = joblib.load("model.pkl")

OLLAMA_URL = "http://localhost:11434/api/generate"

def analyze(sensor):

    data = [[
        sensor["air_temperature"],
        sensor["process_temperature"],
        sensor["rotational_speed"],
        sensor["torque"],
        sensor["tool_wear"]
    ]]

    pred = model.predict(data)[0]
    decision = True if pred == 1 else False

    # 2. เช็คเงื่อนไข Rule-based เบื้องต้นใน Python
    temp_diff = abs(sensor["process_temperature"] - sensor["air_temperature"])
    is_actually_safe = (
        sensor["torque"] <= 60 and 
        sensor["tool_wear"] <= 200 and 
        sensor["rotational_speed"] >= 1000 and 
        temp_diff <= 25
    )

    # 3. เลือก Instruction ตามสถานะจริง (ป้องกัน AI มโน)
    if is_actually_safe:
        status_instruction = """
        SYSTEM STATUS: NORMALLY OPERATING (SAFE).
        - ALL sensor values are within normal operating ranges.
        - Your reason MUST be: "All parameters are within normal operating limits."
        - Set risk_level to "low".
        - DO NOT mention any risks or failures.
        """
    else:
        status_instruction = """
        SYSTEM STATUS: POTENTIAL RISK DETECTED.
        - Identify which rule is triggered (Torque > 60, Wear > 200, Speed < 1000, or Temp Diff > 25).
        - Explain the specific risk found in the data.
        """

    # 🔥 Prompt ที่ “ไม่มั่ว”
    prompt = f"""
You are an industrial maintenance engineer.

Sensor data:
{sensor}

{status_instruction}

STRICT GUIDELINES:
1. If Torque is <= 60 Nm, it is NORMAL. Do NOT mention torque in your reason.
2. If Tool Wear is <= 200 min, it is NORMAL. Do NOT mention tool wear.
3. If no rules are triggered, your reason must be: "All parameters are within normal operating limits."

Rules:
- Torque > 60 → high risk
- Tool wear > 200 → high risk
- Speed < 1000 → medium risk
- Temp difference > 25 → abnormal

CRITICAL:
- Use ONLY the given sensor values
- DO NOT assume or invent any values
- DO NOT mention any rule that is NOT triggered
- Keep explanation VERY short (max 15 words)
- Output MUST be valid JSON ONLY
- No text outside JSON

Task:
1. Check which rules are triggered. If no rules are triggered, say "System operating within normal parameters".
2. Decide risk level
Return ONLY valid JSON:
{{
  "reason": "...",
  "risk_level": "low/medium/high"
}}
"""

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

    match = re.search(r"\{.*\}", raw_output, re.DOTALL)
    json_str = match.group(0) if match else raw_output

    # 🔥 กันพัง: parse JSON
    try:
        parsed = json.loads(json_str)
    except:
        parsed = {
            "reason": raw_output,
            "risk_level": "unknown"
        }

    return {
        "should_repair": decision,
        "reason": parsed["reason"],
        "risk_level": parsed["risk_level"]
    }