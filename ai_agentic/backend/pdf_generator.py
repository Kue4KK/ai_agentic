from fileinput import filename
import os
import datetime
import requests
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from models import SensorData

OLLAMA_URL = "http://localhost:11434/api/generate"

def generate_report_text(data):
    # 1. เช็ค Logic เดียวกับที่ใช้ตัดสินใจใน PDF 
    ai1_repair = data.get("ai1", {}).get("should_repair", False)
    ai2_repair = data.get("ai2", {}).get("final_decision", False)
    rule_trig = data.get("rule", False)
    
    # สรุปสถานะเพื่อเลือก Prompt
    is_repair = (ai1_repair and ai2_repair) or rule_trig
    status_text = "REQUIRED MAINTENANCE" if is_repair else "NORMALLY OPERATING"

    # 2. สร้าง Prompt แยกตามสถานะ
    if not is_repair:
        # Prompt สำหรับกรณีปกติ (ป้องกัน AI มโนว่าพัง)
        instruction = """
        REPORT STATUS: SYSTEM NORMAL
        - Confirm that all sensor readings are within safe operational limits.
        - DO NOT suggest any repairs or find any risks.
        - State that current maintenance schedule is sufficient.
        - Explain why a 9.7K temperature difference is healthy (it's below the 25K limit).
        """
    else:
        # Prompt สำหรับกรณีต้องซ่อม
        instruction = f"""
        REPORT STATUS: MAINTENANCE REQUIRED
        - Explain the specific risks found: {data.get('rule_reasons')}.
        - Detail why these values exceed the safety thresholds.
        - Provide urgent corrective actions.
        """

    prompt = f"""
    You are a Senior Maintenance Engineer. 
    Write a professional report for a system that is {status_text}.

    SENSOR DATA: {data['sensor']}
    AI AGENT COMMENTS: {data['ai1'].get('reason')}, {data['ai2'].get('reason')}

    {instruction}

    ### MANDATORY FORMAT:
    Summary: (Brief overview of the {status_text} status)
    Analysis: (Technical explanation of sensor values)
    Validation: (Compare values against thresholds: Torque > 60, Tool Wear > 200, Temp Diff > 25)
    Recommendation: (3 action items suitable for {status_text} status)

    ### RULES:
    - Do NOT use markdown bold (e.g., no **Summary:**).
    - Start each section with the header name exactly as shown above.
    - Be concise and professional.
    - Do NOT include any introductory or concluding remarks.
    """
    
    try:
        # เพิ่ม timeout เป็น 120 วินาที ป้องกันการตัดการเชื่อมต่อ
        res = requests.post(OLLAMA_URL, json={
            "model": "llama3", 
            "prompt": prompt,
            "stream": False,
            "options": {
                "num_predict": 800, # จำกัดความยาวไม่ให้เวิ่นเว้อ
                "temperature": 0.1  # ปรับให้ AI ตอบแบบตรงไปตรงมา ไม่เพ้อฝัน
            }
        }, timeout=120)
        return res.json().get("response", "Error: No response from AI.")
    except Exception as e:
        return f"Summary: System Error\nAnalysis: {str(e)}\nValidation: Failed\nRecommendation: Check Ollama connection."

