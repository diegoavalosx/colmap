import "./App.css";
import About from "./components/About";
import NavBar from "./components/NavBar";
import WhoWR from "./components/WhoWR";
import {useRef} from 'react'

function App() {
  
  const homeRef = useRef<HTMLDivElement | null>(null);
  const whoWeAreRef = useRef<HTMLDivElement | null>(null);
  const whyUsRef = useRef<HTMLDivElement | null>(null);
  const contactRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <NavBar refs = {{homeRef, whoWeAreRef, whyUsRef, contactRef}}/>
      <About refs= {{homeRef, whoWeAreRef, whyUsRef, contactRef}}/>
      <WhoWR />
    </>
  );
}

export default App;
