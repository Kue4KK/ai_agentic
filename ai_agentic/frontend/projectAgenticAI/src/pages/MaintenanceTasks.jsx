import { Link } from "react-router-dom";
import "./MaintenanceTasks.css";
import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function MaintenanceTasks() {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8000/api/tasks")
      .then(res => res.json())
      .then(data => {
        console.log("tasks:", data);
        setTasks(data);
      });
  }, []);

  return (
    <div className="tasks-wrapper">
      {/* ❌ เอา <Sibar /> ออก เพราะมีอยู่ที่ App.jsx แล้ว */}

      <main className="tasks-main-content">
        <header className="history-header-section">
          <h1>Maintanance Tasks</h1>
          <p>Monitor and manage ongoing and scheduled maintenance tasks</p>
        </header>

        <div className="tasks-container">
          {tasks.length === 0 ? (
            <p className="Ndata">No active maintenance tasks at the moment.</p>
          ) : (
          
          tasks.map(task => (
            <div key={task.machine_id} className="task-group">
              <div className={`modern-task-card ${task.risk_level === 'high' ? 'high-risk'  : task.risk_level === 'low' ? 'low-risk' : 'medium-risk'}`}>
                <div className="task-header">
                  <h3>{task.machine_name}</h3>
                  <span className="priority-pill">{task.risk_level}</span>
                </div>
                
                <div className="task-details">
                  <div className="img-box">No Image</div>
                  <div className="reason-text">
                    <label>MAINTENANCE REASON</label>
                    <strong>🤖 AI 1:</strong>
                    <p> {task.ai1_reason}</p>
                    <strong>🤖 AI 2:</strong> 
                    <p>{task.ai2_reason}</p>
                  </div>
                  <div className="reason-text">
                    <label>DECISION SOURCE</label>
                    <p>{task.decision_source}</p>
                  </div>
                  <div className="reason-text">
                    <label>DATE TIME</label>
                    <p style={{ fontSize: "15px", color: "gray" }}>
                      {task.created_at}
                    </p>
                  </div>

                  
                </div>
                <button className="accept-task-btn" onClick={() => navigate(`/maintenance-tasks-form/${task.machine_id}`)}>
                      Accept
                </button>
              </div>

            </div>
          )
          ))}
        </div>
      </main>
    </div>
  );
}

export default MaintenanceTasks;