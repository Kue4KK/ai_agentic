import './Dashboard.css';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [machines, setMachines] = useState([]);
  const navigate = useNavigate();


  useEffect(() => {
    fetch("http://localhost:8000/api/machines")
      .then(res => res.json())
      .then(data => setMachines(data));
  }, []);


  return (
    <div className="dashboard-wrapper">
      <div className="analysis_ai">
        <header className="history-header-section">
          <h1>Analysis Machines</h1>
          <p>Showing past repair records for selected systems</p>
        </header>

        <div className="machine-grid">
          {machines.map((machine) => {
            const latestSensor = machine.sensors?.[0];
          return (
              <div key={machine.id} className="machine-card">
                <div className="history-info-side">
                  
                  <div className="image-preview-placeholder">
                    <span>No Image</span>
                  </div>
                </div>

                <div className="history-details-side">
                  <div className="machine-details">
                  <h3>{machine.name}</h3>

                  <div className="stat-group">
                    <p>
                      Air Temp: <strong>
                        {latestSensor ? latestSensor.air_temperature : '-'} °K
                      </strong>
                    </p>

                    <p>
                      Process Temp: <strong>
                        {latestSensor ? latestSensor.process_temperature : '-'} °K
                      </strong>
                    </p>

                    <p>
                      Speed: <strong>
                        {latestSensor ? latestSensor.rotational_speed : '-'} RPM
                      </strong>
                    </p>

                    <p>
                      Torque: <strong>
                        {latestSensor ? latestSensor.torque : '-'} Nm
                      </strong>
                    </p>

                    <p>
                      Tool wear: <strong>
                        {latestSensor ? latestSensor.tool_wear : '-'} min
                      </strong>
                    </p>
                  </div>
                </div>


                

                  <div className="history-row">
                    <button className="analyze-btn" onClick={() => navigate(`/analyze-machine/${machine.id}`)}>
                      Analyze
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;