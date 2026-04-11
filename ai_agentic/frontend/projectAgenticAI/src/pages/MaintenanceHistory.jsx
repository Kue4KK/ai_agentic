import './MaintenanceHistory.css';
import { useEffect, useState } from 'react';

function MaintenanceHistory() {
  const [historyData, setHistoryData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMachine, setSelectedMachine] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const machineOptions = [...new Set(historyData.map(item => item.machine_name))];

  const filteredData = historyData.filter((item) => {
    const keyword = search.toLowerCase();

    const matchSearch =
      item.machine_name?.toLowerCase().includes(keyword) ||
      item.engineer_name?.toLowerCase().includes(keyword) ||
      item.issue?.toLowerCase().includes(keyword) ||
      item.repair?.toLowerCase().includes(keyword) ||
      item.date?.toLowerCase().includes(keyword);

    const matchMachine =
      selectedMachine === "" || item.machine_name === selectedMachine;

    const itemDate = new Date(item.date);

    const matchStart =
      !startDate || itemDate >= new Date(startDate);

    const matchEnd =
      !endDate || itemDate <= new Date(endDate);

    return matchSearch && matchMachine && matchStart && matchEnd;
  });

  useEffect(() => {
    fetch("http://localhost:8000/api/maintenance-history")
      .then(res => res.json())
      .then(data => setHistoryData(data));
  }, []);

  return (
    <div className="history-wrapper">
      {/* ❌ เอา <Sibar /> ออก เพราะมีอยู่ที่ App.jsx แล้ว */}
      
      <main className="history-content">
        <header className="history-header-section">
          <h1>Maintenance History</h1>
          <p>Showing past repair records for selected systems</p>
        </header>

        <div className="filter-bar">

          {/* 🔍 search */}
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* 🏭 machine dropdown */}
          <select
            value={selectedMachine}
            onChange={(e) => setSelectedMachine(e.target.value)}
          >
            <option value="">All Machines</option>
            {machineOptions.map((m, index) => (
              <option key={index} value={m}>{m}</option>
            ))}
          </select>

          {/* 📅 date range */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <button
            className="btn-clear"
            onClick={() => {
              setSearch("");
              setSelectedMachine("");
              setStartDate("");
              setEndDate("");
            }}
          >
            Clear
          </button>
        </div>


        <div className="history-list">
          {filteredData.map((item) => (
            <div key={item.id} className="history-item-card">
              
              <div className="history-info-side">
                <div className="machine-tag">{item.machine_name}</div>
                <div className="image-preview-placeholder">
                  <span>No Image</span>
                </div>
              </div>

              <div className="history-details-side">
                <div className="details-top">
                  <span className="date-badge">Date: {item.date}</span>
                  <span className="reporter-tag">Reported by: {item.engineer_name}</span>
                </div>
                
                <div className="details-grid">                                            
                  <div className="detail-inner-box reason-border">
                    <h4>MAINTENANCE REASON</h4>
                    <p>{item.issue}</p>
                  </div>
                  <div className="detail-inner-box repair-border">
                    <h4>REPAIR DETAILS</h4>
                    <p>{item.repair}</p>
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