import Chart from "chart.js/auto";
import { useEffect, useState } from "react";
import useWindowDimensions from "../hooks/UseWindowDimensions";
import "./BarChart.css"
const color =  "#ff6b00";
const fontSize = 16;

const generateConfig = (chartData, dataConfig, labelCharLimit=20) => {
  const config = {
    type: "bar",
    data: dataConfig,
    options: {
      maintainAspectRatio: true,
      responsive: false,
      indexAxis: "y",
      animation: false,
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
              if ( text.length >= labelCharLimit) {
                return text.slice(0, text.length).substring(0, labelCharLimit -1).trim() + '...';;
              }   
              return text;
            }
          }            
        },
      },
      plugins: {
        legend: {
          display: false,
        }
      },
    },
  };
  return config;
}

function BarChart({ chartData }) {
  const [chart, setChart] = useState();
  const [chart2, setChart2] = useState();
  const [img, setImg] = useState();
  const { width } = useWindowDimensions();


  useEffect(() => {
    if (!chart) {
      const ctx = document.getElementById("myChart");
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
              yAlign: "bottom",
              callbacks: {
                afterBody: function (context) {
                  return context[0].raw.albums.map((album) => `${album.artist} - ${album.name}`)
                }
              },
            },
          },
        },
      };
      setChart(new Chart(ctx, config));
      setChart2(new Chart(document.getElementById("myChart2"), generateConfig(chartData, data, 30)));
    }
  }, [chart, chartData, width]);

  useEffect(() => {
    console.log(chart2)
    if (chart2) {
    setImg(chart2.toBase64Image())
  }}, [setImg, chart2])

  const download = (image, { name = "labelfmchart", extension = "jpg" } = {}) => {
    const a = document.createElement("a");
    a.href = image;
    a.download = name + "." + extension;
    a.click();
  };

  return (
    <div className="Chart">
      <div className="Chart-display" style={{ height: (chartData.length * 2) + "rem" }}>
        <canvas className="full-width" id="myChart"></canvas>
      </div>

      {/* Hidden Canvas to build the downloadable imge*/}
      <canvas className="Chart-image" style={{  width: "600px", height: (chartData.length * 2) + "rem", display: "none"}} id="myChart2"></canvas>

      <button className="Chart-download" onClick={() => download(img)}>Download</button>
    </div>
  );
}

export default BarChart;
