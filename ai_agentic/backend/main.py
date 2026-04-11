from fastapi import FastAPI, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import text

from database import SessionLocal
from models import Machine
from schemas import MachineSchema

from ai_agent_analyze import analyze
from ai_agent_verify import validate
from pdf_generator import create_pdf

app = FastAPI()

# -----------------------------
#  CORS
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
#  serve PDF
# -----------------------------
app.mount("/reports", StaticFiles(directory="reports"), name="reports")

# -----------------------------
#  Input Model
# -----------------------------
class Sensor(BaseModel):
    machine_id: int   # 🔥 สำคัญมาก
    air_temperature: float
    process_temperature: float
    rotational_speed: int
    torque: float
    tool_wear: int


# -----------------------------
#  Rule-Based System
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
#  Hallucination Detector
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
#  DB Dependency
# -----------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -----------------------------
#  Root
# -----------------------------
@app.get("/")
def root():
    return {"message": "AI Maintenance API Running 🚀"}


# -----------------------------
#  ANALYZE 
# -----------------------------
@app.post("/api/analyze")
def run(sensor: Sensor):

    s = sensor.dict()

    # 🤖 AI1
    ai1 = analyze(s) or {}

    # 🧠 AI2
    ai2 = validate(s, ai1) or {}

    # 🔥 RULE ENGINE
    rule, rule_reasons = rule_based(s)

    ai2_decision = ai2.get("final_decision", ai1.get("should_repair", False))

    # 🚨 Hallucination check
    ai1_errors = detect_hallucination(s, ai1.get("reason", ""))
    ai2_errors = detect_hallucination(s, ai2.get("reason", ""))

    # 🏆 FINAL DECISION
    if (ai1.get("should_repair") and ai2_decision) or rule:
        decision = True
        decision_source = (
            "Rule-Based System Triggered" if rule
            else "Agent 1 & Agent 2 Consensus"
        )
    else:
        decision = False
        decision_source = "System Analysis is Normal"

    # 📄 PDF
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
    #  SAVE RESULT (🔥 ใหม่)
    # ----------------------------
    db = SessionLocal()

    db.execute(text("""
        INSERT INTO analysis_results
        (machine_id, decision, decision_source, ai1_reason, ai2_reason, risk_level)
        VALUES (:machine_id, :decision, :decision_source, :ai1_reason, :ai2_reason, :risk_level)
    """), {
        "machine_id": s.get("machine_id"),
        "decision": decision,
        "decision_source": decision_source,
        "ai1_reason": ai1.get("reason"),
        "ai2_reason": ai2.get("reason"),
        "risk_level": ai1.get("risk_level", "unknown")
    })

    db.commit()
    db.close()

    # -----------------------------
    #  RESPONSE
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
        "pdf_url": f"http://localhost:8000/{pdf.replace('\\', '/')}" if pdf else None
    }


# -----------------------------
#  MACHINE API
# -----------------------------
@app.get("/api/machines", response_model=list[MachineSchema])
def get_machines(db: Session = Depends(get_db)):
    return db.query(Machine).all()


@app.get("/api/machines/{machine_id}", response_model=MachineSchema)
def get_machine(machine_id: int, db: Session = Depends(get_db)):
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        return {"error": "Machine not found"}
    return machine



# -----------------------------
#  TASK API
# -----------------------------
@app.get("/api/tasks")
def get_tasks():
    db = SessionLocal()

    tasks = db.execute(text("""
        SELECT 
            ar.id,
            ar.machine_id,
            m.name AS machine_name,
            ar.decision,
            ar.decision_source,
            ar.ai1_reason,
            ar.ai2_reason,
            ar.risk_level,
            ar.created_at
        FROM analysis_results ar
        JOIN machines m ON ar.machine_id = m.id
        WHERE ar.decision = 1 OR ar.decision = 0
        ORDER BY ar.created_at DESC
    """)).fetchall()

    db.close()

    return [dict(r._mapping) for r in tasks]

@app.delete("/api/tasks/{machine_id}")
def delete_task(machine_id: int):
    db = SessionLocal()

    db.execute(text("""
        DELETE FROM analysis_results
        WHERE machine_id = :machine_id
    """), {"machine_id": machine_id})

    db.commit()
    db.close()

    return {"message": "Task deleted"}

# -----------------------------
#   Accept Task API
# -----------------------------
class MaintenanceInput(BaseModel):
    machine_id: int
    engineer_name: str
    issue: str
    repair: str
    date: str

@app.post("/api/maintenance-accept")
def save_history(data: MaintenanceInput):
    db = SessionLocal()

    db.execute(text("""
        INSERT INTO maintenance_history
        (machine_id, engineer_name, issue, repair, date)
        VALUES (:machine_id, :engineer_name, :issue, :repair, :date)
    """), data.dict())

    db.execute(text("""
        DELETE FROM analysis_results
        WHERE machine_id = :machine_id
    """), {"machine_id": data.machine_id})

    db.commit()
    db.close()

    return {"message": "Saved + Task removed successfully"}

# -----------------------------
#   HISTORY API
# -----------------------------
@app.get("/api/maintenance-history")
def get_history():
    db = SessionLocal()

    rows = db.execute(text("""
        SELECT 
            mh.id,
            mh.machine_id,
            m.name AS machine_name,
            mh.engineer_name,
            mh.issue,
            mh.repair,
            mh.date
        FROM maintenance_history mh
        JOIN machines m ON mh.machine_id = m.id
        ORDER BY mh.id DESC
    """)).fetchall()
    db.close()

    return [dict(r._mapping) for r in rows]

# -----------------------------
#   OVERVIEW API
# -----------------------------

@app.get("/api/dashboard")
def machine_dashboard():
    db = SessionLocal()

    rows = db.execute(text("""
        SELECT 
            m.id,
            m.name,

            -- sensor ล่าสุด
            s.air_temperature,
            s.process_temperature,
            s.rotational_speed,
            s.torque,
            s.tool_wear,

            -- analysis ล่าสุด
            a.decision,
            a.decision_source,
            a.risk_level,

            -- maintenance ล่าสุด
            mh.issue,
            mh.repair,
            mh.date,
            mh.engineer_name

        FROM machines m

        -- 🔥 sensor ล่าสุด
        LEFT JOIN sensor_data s 
            ON s.id = (
                SELECT id FROM sensor_data 
                WHERE machine_id = m.id 
                ORDER BY id DESC LIMIT 1
            )

        -- 🔥 analysis ล่าสุด
        LEFT JOIN analysis_results a 
            ON a.id = (
                SELECT id FROM analysis_results 
                WHERE machine_id = m.id 
                ORDER BY id DESC LIMIT 1
            )

        -- 🔥 maintenance ล่าสุด
        LEFT JOIN maintenance_history mh 
            ON mh.id = (
                SELECT id FROM maintenance_history 
                WHERE machine_id = m.id 
                ORDER BY id DESC LIMIT 1
            )

        ORDER BY m.id
    """)).fetchall()

    db.close()

    return [dict(r._mapping) for r in rows]