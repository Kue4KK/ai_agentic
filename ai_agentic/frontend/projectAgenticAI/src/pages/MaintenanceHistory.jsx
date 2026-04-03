import './MaintenanceHistory.css';

function MaintenanceHistory() {
  const historyData = [
    { id: 1, date: '01/02/2022', reporter: 'นาย พัสกร สิทธิเดช', machine: 'Machine 2', reason: 'Hydraulic Leak', details: 'Replaced O-rings and refilled fluid.' },
    { id: 2, date: '15/01/2022', reporter: 'นาย พัสกร สิทธิเดช', machine: 'Machine 2', reason: 'Overheating', details: 'Cleaned cooling fan and reapplied thermal paste.' },
    { id: 3, date: '20/12/2021', reporter: 'นาย พัสกร สิทธิเดช', machine: 'Machine 2', reason: 'Motor Noise', details: 'Lubricated main bearings.' },
  ];

  return (
    <div className="history-wrapper">
      {/* ❌ เอา <Sibar /> ออก เพราะมีอยู่ที่ App.jsx แล้ว */}
      
      <main className="history-content">
        <header className="history-header-section">
          <h1>Maintenance History</h1>
          <p>Showing past repair records for selected systems</p>
        </header>

        <div className="history-list">
          {historyData.map((item) => (
            <div key={item.id} className="history-item-card">
              
              <div className="history-info-side">
                <div className="machine-tag">{item.machine}</div>
                <div className="image-preview-placeholder">
                  <span>No Image</span>
                </div>
              </div>

              <div className="history-details-side">
                <div className="details-top">
                  <span className="date-badge">Date: {item.date}</span>
                  <span className="reporter-tag">Reported by: {item.reporter}</span>
                </div>
                
                <div className="details-grid">
                  <div className="detail-inner-box reason-border">
                    <h4>MAINTENANCE REASON</h4>
                    <p>{item.reason}</p>
                  </div>
                  <div className="detail-inner-box repair-border">
                    <h4>REPAIR DETAILS</h4>
                    <p>{item.details}</p>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default MaintenanceHistory;