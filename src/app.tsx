// import logo from "./logo.svg";
import "./app.css";
import { Board } from "./board.tsx";

import { useEffect, useState } from "preact/hooks";

async function getNewSessionID() {
  const response = await fetch("http://localhost:8080/api/newSession");

  if (!response.ok) {
    throw new Error(`newSession: HTTP error ${response.status}`);
  }
  const sessionID = await response.json();
  console.log(sessionID);
  return sessionID.sessionID;
}

interface SessionDisplayProps {
  sessionID: string;
  newSession: () => void;
}

function SessionDisplay({ sessionID, newSession }: SessionDisplayProps) {
  return (
    <div>
      <p>Session ID: {sessionID}</p>
      <button type="button" onClick={newSession}>
        New Session
      </button>
    </div>
  );
}

export function App() {
  const [sessionID, setSessionID] = useState("");

  // useEffect(() => {
  //   (async () => {
  //     const sessionID = await getNewSessionID();
  //     setSessionID(sessionID);
  //   })();

  //   return () => {
  //     // called when component unmounts
  //   };
  // }, []);

  async function newSession() {
    const sessionID = await getNewSessionID();
    setSessionID(sessionID);
  }

  return (
    <div>
      <Board />
      {/* <SessionDisplay sessionID={sessionID} newSession={() => newSession()} /> */}
    </div>
  );
}
