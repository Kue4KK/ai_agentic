import './MachineData.css';
import { useEffect, useState } from 'react';

function MachineData() {
  const [machines, setMachines] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/dashboard")
      .then(res => res.json())
      .then(res => setMachines(res));
  }, []);

  return (
    <div className="machine-data-layout">
      <main className="machine-data-content">
        
        {/* --- Header ตามสไตล์ต้นฉบับ --- */}
        <header className="data-header-section">
          <h1>Overview</h1>
          <p>Real-time sensor data and latest maintenance records</p>
        </header>

        {machines.map((item) => (
          <div key={item.id} className="data-grid">
            
            {/* --- ⬅️ คอลัมน์ซ้าย: รูปภาพและสถานะปัจจุบัน --- */}
            <div className="left-column">
              <div className="machine-image-box">
                {/* ถ้ามีรูปใช้ <img src={item.image} /> ถ้าไม่มีจะเป็นเส้นประตาม CSS */}
                <h2>{item.name}</h2>
              </div>

              <div className="machine-status-card">
                <div className="status-item">
                  <span>Air Temp:</span> 
                  <strong>{item.air_temperature || "0"} °K</strong>
                </div>
                <div className="status-item">
                  <span>Process Temp:</span> 
                  <strong>{item.process_temperature || "0"} °K</strong>
                </div>
                <div className="status-item">
                  <span>Speed:</span> 
                  <strong>{item.rotational_speed || "0"} RPM</strong>
                </div>
                <div className="status-item">
                  <span>Torque:</span> 
                  <strong>{item.torque || "0"} Nm</strong>
                </div>
                <div className="status-item">
                  <span>Tool Wear:</span> 
                  <strong>{item.tool_wear || "0"} min</strong>
                </div>
              </div>
            </div>

            {/* --- ➡️ คอลัมน์ขวา: ประวัติการซ่อมล่าสุด --- */}
            <div className="right-column">
              <div className="history-card">
                <div className="history-header">
                  <span className="date-text">Last Maintenance: {item.date}</span>
                  <span className="reported-by">
                    Auditor: <strong>{item.engineer_name}</strong>
                  </span>
                </div>
                
                <div className="history-details-grid">
                  {/* กล่องซ้าย: สาเหตุที่เสีย (เน้นขอบแดง) */}
                  <div className="info-box reason-accent">
                    <h4>Maintenance Reason</h4>
                    <p>{item.issue}</p>
                  </div>
                  
                  {/* กล่องขวา: รายละเอียดการซ่อม (เน้นขอบเขียว) */}
                  <div className="info-box repair-accent">
                    <h4>Repair Details</h4>
                    <p>{item.repair}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        ))}
      </main>
    </div>
  );
}

export default MachineData;