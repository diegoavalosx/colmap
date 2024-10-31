import "./App.css";
import About from "./components/About";
import NavBar from "./components/NavBar";
import { useRef } from "react";

function App() {
  const mainRef = useRef<HTMLDivElement | null>(null);
  const whoWeAreRef = useRef<HTMLDivElement | null>(null);
  const whyUsRef = useRef<HTMLDivElement | null>(null);
  const contactRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <NavBar refs={{ mainRef, whoWeAreRef, whyUsRef, contactRef }} />
      <About refs={{ whoWeAreRef, whyUsRef, contactRef, mainRef }} />
    </>
  );
}

export default App;
