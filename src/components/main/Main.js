import React, { useState, useEffect } from "react";
import Globe from "./Globe";
import axios from "axios";
import CountUp from "react-countup";
import "./Main.css";

function Main() {
  return (
    <div>
      <h1 id="title">COVID-19 WORLD TRACKER</h1>

      <Globe />
    </div>
  );
}

export default Main;
