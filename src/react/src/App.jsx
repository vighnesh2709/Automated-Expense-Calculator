import { useEffect, useState, useRef } from 'react';
import './App.css';
import axios from 'axios';
import * as d3 from 'd3';

const margin = {
  top: 30,
  bottom: 30,
  left: 30,
  right: 30
};

const height = 400;
const width = 400;

function App() {
  const ref = useRef();
  const pieCharRef = useRef();
  const [value, setValue] = useState(0);
  const [data, setData] = useState([{ "month": "Januart", "total": -100 }]);
  const [PieData, setPieData] = useState([{ "transaction_to": "random@gmail.com", "total": 100 }]);

  // Pie Chart rendering logic
  useEffect(() => {
    const w = 1250;
    const h = 1250;
    const radius = w / 2;

    // Clear previous SVG
    d3.select(pieCharRef.current).selectAll("*").remove();

    // Create an SVG element
    const svg = d3.select(pieCharRef.current)
      .attr('width', w)
      .attr('height', h)
      .append('g')
      .attr('transform', `translate(${w / 2}, ${h / 2})`) // Center the pie chart
      .style('overflow', 'visible')
      .style('margin-top', '400px');

    // Format the pie data
    const formattedData = d3.pie().value(d => d.total)(PieData);

    // Arc generator
    const arcGenerator = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    // Color scale
    const color = d3.scaleOrdinal(d3.schemeSet2);

    // Bind the data and create the pie chart
    svg.selectAll('path')
      .data(formattedData)
      .join('path')
      .attr('d', arcGenerator)
      .attr('fill', (d, i) => color(i))  // Use the index `i` for color scale
      .style('opacity', 0.7);

    // Add labels to the pie chart
    svg.selectAll('text')
      .data(formattedData)
      .join('text')
      .text(d => d.data.transaction_to)  // Access the correct field `transaction_to`
      .attr('transform', d => `translate(${arcGenerator.centroid(d)})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px');
  }, [PieData]);

  // Bar Chart rendering logic
  useEffect(() => {
    // Clear previous chart before redrawing
    d3.select(ref.current).selectAll("*").remove();

    // Extract total values and calculate min/max
    let totalValues = data.map((d) => Number(d.total));
    let minVal = Math.min(...totalValues);
    let maxVal = Math.max(...totalValues);

    const x = d3.scaleBand()
      .domain(data.map((d) => d.month))
      .range([margin.left + 15, width - margin.right])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([minVal - 100, maxVal + 100])
      .range([height - margin.bottom, margin.top]);

    const svg = d3.select(ref.current).append("svg").attr("height", height).attr("width", width);

    // X axis
    const xAxis = (g) => g.attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat(d => d));

    // Y axis
    const yAxis = (g) => g.attr("transform", `translate(${margin.left + 20},0)`)
      .call(d3.axisLeft(y));

    const bars = (g) =>
      g.selectAll('rect')
        .data(data)
        .join(
          (enter) => enter.append("rect"),
          (update) => update,
          (exit) => exit.remove()
        )
        .attr("x", (d) => x(d.month))
        .attr("y", (d) => y(d.total))
        .attr("height", (d) => y(minVal) - y(d.total))
        .attr("width", x.bandwidth());

    svg.append("g").call(bars);
    svg.append("g").call(xAxis);
    svg.append("g").call(yAxis);
  }, [data]);

  // Fetch bar chart data
  const barGraphData = async function () {
    try {
      let response = await axios.get('http://localhost:3003/monthlyExpenditureData', {
        params: { bank_account_number: "**1071" }
      });
      setData(response.data.ans);
      setValue("done");
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Fetch pie chart data
  const PieChartData = async function () {
    try {
      let response = await axios.get('http://localhost:3003/pieChartData', {
        params: { bank_account_number: "**1071" }
      });
      setPieData(response.data.ans);
    } catch (error) {
      console.log("Error fetching data"+error);
    }
  };

  return (
    <>
      <div>{value}</div>
      <button onClick={barGraphData}>CLICK FOR MAGIC</button>
      <button onClick={PieChartData}>CLICK FOR PIE CHART</button>
      <div id='barchart' ref={ref}></div>
      <svg id='piechart' ref={pieCharRef}></svg>
    </>
  );
}

export default App;
