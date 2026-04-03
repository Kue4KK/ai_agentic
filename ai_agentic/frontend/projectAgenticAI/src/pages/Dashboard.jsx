import './Dashboard.css';
import { Link } from 'react-router-dom';

function Dashboard() {
  // ข้อมูลจำลองเครื่องจักร
  const machines = [
    { id: 1, name: 'Machine 1', status: 'Operating', temp: 57, hours: 13 },
    { id: 2, name: 'Machine 2', status: 'Operating', temp: 52, hours: 10 },
    { id: 3, name: 'Machine 3', status: 'Standby', temp: 30, hours: 5 },
  ];

  return (
    <div className="dashboard-wrapper">
      <header className="content-header">
        <h1>Machine Overview</h1>
        <p>Real-time monitoring of all industrial equipment.</p>
      </header>

      <div className="machine-grid">
        {machines.map((machine) => (
          <div key={machine.id} className="machine-card">
            <div className="machine-img-placeholder">
              <span>No Image</span>
            </div>
            
            <div className="machine-details">
              <h3>{machine.name}</h3>
              <div className="status-badge">
                Status: <span className={`status-text ${machine.status.toLowerCase()}`}>{machine.status}</span>
                <span className={`status-dot ${machine.status.toLowerCase()}`}></span>
              </div>
              
              <div className="stat-group">
                <p>Temperature: <strong>{machine.temp} °C</strong></p>
                <p>Operating Hours: <strong>{machine.hours} h</strong></p>
              </div>

              <div className="history-row">
                <span>Maintenance History</span>
                {/* เชื่อมลิงก์ไปหน้าประวัติ */}
                <Link to="/maintenance-history" className="view-btn">View</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;