def create_pdf(data_input):
    # --- 1. เตรียมข้อมูลพื้นฐาน (เหมือนเดิม) ---
    os.makedirs("reports", exist_ok=True)
    machine_name = data_input.get("machine_name", "Unknown").replace(" ", "_")
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")

    filename = f"{machine_name}_{timestamp}.pdf"
    filepath = os.path.join("reports", filename)
    doc = SimpleDocTemplate(filepath, pagesize=A4)
    styles = getSampleStyleSheet()
    
    # --- Custom Styles ---
    title_style = ParagraphStyle('TitleStyle', parent=styles['Title'], fontSize=18, textColor=colors.HexColor("#1A374D"), spaceAfter=20)
    section_style = ParagraphStyle('SectionStyle', parent=styles['Heading2'], fontSize=12, textColor=colors.HexColor("#406882"), spaceBefore=10, spaceAfter=5)
    header_style = ParagraphStyle('HeaderStyle', parent=styles['Normal'], fontSize=10, fontName='Helvetica-Bold', textColor=colors.HexColor("#2E5077"))
    normal_style = styles['Normal']
    
    content = []

    # --- 2. ตัดสินใจ (Decision Logic) ใหม่ตามเงื่อนไขของคุณ ---
    ai1_decision = data_input.get("ai1", {}).get("should_repair", False) if isinstance(data_input.get("ai1"), dict) else False
    ai2_decision = data_input.get("ai2", {}).get("final_decision", False) if isinstance(data_input.get("ai2"), dict) else False
    rule_triggered = data_input.get("rule", False)

    # เงื่อนไข: Required Maintenance เมื่อ AI ทั้งคู่เห็นตรงกัน หรือ Rule-based เจอความผิดปกติ
    if (ai1_decision and ai2_decision) or rule_triggered:
        final_status = "REQUIRED MAINTENANCE"
        status_color = "red"
    else:
        final_status = "NORMALLY"
        status_color = "green"

    # --- 3. ส่วนเนื้อหา PDF (ไล่ตามลำดับที่คุณจัดไว้) ---
    raw_ai_text = generate_report_text(data_input)
    clean_text = raw_ai_text.replace("**", "").replace("###", "")

    # Header
    content.append(Paragraph("Intelligent AI Maintenance Analysis Report", title_style))
    machine_name = data_input.get("machine_name", "Unknown")
    content.append(Paragraph(f"<b>Machine:</b> {machine_name}", normal_style))
    content.append(Paragraph(f"<b>Date:</b> {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", normal_style))
    content.append(Spacer(1, 20))

    # Section 1: Sensor Table
    content.append(Paragraph("1. Technical Sensor Data", section_style))
    s = data_input.get("sensor", {})
    sensor_table_data = [
        ["Parameter", "Measured Value"],
        ["Air Temperature", f"{s.get('air_temperature')} °K"],
        ["Process Temperature", f"{s.get('process_temperature')} °K"],
        ["Rotational Speed", f"{s.get('rotational_speed')} RPM"],
        ["Torque", f"{s.get('torque')} Nm"],
        ["Tool Wear", f"{s.get('tool_wear')} min"]
    ]
    table = Table(sensor_table_data, colWidths=[180, 150])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#D1E8E4")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ]))
    content.append(table)

    # Section 2: AI Agents (AI1 & AI2)
    content.append(Paragraph("2. AI Agent Analysis", section_style))
    ai1_reason = data_input.get("ai1", {}).get("reason", data_input.get("ai1")) if isinstance(data_input.get("ai1"), dict) else data_input.get("ai1")
    content.append(Paragraph("<b>Agent 1 (Initial Analysis):</b>", normal_style))
    content.append(Paragraph(str(ai1_reason), normal_style))
    content.append(Spacer(1, 8))

    ai2_reason = data_input.get("ai2", {}).get("reason", data_input.get("ai2")) if isinstance(data_input.get("ai2"), dict) else data_input.get("ai2")
    content.append(Paragraph("<b>Agent 2 (Verification):</b>", normal_style))
    content.append(Paragraph(str(ai2_reason), normal_style))

    # Section 3: AI Generated Report (Summary, Analysis...)
    content.append(Paragraph("3. Engineering Analysis & Recommendations", section_style))
    lines = clean_text.split("\n")
    headers_to_bold = ["Summary:", "Analysis:", "Validation:", "Recommendation:"]

    for line in lines:
        line = line.strip()
        if not line:
            continue

        current_header = next((h for h in headers_to_bold if line.startswith(h)), None)

        if current_header:
            header_part = current_header
            body_part = line[len(current_header):].strip()

            # ✅ ต้องอยู่ใน if นี้เท่านั้น
            if body_part:
                body_part = body_part.lower().capitalize()

            content.append(Spacer(1, 8))
            content.append(Paragraph(f"<b>{header_part}</b>", header_style))

            if body_part:
                content.append(Paragraph(body_part, normal_style))

        else:
            # ✅ เคสไม่มี header ใช้ line แทน
            line = line.lower().capitalize()
            content.append(Paragraph(line, normal_style))

    # Section 4: Final Conclusion (ส่วนที่คุณต้องการแก้ไข)
    content.append(PageBreak())
    content.append(Paragraph("4. Conclusion", section_style))
    source = data_input.get("decision_source", "N/A").upper()
    
    # แสดงผลตาม Logic ที่คำนวณไว้ข้างบน
    content.append(Paragraph(f"<b>Final Decision:</b> <font color='{status_color}'>{final_status}</font>", normal_style))
    content.append(Paragraph(f"<b>Decision Source:</b> {source}", normal_style))

    # Hallucination Check
    all_errors = data_input.get("ai1_errors", []) + data_input.get("ai2_errors", [])
    if all_errors:
        err_text = ", ".join(all_errors)
        content.append(Paragraph(f"<font color='red'><b>Hallucination Detected:</b> {err_text}</font>", normal_style))

    content.append(Spacer(1, 10))
    content.append(Paragraph("5. Trust Evaluation", section_style))

    trust_score = data_input.get("trust_score", 0)
    trust_level = data_input.get("trust_level", "UNKNOWN")

    content.append(Paragraph(f"<b>Trust Score:</b> {trust_score} %", normal_style))
    content.append(Paragraph(f"<b>Trust Level:</b> {trust_level}", normal_style))

    # บันทึกไฟล์
    try:
        doc.build(content)
        return filepath
    except Exception as e:
        print(f"Error building PDF: {e}")
        return None