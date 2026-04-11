// src/pages/MaintenanceTasksForm.jsx
import { Link } from 'react-router-dom';
// ❌ ลบ import Sibar ออก
import './MaintenanceTasksForm.css';
import { useEffect,useState } from 'react';
import { useParams } from "react-router-dom";

function MaintenanceTasksForm() {
    const [tasks, setTasks] = useState([]);
    const { id } = useParams();
    const [issue, setIssue] = useState("");
    const [repair, setRepair] = useState("");
    const [engineer_name, setEngineer_name] = useState("นาย พัสกร สิทธิเดช");
    const [date, setDate] = useState("");

    useEffect(() => {
        fetch(`http://localhost:8000/api/machines/${id}`)
          .then(res => res.json())
          .then(data => {
            console.log("tasks:", data);
            setTasks(data);
          });
      }, [id]);

    return (
        <div className="task-form-wrapper">
            {/* ❌ เอา <Sibar /> ออกจากที่นี่ เพราะมีที่ App.jsx แล้ว */}

            <main className="task-form-content">
                <header className="page-header">
                    <h1>Maintenance Task Form {tasks.name}</h1>
                    <p>Submit repair details after completing the maintenance job.</p>
                </header>

                <form className="modern-form-card">
                    {/* ส่วนข้อมูลเบื้องต้น */}
                    <div className="form-info-section">
                        <div className="form-group-inline">
                            <label htmlFor="engineerName">Assigned Engineer:</label>
                            <input type="text" id="engineerName" value={engineer_name} onChange={(e) => setEngineer_name(e.target.value)} />
                        </div>

                        <div className="form-group-inline">
                            <label htmlFor="taskDate">Date:</label>
                            <input type="date" id="taskDate" value={date} onChange={(e) => setDate(e.target.value)} />
                        </div>
                    </div>

                    {/* ส่วนกล่องข้อความบรรยาย */}
                    <div className="form-details-section">
                        <div className="form-group-block">
                            <label htmlFor="issueDesc">Issue Description:</label>
                            <textarea
                                value={issue}
                                onChange={(e) => setIssue(e.target.value)}
                                id="issueDesc" rows="6" placeholder="Describe the issue found during maintenance..."
                            />
                        </div>

                        <div className="form-group-block">
                            <label htmlFor="repairDetails">Repair Details:</label>
                            <textarea
                                value={repair}
                                onChange={(e) => setRepair(e.target.value)}
                                id="repairDetails" rows="6" placeholder="List the actions taken, parts replaced..."
                            ></textarea>
                        </div>
                    </div>

                    {/* ส่วนปุ่มกด */}
                    <footer className="form-actions">
                        <Link to="/maintenance-tasks" className="btn btn-back">Back</Link>

                        <button
                            type="button"
                            className="btn btn-complete"
                            onClick={() => {
                                fetch("http://localhost:8000/api/maintenance-accept", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    machine_id: id,
                                    engineer_name: engineer_name,
                                    issue: issue,
                                    repair: repair,
                                    date: date
                                })
                                })
                                .then(res => res.json())
                                .then(() => {
                                    fetch(`http://localhost:8000/api/tasks/${id}`, {
                                        method: "DELETE"
                                    })
                                    .then(() => {
                                        window.location.href = "/maintenance-success";
                                    });
                                });
                            }}
                            >
                            Complete
                        </button>
                    </footer>
                </form>
            </main>
        </div>
    );
}

export default MaintenanceTasksForm;