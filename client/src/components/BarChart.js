import Chart from "chart.js/auto";
import { useEffect, useState } from "react";
import useWindowDimensions from "../hooks/UseWindowDimensions";
import "./BarChart.css"

function BarChart({ chartData }) {
  const [chart, setChart] = useState();
  const { width } = useWindowDimensions();
  const color =  "#ff6b00";
  const fontSize = 16;

  useEffect(() => {
    if (!chart) {
      const data = {
        datasets: [
          {
            data: chartData,
            backgroundColor: color,
            borderColor: color,
            color: color,
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
          scales: {
            x: {
              type: "linear",
              position: "top",
              ticks: {
                precision: 0,
                color: color,
                font: {
                  size: fontSize
                }
              },
            },
            y: {
              ticks: {
                color: color,
                font: {
                  size: fontSize
                },
                callback: function(value) {
                  const text = chartData[value].y
                  let characterLimit = 21
                  if (width <= 400) {
                    characterLimit = 15
                  }

                  if ( text.length >= characterLimit) {
                    return text.slice(0, text.length).substring(0, characterLimit -1).trim() + '...';;
                  }   
                  return text;
                }
              }            
            },
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                afterBody: function (context) {
                  return context[0].raw.albums.map((album) => `${album.artist} - ${album.name}`)
                }
              },
            },
          },
        },
      };
      setChart(new Chart(document.getElementById("myChart"), config));
    }
  }, [chart, chartData, width]);

  return (
    <div className="Chart" style={{ height: (chartData.length * 2) + "rem" }}>
      <canvas style={{ width: "100%" }} id="myChart"></canvas>
    </div>
  );
}

export default BarChart;
