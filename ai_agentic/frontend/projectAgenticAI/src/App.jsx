import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MaintenanceHistory from './pages/MaintenanceHistory';
import MaintenanceTasks from './pages/MaintenanceTasks';
import MaintenanceTasksForm from './pages/MaintenanceTasksForm';
import MachineData from './pages/MachineData';
import Analyze from './pages/Analyze';
import AnalyzeMachine from './pages/Analyze_machine';
import MaintenanceSuccess from './pages/MaintenanceSuccess';
import Login from './pages/Login'; // 1. Import หน้า Login มาด้วย
import Sibar from './components/sibar/sibar'; 
import './App.css';

// แยกส่วนเนื้อหาออกมาเพื่อให้สามารถใช้ useLocation() ได้
function AppContent() {
  const location = useLocation();

  // 2. เช็คว่าถ้าอยู่ที่ path "/" (หน้า Login) จะไม่แสดง Sidebar
  const isLoginPage = location.pathname === '/';

  return (
    <div className="app-layout" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* ถ้าไม่ใช่หน้า Login ให้แสดง Sidebar */}
      {!isLoginPage && <Sibar />}
      
      <main className="page-content" style={{ flexGrow: 1, overflowY: 'auto', backgroundColor: '#0f172a' }}>
        <Routes>
          {/* 3. ตั้งค่า Login เป็นหน้าแรกสุด */}
          <Route path="/" element={<Login />} />
          
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/maintenance-history" element={<MaintenanceHistory />} />
          <Route path="/maintenance-tasks" element={<MaintenanceTasks />} />
          <Route path="/maintenance-tasks-form/:id" element={<MaintenanceTasksForm />} />
          <Route path="/machine-data" element={<MachineData />} />
          <Route path="/maintenance-success" element={<MaintenanceSuccess />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/analyze-machine/:id" element={<AnalyzeMachine />} />

          {/* ถ้าพิมพ์ path มั่ว ให้ดีดกลับไปหน้า Login */}

          {/* ถ้าพิมพ์ path มั่ว ให้ดีดกลับไปหน้า Login */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;