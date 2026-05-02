import { Link, useLocation } from 'react-router-dom';
import './sibar.css';
import logo from '../../image/icon.png';

function Sibar() {
  const location = useLocation();

  // ฟังก์ชันเช็คว่าเมนูไหนกำลังเปิดอยู่
  const isActive = (path) => {
    // ถ้าอยู่ที่หน้า Tasks หรือหน้า Form ให้ปุ่ม Maintenance Tasks สว่าง
    if (path === '/maintenance-tasks') {
      return location.pathname.includes('/maintenance-tasks');
    }
    return location.pathname === path;
  };

  return (
    <aside className="sidebar">
      <div className='icon'>
        <img src={logo} alt="Logo" />
        <h2>Ma<span className='i'>i</span>nten <span className='x'>X</span></h2>
      </div>
      <div className="profile-section">
        <div className="profile-circle"></div>
        <div className="profile-info">
          <h3>Name : Patsakorn sitthidech</h3>
          <p>Role : Engineer</p>
          <p>ID : 66109010197</p>
          <p>Phone : 012-345-6789</p>
        </div>
      </div>

      <nav className="menu">
        <Link 
          to="/machine-data" 
          className={`menu-item ${isActive('/machine-data') ? 'active' : ''}`}
        >
          Dashboard
        </Link>

        <Link 
          to="/dashboard" 
          className={`menu-item ${isActive('/dashboard') ? 'active' : ''}`}
        >
          AI Analysis
        </Link>
        
        <Link 
          to="/maintenance-tasks" 
          className={`menu-item ${isActive('/maintenance-tasks') ? 'active' : ''}`}
        >
          Maintenance Tasks
        </Link>

        <Link 
          to="/maintenance-history" 
          className={`menu-item ${isActive('/maintenance-history') ? 'active' : ''}`}
        >
          Maintenance History
        </Link>


        {/* <Link 
          to="/analyze" 
          className={`menu-item ${isActive('/analyze') ? 'active' : ''}`}
        >
          AI Analysis Manual
        </Link> */}
      </nav>
    </aside>
  );
}

export default Sibar;