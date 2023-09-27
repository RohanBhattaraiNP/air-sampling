import { fetchCSV } from "./modules/fetchHelpers.js";
import parseTimeValueCSV from "./modules/parseTimeValueCSV.js";
import hourStringToDateObject from "./modules/hourStringToDateObject.js";
import { aqiChart, aqiLegend }  from "./modules/charts.js";

const DATA_LABELS = {
    time: "Time",
    aqiData: "AQI",
    aqiDataLower: "AQI Lower",
    aqiDataUpper: "AQI Upper",
    tempData: "Temperature",
    tempDataLower: "Temp Lower",
    tempDataUpper: "Temp Upper"
}

const generateAqiChart = (aqiData, aqiDataLower, aqiDataUpper, tempData, tempDataLower, tempDataUpper) => {
    const chartContainer = document.querySelector(".aqi-chart__chart-container");
    const chartHeight = window.innerWidth > 600 ? 400 : 300;
    const chartWidth = chartContainer.offsetWidth;

    const chartLegend = aqiLegend();

    const chartSVG = aqiChart(aqiData, aqiDataLower, aqiDataUpper, tempData, tempDataLower, tempDataUpper, {
        height: chartHeight,
        width: chartWidth
    });

    chartLegend.classList.add("aqi-chart__chart-legend");

    chartSVG.classList.add("aqi-chart__chart-svg");

    chartContainer.replaceChildren(chartLegend, chartSVG);
}

const generateAqiTable = (aggregateData, dataLabels) => {
    let table = document.querySelector(".aqi-chart__table")
    table.id = "aqi-table"

    let tableHeader = document.createElement("tr")
    let tableBody = new DocumentFragment()
    let tableColumns = [];

    for(let prop in aggregateData[0]) { tableColumns.push(prop) }

    // Create table header
    tableColumns.forEach(column => {
        let tableHeaderCell = document.createElement("th");
        tableHeaderCell.classList.add("aqi-chart__table-cell", "aqi-chart__table-cell--header")

        tableHeaderCell.setAttribute("scope", "col");
        tableHeaderCell.innerText = dataLabels[column];
        
        tableHeader.appendChild(tableHeaderCell);
    });

    // Create table body
    aggregateData.forEach(datum => {
        let row = document.createElement("tr");
        tableColumns.forEach(column => {
            let cell = document.createElement("td")
            cell.classList.add("aqi-chart__table-cell")

            let content = datum[column]

            cell.innerText = column == "time" ? cell.innerText = content.toLocaleTimeString() : content

            row.appendChild(cell)
        });
        tableBody.appendChild(row)
    })

    table.appendChild(tableHeader);
    table.appendChild(tableBody);
}

const res = await Promise.all([
    fetchCSV("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=aqi"),
    fetchCSV("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=aqi_lower"),
    fetchCSV("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=aqi_upper"),
    fetchCSV("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=temp"),
    fetchCSV("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=temp_lower"),
    fetchCSV("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=temp_upper")
]);

const csvData = res.map(parseTimeValueCSV);

const csvDataTimeFormatted = csvData.map(data => {
    return data.map(entry => ({ ...entry, time: hourStringToDateObject(entry.time) }));
});

const [aqiData, aqiDataLower, aqiDataUpper, tempData, tempDataLower, tempDataUpper] = csvDataTimeFormatted;

const csvDataAggregated = aqiData.map((aqiDatum, i) => (
    {
        time: aqiDatum.time,
        aqiData: aqiData[i].value,
        aqiDataLower: aqiDataLower[i].value,
        aqiDataUpper: aqiDataUpper[i].value,
        tempData: tempData[i].value,
        tempDataLower: tempDataLower[i].value,
        tempDataUpper: tempDataUpper[i].value
    }
))

generateAqiChart(aqiData, aqiDataLower, aqiDataUpper, tempData, tempDataLower, tempDataUpper);

window.addEventListener('resize', () => {
    generateAqiChart(aqiData, aqiDataLower, aqiDataUpper, tempData, tempDataLower, tempDataUpper);
});

const dataTableToggleBtn = document.querySelector(".aqi-chart__table-toggle-btn");

dataTableToggleBtn.addEventListener("click", () => {
    const dataTable = document.querySelector(".aqi-chart__table");
    const dataTableToggleBtn = document.querySelector(".aqi-chart__table-toggle-btn");

    if(dataTableToggleBtn.getAttribute("aria-expanded") == "false") {
        dataTable.classList.add("aqi-chart__table--expanded");
        dataTableToggleBtn.setAttribute("aria-expanded", "true");
    } else {
        dataTable.classList.remove("aqi-chart__table--expanded");
        dataTableToggleBtn.setAttribute("aria-expanded", "false");
    }
})

generateAqiTable(csvDataAggregated, DATA_LABELS)