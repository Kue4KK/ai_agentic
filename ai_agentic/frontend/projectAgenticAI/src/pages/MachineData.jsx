import './MachineData.css';

function MachineData() {
  return (
    <div className="machine-data-layout">
      {/* ❌ เอา <Sibar /> ออกจากตรงนี้ เพราะถูกเรียกใช้ที่ App.jsx แล้ว */}

      <main className="machine-data-content">
        {/* แถบเลือกเครื่องจักรด้านบน */}
        <div className="top-selection-bar">
          <select className="machine-dropdown">
            <option value="machine1">Machine 1</option>
            <option value="machine2">Machine 2</option>
            <option value="machine3">Machine 3</option>
          </select>
        </div>

        {/* พื้นที่แสดงข้อมูล ซ้าย-ขวา */}
        <div className="data-grid">
          
          {/* คอลัมน์ซ้าย: รูปภาพและสถานะ */}
          <div className="left-column">
            <div className="machine-image-box">
              {/* ใส่รูปภาพเครื่องจักรที่นี่ */}
              <span>No Image</span>
            </div>
            
            <div className="machine-status">
              <h2>Machine 1</h2>
              <p>Status: Operating</p>
              <p>Temperature: 57 °C</p>
              <p>Machine Age: 2 Years</p>
            </div>
          </div>

          {/* คอลัมน์ขวา: ประวัติการซ่อม */}
          <div className="right-column">
            <h2 className="history-title">Maintenance History</h2>
            
            <div className="history-card">
              <div className="history-header">
                <span>Date: 01/02/2022</span>
                <span className="reported-by">
                  Reported By <input type="text" value="นาย พัสกร สิทธิเดช" readOnly className="reporter-input" />
                </span>
              </div>
              
              <div className="history-details">
                {/* กล่องซ้าย: สาเหตุที่เสีย (ขอบแดง) */}
                <div className="detail-box reason-box">
                  <label>Maintenance Reason</label>
                  <p>Hydraulic Leak</p>
                </div>
                
                {/* กล่องขวา: รายละเอียดการซ่อม (ขอบเขียว) */}
                <div className="detail-box repair-box">
                  <label>Repair Details</label>
                  <p>Replaced O-rings and refilled fluid.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default MachineData;