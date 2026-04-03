import requests
import json
import re 
from pydantic import BaseModel, ValidationError

OLLAMA_URL = "http://localhost:11434/api/generate"

class AI2Response(BaseModel):
    agree: bool
    final_decision: bool
    confidence: int
    reason: str

def validate(sensor, ai1):
    # 1. เช็คความผิดปกติเบื้องต้นด้วย Python (เพื่อกำหนดทิศทาง Prompt)
    temp_diff = abs(sensor["process_temperature"] - sensor["air_temperature"])
    is_actually_safe = (
        sensor["torque"] <= 60 and 
        sensor["tool_wear"] <= 200 and 
        sensor["rotational_speed"] >= 1000 and 
        temp_diff <= 25
    )

    # 2. สร้าง Instruction แยกตามสถานะจริง
    if is_actually_safe:
        status_instruction = """
        SYSTEM STATUS: NORMALLY OPERATING (ALL SENSORS WITHIN LIMITS).
        - Your task is to confirm AI1's analysis is incorrect if it suggests repair.
        - Set final_decision = false.
        - Reason should state that all parameters (Torque, Wear, Speed, Temp) are safe.
        - If AI1 says "high risk", you MUST set agree = false.
        """
    else:
        status_instruction = """
        SYSTEM STATUS: RISK DETECTED (SOME SENSORS EXCEED LIMITS).
        - Verify if AI1 correctly identified the triggered rules.
        - If any rule (Torque > 60, Wear > 200, etc.) is met, final_decision MUST be true.
        """

    # 3. รวมเข้ากับ Prompt หลัก
    prompt = f"""
You are a Strict Senior Auditor. 
Your only job is to compare SENSOR DATA against OFFICIAL RULES and verify if AI1 is hallucinating.

SENSOR DATA (FACTS):
- Torque: {sensor['torque']} Nm
- Tool Wear: {sensor['tool_wear']} min
- Rotational Speed: {sensor['rotational_speed']} rpm
- Temp Difference: {temp_diff} K

AI1 ANALYSIS:
{ai1}

{status_instruction}

OFFICIAL RULES:
- Torque > 60 -> HIGH RISK
- Tool wear > 200 -> HIGH RISK
- Speed < 1000 -> MEDIUM RISK
- Temp difference > 25 -> ABNORMAL

STRICT OUTPUT FORMAT:
- Output MUST be valid JSON ONLY.
- "agree": compare your final_decision with AI1['should_repair'].
- "reason": max 20 words.

Return ONLY:
{{
  "agree": true/false,
  "final_decision": true/false,
  "confidence": 0-100,
  "reason": "..."
}}
"""

    for _ in range(2):

        res = requests.post(OLLAMA_URL, json={
            "model": "qwen3:latest",
            "prompt": prompt,
            "stream": False,
            "format": "json"
        })

        raw = res.json()["response"]
        print("RAW:", raw)  # 🔥 debug

        match = re.search(r"\{.*\}", raw, re.DOTALL)
        json_str = match.group(0) if match else raw

        try:
            data = json.loads(json_str)
            return AI2Response(**data).dict()

        except (json.JSONDecodeError, ValidationError):
            continue

    # 🔥 fallback
    return {
        "agree": False,
        "final_decision": ai1["should_repair"],
        "confidence": 40,
        "reason": "LLM format error"
    }