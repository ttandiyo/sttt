import React from "react";
// import logo from "./logo.svg";
import "./App.css";
import { Board } from "./Board";

import { useState, useEffect } from "react";

function GetData() {
  const [data, setData] = useState("");
  useEffect(() => {
    // only need to fetch '/home' because of proxy
    fetch("http://localhost:8080/ping")
      .then((res) => res.text())
      .then((data) => setData(data));
  }, [1]);
  return (
    <>
      <div>{data}</div>
    </>
  );
}

function App() {
  return (
    // <div className="App">
    //   <header className="App-header">
    //     {/* <img src={logo} className="App-logo" alt="logo" /> */}
    //     <p>STTT</p>
    //     {/* <a
    //       className="App-link"
    //       href="https://reactjs.org"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       Learn React
    //     </a> */}
    //   </header>

    // </div>
    <div>
      <Board />
      <GetData />
    </div>
  );
}

export default App;
