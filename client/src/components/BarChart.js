import Chart from "chart.js/auto";
import { useEffect, useState } from "react";
import useWindowDimensions from "../hooks/UseWindowDimensions";
import "./BarChart.css";
const color = "#f58d34";
const fontSize = 16;

const generateConfig = (
  chartData,
  dataConfig,
  title,
  screenWidth,
  customTooltip,
  maintainAspectRatio,
  responsive
) => {
  const config = {
    type: "bar",
    data: dataConfig,
    options: {
      maintainAspectRatio: maintainAspectRatio, //true
      responsive: responsive, //false
      indexAxis: "y",
      animation: responsive,
      scales: {
        x: {
          type: "linear",
          position: "top",
          ticks: {
            precision: 0,
            color: color,
            font: {
              size: fontSize,
            },
          },
        },
        y: {
          ticks: {
            color: color,
            font: {
              size: fontSize,
            },
            callback: function (value) {
              const text = chartData[value].y;
              let characterLimit = 22;
              if (screenWidth <= 400) {
                characterLimit = 14;
              }

              if (text.length >= characterLimit) {
                return (
                  text
                    .slice(0, text.length)
                    .substring(0, characterLimit - 1)
                    .trim() + "..."
                );
              }
              return text;
            },
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        title: {
          text: title,
          display: !!title,
          color: color,
          font: {weight: 'bold', size: '20px'},
          padding: 20
        },
        tooltip: {
          enabled: false,
          external: customTooltip,
          callbacks: {
            afterBody: function (context) {
              return context[0].raw.albums.map(
                (album) => `${album.artist} - ${album.name}`
              );
            },
          },
        },
      },
    },
  };
  return config;
};

const getOrCreateTooltip = (chart) => {
  let tooltipEl = chart.canvas.parentNode.querySelector("div");

  if (!tooltipEl) {
    tooltipEl = document.createElement("div");
    tooltipEl.style.background = "rgba(0, 0, 0, 0.75)";
    tooltipEl.style.borderRadius = "10px";
    tooltipEl.style.color = "white";
    tooltipEl.style.opacity = 1;
    tooltipEl.style.pointerEvents = "none";
    tooltipEl.style.position = "absolute";
    tooltipEl.style.transform = "translate(0, -100%)";
    tooltipEl.style.transition = "all .1s ease";
    tooltipEl.style.width = "fit-content";
    tooltipEl.style.textAlign = "left";

    const table = document.createElement("table");
    table.style.margin = "0px";
    table.style.borderSpacing = "0px";

    tooltipEl.appendChild(table);
    chart.canvas.parentNode.appendChild(tooltipEl);
  }

  return tooltipEl;
};

const getOrCreateTooltipCaret = (chart) => {
  let caret = chart.canvas.parentNode.querySelector("span");

  if (!caret) {
    caret = document.createElement("span");
    caret.style.width = 0;
    caret.style.height = 0;
    caret.style.display = "block";
    caret.style.border = "10px solid transparent";
    caret.style.transition = "all .1s ease";
    caret.style.borderTopColor = "rgba(0, 0, 0, 0.75)";
    caret.style.position = "absolute";
    chart.canvas.parentNode.appendChild(caret);
  }

  return caret;
};

/*
External tooltip in the format of
Label name (Album Count)
Album Artist - Album title
Album Artist - Album title
Album Artist - Album title 
*/
const externalTooltipHandler = (context) => {
  // Tooltip Element
  const { chart, tooltip } = context;
  const tooltipEl = getOrCreateTooltip(chart);
  const caretEl = getOrCreateTooltipCaret(chart);

  // Hide if no tooltip
  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = 0;
    caretEl.style.opacity = 0;
    return;
  }

  // Set Text
  if (tooltip.body) {
    const recordLabel = tooltip.title || [];
    const numLabelText = tooltip.body[0].lines[0];
    const title = `${recordLabel} (${numLabelText})`;
    // make tooltip title
    const tableHead = document.createElement("thead");
    tableHead.style.fontSize = "0.9rem";
    const tr = document.createElement("tr");
    tr.style.borderWidth = 0;

    const th = document.createElement("th");
    th.style.borderWidth = 0;
    const text = document.createTextNode(title);

    th.appendChild(text);
    tr.appendChild(th);
    tableHead.appendChild(tr);

    const tableBody = document.createElement("tbody");
    tableBody.style.fontSize = "0.8rem";
    tooltip.afterBody.forEach((line) => {
      const text = document.createTextNode(line);
      const tr = document.createElement("tr");
      tr.style.backgroundColor = "inherit";
      tr.style.borderWidth = 0;
      const td = document.createElement("td");
      td.style.borderWidth = 0;
      td.appendChild(text);
      tr.appendChild(td);
      tableBody.appendChild(tr);
    });

    const tableRoot = tooltipEl.querySelector("table");

    // Remove old children
    while (tableRoot.firstChild) {
      tableRoot.firstChild.remove();
    }

    // Add new children
    tableRoot.appendChild(tableHead);
    tableRoot.appendChild(tableBody);
  }

  const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;
  const tooltipWidth = tooltipEl.getBoundingClientRect().width;

  // find ideal tooltip x-axis placement
  const xPos = positionX + tooltip.caretX - 16;
  const yPos = positionY + tooltip.caretY - 19;

  // create caret
  caretEl.style.left = xPos + "px";
  caretEl.style.top = yPos + "px";

  const toolTipLeftPos = xPos - tooltipWidth / 3;
  if (toolTipLeftPos <= 0) {
    // if the tooltip would go over the left screen edge, set the left side to start there
    tooltipEl.style.left = "5px";
  } else if (
    toolTipLeftPos + tooltipWidth >=
    document.documentElement.clientWidth
  ) {
    // if the right  side would go over the screen edge, set the tooltip to end at the screen edge
    tooltipEl.style.left =
      document.documentElement.clientWidth - tooltipWidth - 1 + "px";
  } else {
    tooltipEl.style.left = xPos - tooltipWidth / 3 + "px";
  }

  tooltipEl.style.top = yPos + "px";
  tooltipEl.style.font = tooltip.options.bodyFont.string;
  tooltipEl.style.padding =
    tooltip.options.padding + "px " + tooltip.options.padding + "px";

  // make elements visible
  tooltipEl.style.opacity = 1;
  caretEl.style.opacity = 1;
};

function BarChart({ chartData, user }) {
  const [chart, setChart] = useState();
  const [chart2, setChart2] = useState();
  const [img, setImg] = useState();
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (!chart && chartData.length) {
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

      setChart(new Chart(ctx, generateConfig(chartData, data, null, width, externalTooltipHandler, false, true)));
      setChart2(
        new Chart(
          document.getElementById("myChart2"),
          generateConfig(chartData, data, `${user}'s Top Record Labels By # of Favorite Albums`, width, null, true, false)
        )
      );
    }
  }, [chart, chartData, width, user]);

  useEffect(() => {
    if (chart2) {
      setImg(chart2.toBase64Image());
    }
  }, [setImg, chart2]);

  const download = (
    image,
    { name = "labelfmchart", extension = "jpg" } = {}
  ) => {
    const a = document.createElement("a");
    a.href = image;
    a.download = name + "." + extension;
    a.click();
  };

  if (chartData.length === 0) {
    return <p>No listening history found</p>
  }

  return (
    <div className="Chart">
      <div
        className="Chart-display"
        style={{ height: chartData.length * 1.8 + "rem" }}
      >
        <canvas className="full-width" id="myChart"></canvas>
      </div>

      {/* Hidden Canvas to build the downloadable imge*/}
      <canvas
        className="Chart-image"
        style={{
          width: "600px",
          height: chartData.length * 2 + "rem",
          display: "none",
        }}
        id="myChart2"
      ></canvas>

      <button className="Chart-download" onClick={() => download(img)}>
        Download
      </button>
    </div>
  );
}

export default BarChart;
