import { Link } from "react-router-dom";
import "./MaintenanceTasks.css";

function MaintenanceTasks() {
  const tasks = [
    {
      id: 1,
      name: "Machine 1",
      priority: "High",
      reason: "Critical Engine Failure - Overheating detected in main cylinder block.",
      colorClass: "priority-high",
    },
    {
      id: 2,
      name: "Machine 2",
      priority: "Medium",
      reason: "Scheduled Filter Change - System performance dropping slightly.",
      colorClass: "priority-medium",
    },
    {
      id: 3,
      name: "Machine 3",
      priority: "Low",
      reason: "General Inspection - Quarterly maintenance and sensor calibration.",
      colorClass: "priority-low",
    },
  ];

  return (
    <div className="tasks-wrapper">
      {/* ❌ เอา <Sibar /> ออก เพราะมีอยู่ที่ App.jsx แล้ว */}

      <main className="tasks-main-content">
        <div className="content-header">
          <h1>Active Maintenance Tasks</h1>
          <p>Manage and accept repair assignments based on priority levels.</p>
        </div>

        <div className="tasks-container">
          {tasks.map((task) => (
            <div key={task.id} className="task-group">
              <div className={`modern-task-card ${task.colorClass}`}>
                <div className="task-header">
                  <h3>{task.name}</h3>
                  <span className="priority-pill">{task.priority}</span>
                </div>
                
                <div className="task-details">
                  <div className="img-box">No Image</div>
                  <div className="reason-text">
                    <label>MAINTENANCE REASON</label>
                    <p>{task.reason}</p>
                  </div>
                </div>
              </div>

              {/* ปุ่ม Accept Task ปรับให้เด่นชัดขึ้น */}
              <Link
                to="/maintenance-tasks-form"
                className="accept-task-btn"
              >
                Accept Task
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default MaintenanceTasks;