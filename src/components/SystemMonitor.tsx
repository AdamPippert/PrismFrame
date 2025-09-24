import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface SystemMonitorProps {
  data: any;
}

const SystemMonitor: React.FC<SystemMonitorProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="system-monitor">
        <div className="panel-title">System Monitor</div>
        <div className="loading">Loading system information...</div>
      </div>
    );
  }

  const cpuData = {
    labels: ["Used", "Free"],
    datasets: [
      {
        data: [data.cpu?.usage || 0, 100 - (data.cpu?.usage || 0)],
        backgroundColor: ["#00ff88", "rgba(0, 255, 136, 0.2)"],
        borderColor: ["#00ff88", "rgba(0, 255, 136, 0.3)"],
        borderWidth: 2,
      },
    ],
  };

  const memoryData = {
    labels: ["Used", "Free"],
    datasets: [
      {
        data: [data.memory?.percentage || 0, 100 - (data.memory?.percentage || 0)],
        backgroundColor: ["#0088ff", "rgba(0, 136, 255, 0.2)"],
        borderColor: ["#0088ff", "rgba(0, 136, 255, 0.3)"],
        borderWidth: 2,
      },
    ],
  };

  const diskData = {
    labels: ["Used", "Free"],
    datasets: [
      {
        data: [data.disk?.percentage || 0, 100 - (data.disk?.percentage || 0)],
        backgroundColor: ["#ff8800", "rgba(255, 136, 0, 0.2)"],
        borderColor: ["#ff8800", "rgba(255, 136, 0, 0.3)"],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="system-monitor">
      <div className="panel-title">System Monitor</div>

      <div className="metric">
        <h4>CPU Usage</h4>
        <div className="chart-container">
          <Doughnut data={cpuData} options={chartOptions} />
        </div>
        <div className="metric-value">{data.cpu?.usage?.toFixed(1) || 0}%</div>
      </div>

      <div className="metric">
        <h4>Memory Usage</h4>
        <div className="chart-container">
          <Doughnut data={memoryData} options={chartOptions} />
        </div>
        <div className="metric-value">
          {data.memory?.used?.toFixed(1) || 0}GB / {data.memory?.total?.toFixed(1) || 0}GB
        </div>
      </div>

      <div className="metric">
        <h4>Disk Usage</h4>
        <div className="chart-container">
          <Doughnut data={diskData} options={chartOptions} />
        </div>
        <div className="metric-value">
          {data.disk?.used?.toFixed(1) || 0}GB / {data.disk?.total?.toFixed(1) || 0}GB
        </div>
      </div>

      <div className="network-info">
        <h4>Network</h4>
        <div className="network-stats">
          <div>↓ {((data.network?.rx || 0) / 1024 / 1024).toFixed(2)} MB/s</div>
          <div>↑ {((data.network?.tx || 0) / 1024 / 1024).toFixed(2)} MB/s</div>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor;