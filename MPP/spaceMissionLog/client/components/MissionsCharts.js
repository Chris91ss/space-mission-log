// client/components/MissionsCharts.js
import React from "react";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement);

export default function MissionsCharts({ missions }) {
  // Pie chart data: missions by destination
  const destinationCounts = missions.reduce((acc, mission) => {
    acc[mission.destination] = (acc[mission.destination] || 0) + 1;
    return acc;
  }, {});
  const pieData = {
    labels: Object.keys(destinationCounts),
    datasets: [
      {
        data: Object.values(destinationCounts),
        backgroundColor: Object.keys(destinationCounts).map(
          () => "#" + Math.floor(Math.random() * 16777215).toString(16)
        ),
      },
    ],
  };

  // Bar chart data: missions by status
  const statusCounts = missions.reduce((acc, mission) => {
    acc[mission.status] = (acc[mission.status] || 0) + 1;
    return acc;
  }, {});
  const barData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        label: "Missions Count",
        data: Object.values(statusCounts),
        backgroundColor: ["#f87171", "#a3e635", "#facc15"],
      },
    ],
  };

  // Line chart data: missions over time (grouped by month)
  const monthCounts = missions.reduce((acc, mission) => {
    const month = mission.launchDate.substring(0, 7); // YYYY-MM
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});
  const lineData = {
    labels: Object.keys(monthCounts),
    datasets: [
      {
        label: "Missions Over Time",
        data: Object.values(monthCounts),
        fill: false,
        borderColor: "#80bfff",
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Missions by Destination</h2>
      <div style={{ height: "200px", margin: "0 auto 1rem", maxWidth: "400px" }}>
        <Pie data={pieData} options={commonOptions} />
      </div>
      <h2>Missions by Status</h2>
      <div style={{ height: "200px", margin: "0 auto 1rem", maxWidth: "400px" }}>
        <Bar data={barData} options={commonOptions} />
      </div>
      <h2>Missions Over Time</h2>
      <div style={{ height: "200px", margin: "0 auto", maxWidth: "400px" }}>
        <Line data={lineData} options={commonOptions} />
      </div>
    </div>
  );
}
