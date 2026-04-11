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
          <p>Showing past repair records for selected systems</p>
        </header>

        <div className="tasks-container">
          {tasks.length === 0 ? (
            <p>No active maintenance tasks at the moment.</p>
          ) : (
          
          tasks.map(task => (
            <div key={task.machine_id} className="task-group">
              <div className={`modern-task-card ${task.risk_level === 'high' ? 'high-risk'  : 'low-risk'}`}>
                <div className="task-header">
                  <h3>{task.machine_name}</h3>
                  <span className="priority-pill">{task.risk_level}</span>
                </div>
                
                <div className="task-details">
                  <div className="img-box">No Image</div>
                  <div className="reason-text">
                    <label>MAINTENANCE REASON</label>
                    <p><strong>🤖 AI1:</strong> {task.ai1_reason}</p>
                    <p><strong>🤖 AI2:</strong> {task.ai2_reason}</p>
                  </div>
                  <p><strong>🧠 Source:</strong> {task.decision_source}</p>

                  <p style={{ fontSize: "12px", color: "gray" }}>
                    🕒 {task.created_at}
                  </p>
                </div>
                <button className="accept-task-btn" onClick={() => navigate(`/maintenance-tasks-form/${task.machine_id}`)}>
                      Accept
                </button>
              </div>

              {/* ปุ่ม Accept Task ปรับให้เด่นชัดขึ้น */}
            </div>
          )
          ))}
        </div>
      </main>
    </div>
  );
}

export default MaintenanceTasks;