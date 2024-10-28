import "./App.css";
import InteractiveMap from "./components/InteractiveMap";
import NavBar from "./components/NavBar";
import Home from "./components/Home"
import React, { useRef } from "react";

function App() {
  const links = [
    {id: 1, name: 'Home', ref: useRef()},
    {id: 2, name: 'Services', ref: useRef()},
    {id: 3, name: 'About', ref: useRef()},
    {id: 4, name: 'Contact', ref: useRef()},
  ]

  return (
    <React.Fragment>
      <NavBar links={links} />
      <InteractiveMap />
      <Home ref={links[0].ref} />
    </React.Fragment>
  );
}

export default App;
