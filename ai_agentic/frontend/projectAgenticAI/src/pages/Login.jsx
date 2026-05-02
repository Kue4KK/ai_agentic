// src/pages/Login.jsx
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // จำลองการ Login แล้วไปที่หน้า Dashboard
    navigate('/machine-data');
  };

  return (
    <div className="login-wrapper">
      <div className="login-glass-card">
        <div className="login-header">
          <div className="login-logo">
            <span className="logo-icon">⚙️</span>
          </div>
          <h1>Welcome Back</h1>
          <p>Please enter your details to sign in.</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label>Employee ID</label>
            <input type="text" placeholder="Enter your ID" required />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" required />
          </div>

          <button type="submit" className="btn-login">
            Sign In
          </button>
        </form>

        <div className="login-footer">
          <p>Forgot password? <span>Contact Admin</span></p>
        </div>
      </div>
    </div>
  );
}

export default Login;