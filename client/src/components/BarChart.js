import Chart from "chart.js/auto";
import { useEffect, useState } from "react";

function BarChart({ chartData }) {
  const [chart, setChart] = useState();

  useEffect(() => {
    if (!chart) {
      const data = {
        datasets: [
          {
            data: chartData,
            backgroundColor: "rgba(255, 159, 64, 0.9)",
            borderColor: "rgb(255, 159, 64)",
            borderWidth: 1,
          },
        ],
      };

      const config = {
        type: "bar",
        data: data,
        options: {
            maintainAspectRatio: false,
            responsive: true,            
          indexAxis: "y",
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      };
      setChart(new Chart(document.getElementById("myChart"), config));
    }
  }, [chart, chartData]);

  return (
    <div style={{ width: "100%", height: chartData.length + "em"  }}>
      <canvas style={{ width: "100%"}} id="myChart"></canvas>
    </div>
  );
}

export default BarChart;
