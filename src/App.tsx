import "./App.css";
import NavBar from "./components/NavBar";
import { useRef } from "react";

function App() {
  const links = [
    { id: 1, name: "Home", ref: useRef() },
    { id: 2, name: "Services", ref: useRef() },
    { id: 3, name: "About", ref: useRef() },
    { id: 4, name: "Contact", ref: useRef() },
  ];

  return (
    <>
      <NavBar links={links} />
    </>
  );
}

export default App;
