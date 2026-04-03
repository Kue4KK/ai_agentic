// src/pages/MaintenanceSuccess.jsx
import { useNavigate } from 'react-router-dom';
import './MaintenanceSuccess.css';

function MaintenanceSuccess() {
  const navigate = useNavigate();

  return (
    <div className="success-wrapper">
      <div className="success-container">
        {/* การ์ดสีขาวหลัก */}
        <div className="success-card">
          <div className="status-icon">✓</div>
          <h1>Maintenance<br />Completed</h1>
        </div>

        {/* ปุ่ม Finish ที่วางตำแหน่งเหลื่อมออกมาด้านล่างขวา */}
        <div className="action-area">
          <button 
            className="btn-finish" 
            onClick={() => navigate('/maintenance-tasks')}
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  );
}

export default MaintenanceSuccess;