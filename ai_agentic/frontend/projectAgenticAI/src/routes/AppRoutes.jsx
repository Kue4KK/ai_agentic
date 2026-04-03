import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from './pages/Dashboard';
import History from './pages/MaintenanceHistory';
import Tasks from './pages/MaintenanceTasks';
import MaintenanceTasksForm from './pages/MaintenanceTasksForm';
import Machine from './pages/MachineData';
import Sibar from './components/sibar/sibar'; // 1. อย่าลืม Import Sidebar

function AppRoutes() {
  return (
    <BrowserRouter>
      {/* 2. จัด Layout ให้มี Sidebar อยู่ฝั่งซ้ายตลอดเวลา */}
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        
        <Sibar /> {/* Sidebar จะแสดงทุกหน้า */}

        {/* 3. ส่วนเนื้อหาทางขวาที่เปลี่ยนตาม Route */}
        <main style={{ flexGrow: 1, overflowY: 'auto', backgroundColor: '#0b1120' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* 4. แก้ชื่อ Path ให้ตรงกับที่ปุ่มกดเรียก (ต้องมี s และขีดกลาง) */}
            <Route path="/maintenance-tasks" element={<Tasks />} />
            <Route path="/maintenance-tasks-form" element={<MaintenanceTasksForm />} />
            
            <Route path="/maintenance-history" element={<History />} />
            <Route path="/machine-data" element={<Machine />} /> 
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default AppRoutes;