// src/pages/MaintenanceTasksForm.jsx
import { Link } from 'react-router-dom';
// ❌ ลบ import Sibar ออก
import './MaintenanceTasksForm.css';

function MaintenanceTasksForm() {
    return (
        <div className="task-form-wrapper">
            {/* ❌ เอา <Sibar /> ออกจากที่นี่ เพราะมีที่ App.jsx แล้ว */}

            <main className="task-form-content">
                <header className="page-header">
                    <h1>Maintenance Task Form</h1>
                    <p>Submit repair details after completing the maintenance job.</p>
                </header>

                <form className="modern-form-card">
                    {/* ส่วนข้อมูลเบื้องต้น */}
                    <div className="form-info-section">
                        <div className="form-group-inline">
                            <label htmlFor="engineerName">Assigned Engineer:</label>
                            <input type="text" id="engineerName" value="นาย พัสกร สิทธิเดช" readOnly />
                        </div>

                        <div className="form-group-inline">
                            <label htmlFor="taskDate">Date:</label>
                            <input type="date" id="taskDate" />
                        </div>
                    </div>

                    {/* ส่วนกล่องข้อความบรรยาย */}
                    <div className="form-details-section">
                        <div className="form-group-block">
                            <label htmlFor="issueDesc">Issue Description:</label>
                            <textarea id="issueDesc" rows="6" placeholder="Describe the problem you found..."></textarea>
                        </div>

                        <div className="form-group-block">
                            <label htmlFor="repairDetails">Repair Details:</label>
                            <textarea id="repairDetails" rows="6" placeholder="List the actions taken, parts replaced..."></textarea>
                        </div>
                    </div>

                    {/* ส่วนปุ่มกด */}
                    <footer className="form-actions">
                        <Link to="/maintenance-tasks" className="btn btn-back">Back</Link>

                        {/* ✅ เปลี่ยนจาก /maintenance-history เป็น /maintenance-success */}
                        <Link to="/maintenance-success" className="btn btn-complete">Complete</Link>
                    </footer>
                </form>
            </main>
        </div>
    );
}

export default MaintenanceTasksForm;