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

const getOrCreateTooltip = (chart) => {
  let tooltipEl = chart.canvas.parentNode.querySelector('div');

  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.style.background = 'rgba(0, 0, 0, 0.7)';
    tooltipEl.style.borderRadius = '3px';
    tooltipEl.style.color = 'white';
    tooltipEl.style.opacity = 1;
    tooltipEl.style.pointerEvents = 'none';
    tooltipEl.style.position = 'absolute';
    tooltipEl.style.transform = 'translate(-50%, 0)';
    tooltipEl.style.transition = 'all .1s ease';

    const table = document.createElement('table');
    table.style.margin = '0px';

    tooltipEl.appendChild(table);
    chart.canvas.parentNode.appendChild(tooltipEl);
  }

  return tooltipEl;
};

const externalTooltipHandler = (context) => {
  // Tooltip Element
  const {chart, tooltip} = context;
  const tooltipEl = getOrCreateTooltip(chart);

  // Hide if no tooltip
  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = 0;
    return;
  }

  // Set Text
  if (tooltip.body) {
    const titleLines = tooltip.title || [];
    const bodyLines = tooltip.body.map(b => b.lines);

    const tableHead = document.createElement('thead');

    titleLines.forEach(title => {
      const tr = document.createElement('tr');
      tr.style.borderWidth = 0;

      const th = document.createElement('th');
      th.style.borderWidth = 0;
      const text = document.createTextNode(title);

      th.appendChild(text);
      tr.appendChild(th);
      tableHead.appendChild(tr);
    });

    const tableBody = document.createElement('tbody');
    bodyLines.forEach((body, i) => {
      const colors = tooltip.labelColors[i];

      const span = document.createElement('span');
      span.style.background = colors.backgroundColor;
      span.style.borderColor = colors.borderColor;
      span.style.borderWidth = '2px';
      span.style.marginRight = '10px';
      span.style.height = '10px';
      span.style.width = '10px';
      span.style.display = 'inline-block';

      const tr = document.createElement('tr');
      tr.style.backgroundColor = 'inherit';
      tr.style.borderWidth = 0;

      const td = document.createElement('td');
      td.style.borderWidth = 0;

      const text = document.createTextNode(body);

      td.appendChild(span);
      td.appendChild(text);
      tr.appendChild(td);
      tableBody.appendChild(tr);
    });

    const tableRoot = tooltipEl.querySelector('table');

    // Remove old children
    while (tableRoot.firstChild) {
      tableRoot.firstChild.remove();
    }

    // Add new children
    tableRoot.appendChild(tableHead);
    tableRoot.appendChild(tableBody);
  }

  const {offsetLeft: positionX, offsetTop: positionY} = chart.canvas;

  // Display, position, and set styles for font
  tooltipEl.style.opacity = 1;
  tooltipEl.style.left = positionX + tooltip.caretX + 'px';
  tooltipEl.style.top = positionY + tooltip.caretY + 'px';
  tooltipEl.style.font = tooltip.options.bodyFont.string;
  tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';
};

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
                    characterLimit = 14
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
      <div className="Chart-display" style={{ height: (chartData.length * 1.8) + "rem" }}>
        <canvas className="full-width" id="myChart"></canvas>
      </div>

      {/* Hidden Canvas to build the downloadable imge*/}
      <canvas className="Chart-image" style={{  width: "600px", height: (chartData.length * 2) + "rem", display: "none"}} id="myChart2"></canvas>

      <button className="Chart-download" onClick={() => download(img)}>Download</button>
    </div>
  );
}

export default BarChart;
