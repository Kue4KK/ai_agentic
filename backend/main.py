from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from ai_agent_analyze import analyze
from ai_agent_verify import validate
from pdf_generator import create_pdf

app = FastAPI()

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ serve PDF
app.mount("/reports", StaticFiles(directory="reports"), name="reports")

# -----------------------------
# 📦 Input Model
# -----------------------------
class Sensor(BaseModel):
    air_temperature: float
    process_temperature: float
    rotational_speed: int
    torque: float
    tool_wear: int


# -----------------------------
# 🧠 Rule-Based System
# -----------------------------
def rule_based(sensor):
    reasons = []

    if sensor["torque"] > 60:
        reasons.append("high torque")

    if sensor["tool_wear"] > 200:
        reasons.append("tool wear high")

    if sensor["rotational_speed"] < 1000:
        reasons.append("low speed")

    if abs(sensor["process_temperature"] - sensor["air_temperature"]) > 25:
        reasons.append("temperature abnormal")

    return len(reasons) > 0, reasons


# -----------------------------
# 🚨 Hallucination Detector
# -----------------------------
def detect_hallucination(sensor, text):

    text = str(text).lower()
    errors = []

    temp_diff = abs(sensor["process_temperature"] - sensor["air_temperature"])
    if "temperature difference" in text and temp_diff <= 25:
        errors.append("fake_temp_diff")

    if "tool wear" in text and sensor["tool_wear"] <= 200:
        errors.append("fake_tool_wear")

    if "torque" in text and sensor["torque"] <= 60:
        errors.append("fake_torque")

    if "low speed" in text and sensor["rotational_speed"] >= 1000:
        errors.append("fake_low_speed")

    return errors


# -----------------------------
# 🚀 Root
# -----------------------------
@app.get("/")
def root():
    return {"message": "AI Maintenance API Running 🚀"}


# -----------------------------
# 🔍 Analyze Endpoint
# -----------------------------
@app.post("/analyze")
def run(sensor: Sensor):

    s = sensor.dict()

    # 🤖 AI1
    ai1 = analyze(s)

    # 🧠 AI2
    ai2 = validate(s, ai1)

    # 🔥 RULE ENGINE
    rule, rule_reasons = rule_based(s)

    # 🔥 กัน AI2 พัง
    ai2_decision = ai2.get("final_decision", ai1.get("should_repair", False))

    # -----------------------------
    # 🚨 Detect AI Hallucination
    # -----------------------------
    ai1_errors = detect_hallucination(s, ai1.get("reason", ""))
    ai2_errors = detect_hallucination(s, ai2.get("reason", ""))


    # -----------------------------
    # 🏆 FINAL DECISION (RULE FIRST)
    # -----------------------------
    if (ai1.get("should_repair") and ai2_decision) or rule:
        decision = True
        if rule:
            decision_source = "Rule-Based System Triggered"
        else:
            decision_source = "Agent 1 & Agent 2 Consensus"
    else:
        decision = False
        decision_source = "System Analysis is Normal"

    # -----------------------------
    # 📄 Generate PDF
    # -----------------------------
    pdf = create_pdf({
        "sensor": s,
        "ai1": ai1,
        "ai2": ai2,
        "rule": rule,
        "rule_reasons": rule_reasons,
        "decision": decision,
        "decision_source": decision_source,
        "ai1_errors": ai1_errors,
        "ai2_errors": ai2_errors
    })

    # -----------------------------
    # 🧾 Response
    # -----------------------------
    return {
        "ai1": ai1,
        "ai2": ai2,
        "rule_triggered": rule,
        "rule_reasons": rule_reasons,
        "decision": decision,
        "decision_source": decision_source,
        "ai1_errors": ai1_errors,
        "ai2_errors": ai2_errors,
        "pdf": pdf.replace("reports/", "") if pdf else None
    }