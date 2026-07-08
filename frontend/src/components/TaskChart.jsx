import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

import "../styles/taskchart.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function TaskChart({
  total,
  completed,
  pending,
  inProgress,
  overdue,
}) {

  const data = {
    labels: [
      "Total",
      "Completed",
      "Pending",
      "In Progress",
      "Overdue",
    ],

    datasets: [
      {
        label: "Tasks",
        data: [
          total,
          completed,
          pending,
          inProgress,
          overdue,
        ],
        backgroundColor: [
          "#2563EB",
          "#22C55E",
          "#F59E0B",
          "#2563EB",
          "#EF4444",
        ],
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },

    plugins: {

      legend: {
        display: false,
      },

      title: {
        display: true,
        text: "Task Overview",
        font: {
          size: 18,
        },
      },

    },

  };

  return (

    <div className="chart-card">

      <div className="chart-body">
        <Bar
          data={data}
          options={options}
        />
      </div>

    </div>

  );

}

export default TaskChart;