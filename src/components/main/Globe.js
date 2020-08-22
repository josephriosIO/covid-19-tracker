import React, { useLayoutEffect, useState, useEffect } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import * as am4maps from "@amcharts/amcharts4/maps";
import axios from "axios";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import CountUp from "react-countup";

import "./Globe.css";
import "./Main.css";

am4core.useTheme(am4themes_animated);
function Globe(props) {
  const [infected, setInfected] = useState(0);
  const [deaths, setDeaths] = useState(0);
  const [recovered, setRecovered] = useState(0);
  const [lastUpdated, setLastUpdated] = useState("");
  const [title, setTitle] = useState("Worldwide");
  const [flag, setFlag] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios(
        "https://corona-virus-stats.herokuapp.com/api/v1/cases/general-stats"
      );

      const data = result.data.data;

      setInfected(Number(data.total_cases.split(",").join("")));
      setDeaths(Number(data.death_cases.split(",").join("")));
      setRecovered(Number(data.recovery_cases.split(",").join("")));
      setLastUpdated(data.last_update);
    };
    fetchData();
  }, []);

  useLayoutEffect(() => {
    let chart = am4core.create("chartdiv", am4maps.MapChart);

    // Set map definition
    chart.geodata = am4geodata_worldLow;

    // Set projection
    chart.projection = new am4maps.projections.Orthographic();
    chart.panBehavior = "rotateLongLat";
    chart.deltaLatitude = -20;
    chart.padding(20, 20, 20, 20);

    // Create map polygon series
    var polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());

    polygonSeries.useGeodata = true;

    // Configure series
    var polygonTemplate = polygonSeries.mapPolygons.template;
    polygonTemplate.tooltipText = "{name}";
    polygonTemplate.fill = am4core.color("#FF6633");
    polygonTemplate.stroke = am4core.color("#000033");
    polygonTemplate.strokeWidth = 0.5;
    polygonTemplate.cursorOverStyle = am4core.MouseCursorStyle.pointer;

    var graticuleSeries = chart.series.push(new am4maps.GraticuleSeries());
    graticuleSeries.mapLines.template.line.stroke = am4core.color("#ffffff");
    graticuleSeries.mapLines.template.line.strokeOpacity = 0.08;
    graticuleSeries.fitExtent = false;

    chart.backgroundSeries.mapPolygons.template.polygon.fillOpacity = 0.1;
    chart.backgroundSeries.mapPolygons.template.polygon.fill = am4core.color(
      "#ffffff"
    );

    // Create hover state and set alternative fill color
    var hs = polygonTemplate.states.create("hover");
    hs.properties.fill = chart.colors.getIndex(0).brighten(-0.5);

    // eslint-disable-next-line
    let animation;
    setTimeout(function () {
      animation = chart.animate(
        { property: "deltaLongitude", to: 100000 },
        20000000
      );
    }, 3000);

    chart.seriesContainer.events.on("down", function () {
      //   animation.stop();
    });

    polygonTemplate.events.on(
      "hit",
      async function (ev) {
        let clickedCountryName = ev.target.dataItem.dataContext.name;

        if (clickedCountryName === "United States") {
          clickedCountryName = "USA";
        }

        if (clickedCountryName === "United Kingdom") {
          clickedCountryName = "UK";
        }

        const results = await axios(
          `https://corona-virus-stats.herokuapp.com/api/v1/cases/countries-search?search=${clickedCountryName}`
        );
        console.log(results.data);
        if (results.data.data.rows.length >= 1) {
          const c = results.data.data.rows[0];

          setTitle(c.country);
          setInfected(Number(c.total_cases.split(",").join("")));
          setDeaths(Number(c.total_deaths.split(",").join("")));
          setRecovered(Number(c.total_recovered.split(",").join("")));
          setLastUpdated(results.data.data.last_update);
          setFlag(c.flag);

          console.log("clicked on ", ev.target.dataItem.dataContext.name);
        } else {
          setTitle("No Data Available");
          setTimeout(function () {
            setTitle("Worldwide");
          }, 3000);
        }
      },
      this
    );

    chart.current = chart;

    return () => {
      chart.dispose();
    };
  }, []);

  return (
    <>
      <div className="box-container">
        <h2>{title} </h2>
        {flag.length > 1 ? <img alt="" id="flag" src={flag} /> : null}

        <div className="box" id="infected">
          <p>Total Infected</p>
          <CountUp end={infected} duration={8} start={0} className="totals" />
        </div>
        <div className="box" id="deaths">
          <p>Total Deaths</p>
          <CountUp end={deaths} duration={8} start={0} className="totals" />
        </div>
        <div className="box" id="recovered">
          <p>Total Recovered</p>
          <CountUp end={recovered} duration={8} start={0} className="totals" />
        </div>
        <p>Last Updated: {lastUpdated}</p>
      </div>
      <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>
    </>
  );
}
export default Globe;
